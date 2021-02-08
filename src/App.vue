<template>
    <div>
        <!-- {{ planetData.options }} -->
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
                    <!-- <p>ID <input v-model="chartId"></p> -->
                    <p>ID: {{ chartId }}</p>
                    <p>Target <input v-model="target.ra"> <input v-model="target.dec"></p>
                    <p>minEle <input v-model="minEle"></p>
                    <p>maxSun <input v-model="maxSun"></p>
                </div>
                <div>
                    <p>Range</p>
                    <input v-model="range.start">
                    <input v-model="range.stop">
                </div>
                <!-- <input v-model="shades"> -->
                <ul>
                    <li v-for="site of siteList" :key="site.name">
                        <label><input type="checkbox" v-model="site.show">{{ site.name }}</label>
                    </li>
                </ul>
            </form>
        </div>
    </div>
</template>

<script>
// import { shadeColors } from "./components/VisibilityChart/config.ts";
import { siteColors } from "./components/VisibilityChart/config.ts";
import VisibilityChart from "./components/VisibilityChart/VisibilityChart.vue";

export default {
    name: 'App',
    data: function () {
        return {
            chartId: "test",
            target: {
                name: "M73",
                ra: 21,
                dec: -12.5
            },
            minEle: 30,
            maxSun: -18,
            range: {
                start: 0,
                stop: 24,
            },
            siteList: [
                {
                    name: "PROMPT",
                    lat: -30.2,
                    lon: -70.8,
                    color: siteColors[0],
                    show: true,
                }, {
                    name: "PROMPT-MO",
                    lat: -31.6,
                    lon: 117.0,
                    color: siteColors[1],
                    show: true,
                }, {
                    name: "Morehead",
                    lat: 35.9,
                    lon: -79.0,
                    color: siteColors[2],
                    show: true,
                }
            ]
        }
    },
    computed: {
        // showControl: function() {
        //     let res = [];
        //     for (let item in this.options.show) {
        //         res.push({
        //             name: item,
        //         })
        //     }
        //     return res;
        // }
        sites: function () {
            return this.siteList.filter(x => x.show);
        }
    },
    components: {
        VisibilityChart,
    }
}
</script>

<style scoped>
    div {
        width: 80%;
        margin: 2em auto;
    }
</style>
