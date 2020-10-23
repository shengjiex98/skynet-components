'use strict';

import { round } from "./util.js";

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

export const shadeColors = [
    'rgba(103, 121, 138, 0.5)',
    'rgba(136, 159, 181, 0.5)',
    'rgba(177, 204, 230, 0.5)'
];

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

export const chartOptions = {
    type: "line",
    options: {
        legend: {
            labels: {
                filter: function (legendItem, data) {
                    return data.datasets[legendItem.datasetIndex].showLabel;
                }
            },
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
}

/**
 *  This function takes a string containing a hexadecimal number and return a rgb string represented
 *  by the value of rgb.
 *  @param rgb:     A string containing a hexadecimal number which represents a rgb value.
 *  @param opacity: Opacity of the returned rgb string. Default is 1.
 *  @returns {string}
 */
function rgbString(rgb, opacity = 1) {
    let r = hexToDecimal(rgb, 1, 2);
    let g = hexToDecimal(rgb, 3, 4);
    let b = hexToDecimal(rgb, 5, 6);
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
function hexToDecimal(hex, s, t) {
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