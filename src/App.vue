<template>
    <div id="vis-chart">
        <VisibilityChart
            :chartId="chartId"
            :target="target"
            :sites="sites"
            :minEle="minEle"
            :maxSun="maxSun"
            :range="range"
        >
        </VisibilityChart>
        <div>
            <form>
                <div>
                    <p>ID: {{ chartId }}</p>
                    <p>
                        Target <input v-model="target.ra" /> <input v-model="target.dec" />
                    </p>
                    <p>minEle <input v-model="minEle" /></p>
                    <p>maxSun <input v-model="maxSun" /></p>
                </div>
                <div>
                    <p>Range</p>
                    <input v-model="range.start" />
                    <input v-model="range.stop" />
                </div>
                <!-- <input v-model="shades"> -->
                <ul>
                    <li v-for="site of sites" :key="site.name">
                        <label>
                            <input type="checkbox" v-model="site.show" />{{site.name}}
                        </label>
                    </li>
                </ul>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import VisibilityChart from "./components/VisibilityChart/VisibilityChart.vue";
import { siteColors } from "./components/VisibilityChart/config";
import { Range, Target, Site } from "./components/VisibilityChart/type";


@Component({
    components: {
        VisibilityChart,
    },
})
export default class App extends Vue {
    chartId: string = "test";

    minEle: number = 30;
    maxSun: number = -18;
    range: Range = { start: 0, stop: 24 };

    target: Target = { name: "M73", ra: 21, dec: -12.5 };

    sites: Site[] = [
        {
            name: "PROMPT",
            lat: -30.2,
            lon: -70.8,
            color: siteColors[0],
        },
        {
            name: "PROMPT-MO",
            lat: -31.6,
            lon: 117.0,
            color: siteColors[1],
        },
        {
            name: "Morehead",
            lat: 35.9,
            lon: -79.0,
            color: siteColors[2],
        },
    ];
}
</script>

<style scoped>
#vis-chart {
    width: 80%;
    margin: 2em auto;
}
</style>