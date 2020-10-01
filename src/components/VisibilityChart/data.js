"use strict";

import { colors } from "./config.js";
import { round } from "./my-math.js";

export const siteData = function () {
    return {
        label: null,
        data: null,
        borderColor: colors["red"],
        backgroundColor: colors["white-0"],
        borderWidth: 3,
        lineTension: 0.1,
        pointRadius: 0,
        fill: false,
        immutableLabel: true,
    };
}

export const initialData = function () {
    return {
        type: "line",
        data: {
            datasets: [
                {
                    label: null,
                    data: null,
                    borderColor: colors["gray"],
                    backgroundColor: colors["white-0"],
                    borderWidth: 3,
                    lineTension: 0.1,
                    pointRadius: 0,
                    fill: false,
                }, {
                    // Shading -18
                    // label: null,
                    data: null,
                    fill: true,
                    borderWidth: 0,
                    pointRadius: 0,
                    backgroundColor: colors["shade-1"]
                }, {
                    // Shading -12
                    // label: null,
                    data: null,
                    fill: true,
                    borderWidth: 0,
                    pointRadius: 0,
                    backgroundColor: colors["shade-2"]
                }, {
                    // Shading -6
                    // label: null,
                    data: null,
                    fill: true,
                    borderWidth: 0,
                    pointRadius: 0,
                    backgroundColor: colors["shade-3"]
                }
            ]
        },
        options: {
            legend: {
                lastLegend: null,
                labels: {
                    filter: function (legendItem) {
                        return legendItem.datasetIndex > 3;
                    }
                },
                onHover: function (event, legendItem) {
                    if (this.chart.options.legend.lastLegend === legendItem.datasetIndex)
                        return;
                    this.chart.options.legend.lastLegend = legendItem.datasetIndex;
                    for (let i = 0; i < 3; i++) {
                        this.chart.data.datasets[i + 1].data = 
                            this.chart.data.datasets[legendItem.datasetIndex].shading[i];
                        this.chart.data.datasets[i + 1].hidden = false;
                    }
                    for (let i = 4; i < this.chart.data.datasets.length; i++) {
                        this.chart.data.datasets[i].hidden = i !== legendItem.datasetIndex;
                    }
                    this.chart.update(0);
                },
                onLeave: function () {
                    this.chart.options.legend.lastLegend = null;
                    for (let i = 0; i < 3; i++) {
                        this.chart.data.datasets[i + 1].hidden = true;
                    }
                    for (let i = 4; i < this.chart.data.datasets.length; i++) {
                        this.chart.data.datasets[i].hidden = false;
                    }
                    this.chart.update(0);
                }
            },
            tooltips: {
                mode: "nearest",
                callbacks: {
                    title: function () {
                        return null;
                    },
                    label: function (tooltipItem) {
                        return "(" + round(tooltipItem.xLabel, 2) + ", " +
                            round(tooltipItem.yLabel, 2) + ")";
                    },
                },
            },
            responsive: true,
            lineTension: 0,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        labelString: "Time from now",
                    },
                    type: "linear",
                    position: "bottom",
                    ticks: {
                        stepSize: 2,
                        min: 0,
                        max: 24,
                    }
                }],
                yAxes: [
                    {
                        type: "linear",
                        ticks: {
                            // beginAtZero: true,
                            // padding: 24,
                            min: 0,
                            max: 90,
                            stepSize: 15,
                        }
                    },
                    {
                        type: "logarithmic",
                        position: "right",
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            reverse: true,
                            min: 1.0,
                            max: 6.0,
                            callback: function (value) {
                                return round(value, 2);
                            }
                        }
                    }
                ]
            }
        }
    };
}

export default initialData;