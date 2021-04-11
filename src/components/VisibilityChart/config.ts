'use strict';

import { round } from "./util";
import { Range, Shading } from "./type";
import { ChartOptions } from "chart.js";

// The hexToDecimal() function only accepts lower case (can make it supports upper case)
export const colors = {
    'blue': rgbString('#41a3d1'),
    'red': rgbString('#cf4e49'),
    'yellow': rgbString('#ced139'),
    'purple': rgbString('#c382d1'),
    'gray': rgbString('#9a9a9a'),
    'orange': rgbString('#ff8e21'),
    'bright': rgbString('#ffee51'),
    'white': rgbString('#ffffff'),
    'black': rgbString('#000000'),
    'white-0': rgbString('#ffffff', 0),
    'blue-0.5': rgbString('#41a3d1', 0.5),
};

export const siteColors = [
    colors['blue'],
    colors['red'],
    colors['yellow'],
    colors['purple'],
    colors['gray'],
    colors['orange'],
    colors['bright']
];

export const shadeColors: string[] = [
    'rgba(103, 121, 138, 0.5)',
    'rgba(136, 159, 181, 0.5)',
    'rgba(177, 204, 230, 0.5)'
];

export function defaultRange(): Range {
    return {
        start: 0,
        stop: 24
    }
}

export function defaultShadings(): Shading[] {
    return [
        {
            min: -18,
            max: -12,
            color: shadeColors[0]
        }, {
            min: -12,
            max: -6,
            color: shadeColors[1]
        }, {
            min: -6,
            max: 0,
            color: shadeColors[2]
        }
    ];
}

export const minEleSettings = {
    borderColor: colors["gray"],
    backgroundColor: colors["white-0"],
    borderWidth: 3,
    lineTension: 0.1,
    pointRadius: 0,
    fill: false,
    showLabel: false
};

export const siteSettings = {
    // borderColor: colors["red"],
    backgroundColor: colors["white-0"],
    borderWidth: 3,
    lineTension: 0.1,
    pointRadius: 0,
    fill: false,
    showLabel: true
};

export const shadeSettings = {
    fill: true,
    borderWidth: 0,
    pointRadius: 0,
    showLabel: false
};

export const chartOptions: () => ChartOptions = () => ({
    legend: {
        labels: {
            filter: function (legendItem: any, data: any): string {
                return data.datasets[legendItem.datasetIndex].showLabel;
            }
        },
    },
    tooltips: {
        mode: "nearest",
        callbacks: {
            title: function () {
                return "";
            },
            label: function (tooltipItem: any): string {
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
                suggestedMin: 0,
                suggestedMax: 24,
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
                    callback: function (value: number): number {
                        return round(value, 2);
                    }
                }
            }
        ]
    }
});

/**
 *  This function takes a string containing a hexadecimal number and return a rgb string represented
 *  by the value of rgb.
 *  @param rgb:     A string containing a hexadecimal number which represents a rgb value.
 *  @param opacity: Opacity of the returned rgb string. Default is 1.
 *  @returns {string}
 */
function rgbString(rgb: string, opacity: number = 1): string {
    const r = hexToDecimal(rgb, 1, 2);
    const g = hexToDecimal(rgb, 3, 4);
    const b = hexToDecimal(rgb, 5, 6);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
}

/**
 *  This function takes a portion of string which contains a hexadecimal number and returns a decimal
 *  number of the same value with the hex number.
 *  @param hex:     The whole string.
 *  @param s:       The starting position of the portion of the string. Inclusive.
 *  @param t:       The ending position of the portion of the string. Inclusive.
 *  @returns {number}
 */
function hexToDecimal(hex: string, s: number, t: number): number {
    let result = 0;
    for (let i = s; i <= t; i++) {
        result <<= 4;
        if (hex[i] >= '0' && hex[i] <= '9') {
            result += hex[i].charCodeAt(0) - '0'.charCodeAt(0);
        } else if (hex[i] >= 'a' && hex[i] <= 'z') {
            result += hex[i].charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        } else {
            result += hex[i].charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        }
    }
    return result;
}