<template>
    <div>
        <canvas :id="'vis-' + chartId"></canvas>
        <p>Chart ID: <strong>{{ chartId }}</strong></p>
        <p>Minimum target elevation: <strong>{{ minEle }}</strong></p>
        <p>Maximum Sun elevation: <strong>{{ maxSun }}</strong></p>
    </div>
</template>

<script lang="ts">
/**
 * TODO:
 *  (1) More efficient sun shading by delimiters (or only calculating 
 *      Sun elevation once for all shades)
 *  (2) More robust ways to generate site data.
 *  (3) More efficient ways to update site data.
 *  (4) Hover.
 */

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Chart, { ChartLegendLabelItem, ChartPoint } from "chart.js";

import { raDecToAzEl, jdNow, solarRaDec } from "./skynet-astro";
import { fRange } from "./util";
import { chartOptions, defaultShadings, minEleSettings, shadeSettings, siteSettings } from './config';
import { Range, Site, Target, Shading, SiteCache, Coordinate } from "./type";
import { ChartLegendItem } from "chart.js";

@Component
export default class VisibilityChart extends Vue {
    @Prop({required: true}) readonly chartId: string | undefined;
    @Prop({required: true}) readonly target: Target | undefined;
    @Prop({required: true}) readonly sites: Site[] | undefined;
    
    @Prop() readonly minEle: number = 30;
    @Prop() readonly maxSun: number = -18;
    @Prop() readonly shades: Shading[] = defaultShadings;
    @Prop() readonly range: Range = { start: 0, stop: 24 };
    
    cache: Map<string, SiteCache> = new Map<string, SiteCache>();
    chart: Chart | undefined;
    
    get xRange(): number[] {
        return fRange(this.range.start, this.range.stop);
    }
    
    @Watch("target", {deep: true})
    onTargetChanged() {
        console.log("Target changed.");
        for (let entry of this.cache) {
            entry[1].data = this.siteData(entry[1]);
        }
        this.updateChartSites();
        this.chart.update({duration: 0});
    }

    @Watch("sites", {deep: true})
    onSitesChanged() {
        console.log("Sites changed");
        for (let entry of this.cache) {
            entry[1].show = false;
        }
        for (let site of this.sites) {
            // Compare the input site to the cached site data
            let cachedSite = this.cache.get(site.name);
            if (!cachedSite || cachedSite.lat != site.lat || cachedSite.lon != site.lon) {
                // The site didn't exist before or has been modified
                this.cache.set(site.name, this.buildSite(site));
            } else {
                // The site has been created. Just make sure it shows.
                cachedSite.color = site.color;
                cachedSite.show = true;
            }
        }
    }

    @Watch("minEle")
    onMinEleChanged() {
        console.log("Min elevation changed.");
        this.updateChartMinEle();
        this.chart.update({duration: 0});
    }

    @Watch("maxSun")
    onMaxSunChanged() {
        console.log("Max sun elevation changed.");
        for (let entry of this.cache) {
            entry[1].data = this.siteData(entry[1]);
        }
        this.updateChartSites();
        this.chart.update({duration: 0});
    }

    @Watch("shades", {deep: true})
    onShadesChanged() {
        // Recalculate site.shade for each site
        // Delete datasets inside this.chart that is for shading
        // Create more datasets as needed.
        console.log("Shading changed.");
        for (let entry of this.cache) {
            entry[1].shadeData = this.siteShades(entry[1]);
        }
        this.updateChartShades();
        this.updateChartSites();
        this.chart.update({duration: 0});
    }

    @Watch("range", {deep: true})
    onRangeChanged() {
        console.log("Range changed.");
        this.chart.options.scales.xAxes[0].ticks.suggestedMin = this.range.start;
        this.chart.options.scales.xAxes[0].ticks.suggestedMax = this.range.stop;
        this.buildCache();
        this.updateChart();
        this.chart.update({duration: 0});
    }

    /**
     * This function takes a function y = f(x) and generates an array of 
     * data in the form of { x, y } based on the this.xRange.
     */
    generateData(myFunc: (x: number, ...args: any) => number | null, ...args: any) {
        return this.xRange.map(x => ({
            x: x,
            y: myFunc(x, ...args)
        }))
    }

    /**
     * Builds the entire cache for the chart.
     */
    buildCache(): void {
        this.cache.clear();
        for (let site of this.sites) {
            this.cache.set(site.name, this.buildSite(site));
        }
    }

