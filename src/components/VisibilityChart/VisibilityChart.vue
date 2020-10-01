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
import { siteData, initialData } from "./data.js";
import { fRange } from "./my-math.js";
import { colors } from './config';

export default {
    props: [ "chartId", "target", "sites", "options" ],
    data: function () {
        return {
            xRange: fRange(0, 24),
            chart: null,
        };
    },
    computed: {
        minEleFunc: function () {
            return () => this.options.minEle;
        },
    },
    watch: {
        "options.minEle": function () {
            console.log("minEle watcher");
            this.chart.data.datasets[0].data = this.generateData(
                () => this.options.minEle
            );
            this.chart.update(0);
        },
        "options.maxSun": function () {
            for (let i = 4; i < this.chart.data.datasets.length; i++) {
                let lat = this.sites[i - 4].lat;
                let lon = this.sites[i - 4].lon;
                let curJd = jdNow();
                let solar = solarRaDec(curJd + 0.5);

                this.chart.data.datasets[i].data = this.generateData(
                    (x) => (
                        raDecToAzEl(solar[0], solar[1], lon, lat, curJd + x / 24.0)[1] < this.options.maxSun ?
                            raDecToAzEl(this.target.ra, this.target.dec, lon, lat, curJd + x / 24.0)[1] : null
                    )
                );
                this.chart.update(0);
            }
        }
    },
    methods: {
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
        drawSite(site, color) {
            const lat = site.lat;
            const lon = site.lon;
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);

            let data = this.generateData(
                (x) => (
                    raDecToAzEl(solar[0], solar[1], lon, lat, curJd + x / 24.0)[1] < this.options.maxSun ?
                        raDecToAzEl(this.target.ra, this.target.dec, lon, lat, curJd + x / 24.0)[1] : null
                )
            );

            let newSite = siteData();
            newSite.data = data;
            newSite.label = site.name;
            newSite.borderColor = color;
            newSite.shading = this.shadeSun(site);

            // console.log(site);
            // console.log(data);

            this.chart.data.datasets.push(newSite);
            this.chart.update(0);
        },
        shadeSun(site) {
            const lat = site.lat;
            const lon = site.lon;
            const curJd = jdNow();
            const solar = solarRaDec(curJd + 0.5);

            let sunEle = (x) => (
                raDecToAzEl(solar[0], solar[1], lon, lat, curJd + x / 24.0)[1]
            );
            const shades = [-18, -12, -6, 0];
            let shading = [];
            for (let i = 0; i < 3; i++) {
                shading.push(this.generateData(
                    (x) => sunEle(x) >= shades[i] && sunEle(x) <= shades[i + 1] ? 
                        90 : null
                ));
            }
            return shading;
        }
    },
    mounted: function () {
        console.log("Mounted");
        this.chart = this.createChart(this.chartId, initialData());
        this.chart.data.datasets[0].data = this.generateData(
            () => this.options.minEle
        );
        
        let palette = [];
        for (const color in colors) {
            palette.push(colors[color]);
        }
        let colorIndex = 0;
        for (const site of this.sites) {
            this.drawSite(site, palette[colorIndex++]);
        }

        this.shadeSun(this.sites[0]);
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