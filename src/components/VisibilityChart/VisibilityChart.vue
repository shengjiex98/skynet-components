<template>
    <div>
        <canvas :id="'vis-' + chartId"></canvas>
        <p>Chart ID: <strong>{{ chartId }}</strong></p>
        <p>Minimum target elevation: <strong>{{ minEle }}</strong></p>
        <p>Maximum Sun elevation: <strong>{{ maxSun }}</strong></p>
    </div>
</template>

<script>
/**
 * TODO:
 *  (1) More efficient sun shading by delimiters (or only calculating 
 *      Sun elevation once for all shades)
 *  (2) More robust ways to generate site data.
 *  (3) More efficient ways to update site data.
 *  (4) Hover.
 */
import Chart from "chart.js";

import { raDecToAzEl, jdNow, solarRaDec } from "./skynet-astro.ts"
import { fRange } from "./util.js";
import { chartOptions, defaultShadings, minEleSettings, shadeSettings, siteSettings } from './config.js';

export default {
    props: {
        // Required props
        chartId: {
            type: String,
            required: true
        },
        target: {
            type: Object,
            required: true
        },
        sites: {
            type: Array,
            required: true
        },

        // Optional props
        minEle: {
            type: Number,
            default: 30
        },
        maxSun: {
            type: Number,
            default: -18
        },
        shades: {
            type: Array,
            default: () => defaultShadings,
        },
        range: {
            type: Object,
            default: () => ({ start: 0, stop: 24 })
        }
    },
    data: function () {
        return {
            cache: new Map(),
            chart: null,
        };
    },
    computed: {
        xRange: function() {
            return fRange(this.range.start, this.range.stop);
        }
    },
    watch: {
        target: {
            deep: true,
            handler: function() {
                console.log("target changed");
                for (let entry of this.cache) {
                    entry[1].data = this.siteData(entry[1]);
                }
                this.updateChartSites();
                this.chart.update(0);
            }
        },
        sites: {
            deep: true,
            handler: function () {
                console.log("sites changed");
                for (let entry of this.cache) {
                    entry[1].show = false;
                }
                for (let site of this.sites) {
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
                this.updateChartSites();
                this.chart.update(0);

                // // Testing performance by deliberately rebuilding the whole cache.
                // this.buildCache();
                // this.updateChart();
                // this.chart.update(0);
            }
        },

        minEle: function () {
            console.log("minEle changed");
            this.updateChartMinEle();
            this.chart.update(0);
        },
        maxSun: function () {
            console.log("maxSun changed");
            for (let entry of this.cache) {
                entry[1].data = this.siteData(entry[1]);
            }
            this.updateChartSites();
            this.chart.update(0);
        },
        shades: {
            deep: true,
            handler: function () {
                // Recalculate site.shade for each site
                // Delete datasets inside this.chart that is for shading
                // Create more datasets as needed.
                for (let entry of this.cache) {
                    entry[1].shades = this.siteShades(entry[1]);
                }
                this.updateChartShades();
                this.updateChartSites();
                this.chart.update(0);
            }
        },
        range: {
            deep: true,
            handler: function () {
                console.log("range changed");
                this.chart.options.scales.xAxes[0].ticks.suggestedMin = this.range.start;
                this.chart.options.scales.xAxes[0].ticks.suggestedMax = this.range.stop;
                this.buildCache();
                this.updateChart();
                this.chart.update(0);
            }
        }
    },
    methods: {
        /**
         * This function takes a function y = f(x) and generates an array of 
         * data in the form of { x, y } based on the this.xRange.
         */
        generateData(myFunc, ...args) {
            return this.xRange.map(x => ({
                x: x,
                y: myFunc(x, ...args)
            }))
        },
        buildSite(site) {
            return {
                name: site.name,
                lat: site.lat,
                lon: site.lon,
                show: true,
                data: this.siteData(site),
                shades: this.siteShades(site),
                color: site.color
            }
        },
        buildCache() {
            this.cache.clear();
            for (let site of this.sites) {
                this.cache.set(site.name, this.buildSite(site));
            }
        },
        getEle(target, site, jd) {
            return raDecToAzEl(target.ra, target.dec, site.lon, site.lat, jd)[1];
        },
        siteData(site) {
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);
            return this.generateData(
                (x) => this.getEle(solar, site, curJd + x / 24.0) < this.maxSun ?
                    this.getEle(this.target, site, curJd + x / 24.0) : null
            );
        },
        siteShades(site) {
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);
            let shade = [];
            for (let i = 0; i < this.shades.length; i++) {
                shade.push(this.generateData(
                    (x) => {
                        // Cache sun elevation to reduce redundant calculation.
                        let se = this.getEle(solar, site, curJd + x / 24.0);
                        return se >= this.shades[i].min && se <= this.shades[i].max ? 90 : null;
                    }
                ));
            }
            return shade;
        },

        // Updating chart itself
        updateChartMinEle() {
            if (!this.chart.data.datasets[0]) {
                this.chart.data.datasets.push({
                    ...minEleSettings,
                    label: null,
                });
            }
            this.chart.data.datasets[0].data = this.generateData(() => this.minEle);
        },
        updateChartShades() {
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
        },
        updateChartSites() {
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
        },
        updateChart() {
            this.updateChartMinEle();
            this.updateChartShades();
            this.updateChartSites();
        },
        onHover(event, legendItem) {
        // onHover() {
            // if (this.chart.options.legend.lastLegend === legendItem.datasetIndex)
            //     return;
            // this.chart.options.legend.lastLegend = legendItem.datasetIndex;
            // console.log("onenter");
            let id = legendItem.datasetIndex
            let site = this.cache.get(this.chart.data.datasets[id].label);
            for (let i = 0; i < this.shades.length; i++) {
                this.chart.data.datasets[1 + i].data = site.shades[i];
                this.chart.data.datasets[1 + i].hidden = false;
            }
            for (let i = 0; i < this.cache.size; i++) {
                this.chart.data.datasets[1 + this.shades.length + i].hidden = 
                    (1 + this.shades.length + i !== id);
            }
            this.chart.update(0);
        },
        onLeave() {
            // console.log("onleave");
            for (let i = 0; i < this.shades.length; i++) {
                this.chart.data.datasets[1 + i].hidden = true;
            }
            for (let i = 0; i < this.cache.size; i++) {
                this.chart.data.datasets[1 + this.shades.length + i].hidden =
                    !this.cache.get(this.chart.data.datasets[1 + this.shades.length + i].label).show;
            }
            this.chart.update(0);
        }
    },
    mounted: function () {
        console.log("Mounted");

        const ctx = document.getElementById("vis-" + this.chartId);
        this.chart = new Chart(ctx, {
            type: "line",
            options: chartOptions(),
        });
        this.chart.options.legend.onHover = this.onHover;
        this.chart.options.legend.onLeave = this.onLeave;

        this.buildCache();
        this.updateChart();
        this.chart.update(0);
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