<template>
    <div>
        <canvas :id="'vis-' + chartId"></canvas>
        <p>Chart ID: <strong>{{ chartId }}</strong></p>
        <p>Minimum target elevation: <strong>{{ options.minEle }}</strong></p>
        <p>Maximum Sun elevation: <strong>{{ options.maxSun }}</strong></p>
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
import { chartOptions, minEleSettings, shadeColors, shadeSettings, siteColors, siteSettings } from './config.js';

export default {
    props: [ "chartId", "target", "initialSites", "options" ],
    data: function () {
        return {
            xRange: fRange(0, 24),
            chart: null,
            sites: this.initialSites.map(x => ({
                lat: x.lat,
                lon: x.lon,
                name: x.name,
                data: null,
                shade: null,
                color: null,
            })),
            lastShadeId: null,
        };
    },
    computed: {
        siteCount: function () {
            return this.sites.length;
        },
        shadeCount: function () {
            return this.options.shades.length - 1;
        },
    },
    watch: {
        "options.minEle": function () {
            console.log("minEle changed");
            this.updateChartMinEle();
            this.chart.update(0);
        },
        "options.maxSun": function () {
            console.log("maxSun changed");
            for (let site of this.sites) {
                site.data = this.siteData(site);
            }
            this.updateChartSites();
            this.chart.update(0);
        },
        "options.show": {
            handler: function () {
                console.log("Visibility changed");
                this.updateChartSites();
                this.chart.update(0);
            },
            deep: true
        },
        "options.shades": function () {
            // Recalculate site.shade for each site
            // Delete datasets inside this.chart that is for shading
            // Create more datasets as needed.
            
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
        createChart(chartId, chartData) {
            const ctx = document.getElementById("vis-" + chartId);
            return new Chart(ctx, {
                type: chartData.type,
                data: chartData.data,
                options: chartData.options,
            })
        },
        getEle(target, site, jd) {
            return raDecToAzEl(target.ra, target.dec, site.lon, site.lat, jd)[1];
        },
        siteData(site) {
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);
            return this.generateData(
                (x) => this.getEle(solar, site, curJd + x / 24.0) < this.options.maxSun ?
                    this.getEle(this.target, site, curJd + x / 24.0) : null
            );
        },
        siteShade(site) {
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);
            let shade = [];
            for (let i = 0; i < this.shadeCount; i++) {
                shade.push(this.generateData(
                    (x) => {
                        // Cache sun elevation to reduce redundant calculation.
                        let se = this.getEle(solar, site, curJd + x / 24.0);
                        return se >= this.options.shades[i] && se <= this.options.shades[i + 1] ? 90 : null;
                    }
                ));
            }
            return shade;
        },
        updateChartMinEle() {
            this.chart.data.datasets[0].data = this.generateData(() => this.options.minEle);
        },
        updateChartSites() {
            for (let i = 0; i < this.siteCount; i++) {
                if (this.chart.data.datasets[1 + i]) {
                    this.chart.data.datasets[1 + i].data = this.sites[i].data;
                    this.chart.data.datasets[1 + i].hidden = !this.options.show[this.sites[i].name];
                }
            }
        },
        updateChartShades(siteid, enter = true) {
            if (enter) {
                for (let i = 0; i < this.shadeCount; i++) {
                    this.chart.data.datasets[1 + this.siteCount + i].data = this.sites[siteid].shade[i];
                    this.chart.data.datasets[1 + this.siteCount + i].hidden = false;
                }
                for (let i = 0; i < this.siteCount; i++) {
                    this.chart.data.datasets[1 + i].hidden = (i !== siteid);
                }
            } else {
                for (let i = 0; i < this.shadeCount; i++) {
                    this.chart.data.datasets[1 + this.siteCount + i].hidden = true;
                }
                for (let i = 0; i < this.siteCount; i++) {
                    this.chart.data.datasets[1 + i].hidden = !this.options.show[this.sites[i].name];
                }
            }
        },
        updateChart() {
            this.updateChartMinEle();
            this.updateChartSites();
            // this.updateChartShades();
            this.chart.update(0);
        },
        onHover(event, legendItem) {
        // onHover() {
            // if (this.chart.options.legend.lastLegend === legendItem.datasetIndex)
            //     return;
            // this.chart.options.legend.lastLegend = legendItem.datasetIndex;
            // console.log("onenter");
            this.updateChartShades(legendItem.datasetIndex - 1, true);
            this.chart.update(0);
        },
        onLeave(event, legendItem) {
            // console.log("onleave");
            this.updateChartShades(legendItem.datasetIndex - 1, false);
            this.chart.update(0);
        }
    },
    mounted: function () {
        console.log("Mounted");

        let colorCount = 0;
        for (let site of this.sites) {
            site.data = this.siteData(site);
            site.shade = this.siteShade(site);
            site.color = siteColors[colorCount++];
        }

        this.chart = this.createChart(this.chartId, chartOptions);
        this.chart.options.legend.onHover = this.onHover;
        this.chart.options.legend.onLeave = this.onLeave;

        this.chart.data.datasets.push({
            label: null,
            ...minEleSettings
        });
        for (let i = 0; i < this.siteCount; i++) {
            this.chart.data.datasets.push({
                label: this.sites[i].name,
                borderColor: this.sites[i].color,
                ...siteSettings
            })
        }
        for (let i = 0; i < this.shadeCount; i++) {
            this.chart.data.datasets.push({
                label: null,
                backgroundColor: shadeColors[i],
                ...shadeSettings
            })
        }

        this.updateChart();
        console.log(this.chart.data.datasets);
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