    /**
     * This function takes a Site object and generate additional data to form
     * a cached site object (SiteCache)
     */
    buildSite(site: Site): SiteCache {
        return {
            name: site.name,
            lat: site.lat,
            lon: site.lon,
            color:site.color,

            show: true,
            data: this.siteData(site),
            shadeData: this.siteShades(site),
        }
    }

    /**
     * Calculates the elevation of a target as viewed at a specific site.
     */
    getEle(target: { ra: number, dec: number }, site: Site, jd: number) {
        return raDecToAzEl(target.ra, target.dec, site.lon, site.lat, jd)[1];
    }

    /**
     * This function builds the Coordinate array for a site's visibility line.
     */
    siteData(site: Site | SiteCache): ChartPoint[] {
        const curJd = jdNow();
        const solar = solarRaDec(curJd + 0.5);
        return this.generateData(
            (x) => this.getEle(solar, site, curJd + x / 24.0) < this.maxSun ?
                this.getEle(this.target, site, curJd + x / 24.0) : null
        );
    }

    /** 
     * Generates the data used for shading for each individual site.
     */
    siteShades(site: Site | SiteCache): Coordinate[][] {
        const curJd = jdNow();
        const solar = solarRaDec(curJd + 0.5);
        let shadeData: Coordinate[][] = [];
        for (let i = 0; i < this.shades.length; i++) {
            shadeData.push(this.generateData(
                (x) => {
                    let se = this.getEle(solar, site, curJd + x / 24.0);
                    return se >= this.shades[i].min && se <= this.shades[i].max ? 90 : null;
                }
            ));
        }
        return shadeData;
    }
    
    /**
     * The min elevation line always occupies the 0th dataset
     */
    updateChartMinEle(): void {
        if (!this.chart.data.datasets[0]) {
            this.chart.data.datasets.push({
                ...minEleSettings,
                label: null,
            });
        }
        this.chart.data.datasets[0].data = this.generateData(() => this.minEle);
    }

    /**
     * The datasets for shadings are number from 1 to this.shades.length
     */
    updateChartShades(): void {
        while (this.chart.data.datasets.length > 1) {
            this.chart.data.datasets.pop();
        }
        for (let shade of this.shades) {
            this.chart.data.datasets.push({
                ...shadeSettings,
                label: null,
                backgroundColor: shade.color,
            })
        }
    }

    /**
     * The datasets for the sites are numbered from this.shades.length + 1
     * to this.shades.length + this.sites.length
     */
    updateChartSites(): void {
        while (this.chart.data.datasets.length > 1 + this.shades.length) {
            this.chart.data.datasets.pop();
        }
        for (let entry of this.cache) {
            if (entry[1].show) {
                this.chart.data.datasets.push({
                    ...siteSettings,
                    label: entry[1].name,
                    data: entry[1].data,
                    borderColor: entry[1].color
                });
            }
        }
    }

    updateChart(): void {
        this.updateChartMinEle();
        this.updateChartShades();
        this.updateChartSites();
    }

    onHover(_: any, legendItem: ChartLegendLabelItem): void {
        let id = legendItem.datasetIndex as number;
        let site = this.cache.get(this.chart.data.datasets[id].label as string);
        for (let i = 0; i < this.shades.length; i++) {
            this.chart.data.datasets[1 + i].data = site.shadeData[i];
            this.chart.data.datasets[1 + i].hidden = false;
        }
        for (let i = 0; i < this.cache.size; i++) {
            this.chart.data.datasets[1 + this.shades.length + i].hidden = 
                (1 + this.shades.length + i !== id);
        }
        this.chart.update({duration: 0});
    }

    onLeave(): void {
        for (let i = 0; i < this.shades.length; i++) {
            this.chart.data.datasets[1 + i].hidden = true;
        }
        for (let i = 0; i < this.cache.size; i++) {
            this.chart.data.datasets[1 + this.shades.length + i].hidden =
                !this.cache.get(this.chart.data.datasets[1 + this.shades.length + i].label as string).show;
        }
        this.chart.update({duration: 0});
    }
    
    mounted() {
        console.log("Mounted");

        const ctx = document.getElementById("vis-" + this.chartId) as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: "line",
            options: chartOptions(),
        });
        this.chart.options.legend.onHover = this.onHover;
        this.chart.options.legend.onLeave = this.onLeave;

        this.buildCache();
        this.updateChart();
        this.chart.update({duration: 0});
    }
}
</script>

<style scoped>
    div {
        margin: 2em;
        font-family: Roboto, sans-serif;
        border-style: solid;
        border-color: cadetblue;
    }
</style>