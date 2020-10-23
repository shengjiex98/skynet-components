<template>
    <div>
        <!-- {{ planetData.options }} -->
        <VisibilityChart 
            :chartId="chartId" 
            :target="target"
            :initialSites="initialSites"
            :options="options"
        >
        </VisibilityChart>
        <div>
            <form>
                <input v-model="chartId">
                <input v-model="options.minEle">
                <input v-model="options.maxSun">
                <input v-model="options.shade">
                <ul>
                    <li v-for="item in showControl" :key="item.name">
                        <label><input type="checkbox" v-model="options.show[item.name]">{{ item.name }}</label>
                    </li>
                </ul>
            </form>
        </div>
    </div>
</template>

<script>
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
            initialSites: [
                {
                    name: "PROMPT",
                    lat: -30.2,
                    lon: -70.8,
                }, {
                    name: "PROMPT-MO",
                    lat: -31.6,
                    lon: 117.0,
                }, {
                    name: "Morehead",
                    lat: 35.9,
                    lon: -79.0,
                }
            ],
            options: {
                minEle: 30,
                maxSun: -18,
                show: {
                    "PROMPT": true,
                    "PROMPT-MO": true,
                    "Morehead": false
                },
                shades: [-18, -12, -6, 0]
            }
        }
    },
    computed: {
        showControl: function() {
            let res = [];
            for (let item in this.options.show) {
                res.push({
                    name: item,
                })
            }
            return res;
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
