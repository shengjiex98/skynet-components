<template>
    <div>
        <!-- {{ planetData.options }} -->
        <VisibilityChart 
            :chartId="chartId" 
            :target="target"
            :sites="sites"
            :options="options"
        >
        </VisibilityChart>
        <div>
            <form>
                <input v-model="chartId">
                <input v-model="options.minEle">
                <input v-model="options.maxSun">
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
            sites: [
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
            }
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
