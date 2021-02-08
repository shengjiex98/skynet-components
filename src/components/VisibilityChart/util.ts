'use strict';

/**
 * This function takes a floating point number and round it to a specified decimal places.
 * 
 * @param value:   The value to be rounded.
 * @param digits:  The decimal places to round the value.
 * @returns {number}
 */
export function round(value: number, digits: number): number {
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}

/**
 * This function returns the square of the input n.
 * @param n:       The input number to be squared.
 * @returns {number}
 */
export function sqr(n: number): number {
    return Math.pow(n, 2);
}

/**
 * This function takes an angle in degrees and returns it in radians.
 * @param degree:  An angle in degrees
 * @returns {number}
 */
export function rad(degree: number): number {
    return degree / 180 * Math.PI;
}

/**
 * This function generates an array with `steps + 1` elements spanning
 * from `start` to `end`. The elements are generally not integers.
 * 
 * @param {number} start    The start of the result array
 * @param {number} end      The end of the resulting array
 * @param {number} steps    The number of steps
 * @returns {Array}
 */
export function fRange(start: number, end: number, steps=500): number[] {
    let data: number[] = [];
    let x: number = start;
    let step: number = (end - start) / steps;
    for (let i = 0; i <= steps; i++) {
        data.push(x);
        x += step;
    }
    return data;
}

export let ArrMath = {
    max: function (arr: number[]): number[] {
        return Math.max.apply(null, arr);
    },
    min: function (arr: number[]): number[] {
        return Math.min.apply(null, arr);
    },
    sum: function (arr: number[]): number {
        return arr.reduce((acc, cur) => acc + cur, 0);
    },
    mean: function (arr: number[]): number {
        return this.sum(arr) / arr.length;
    },
    mul: function (arr1: any, arr2: any): number | number[] {
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            console.assert(arr1.length === arr2.length, 
                "Error: Dimension mismatch when multiplying two arrays.");
            return arr1.map((x, i) => x * arr2[i]);
        } else if (Array.isArray(arr1)) {
            return arr1.map(x => x * arr2);
        } else if (Array.isArray(arr2)) {
            return arr2.map(x => x * arr1);
        } else {
            return arr1 * arr2;
        }
    },
    div: function (arr1: any, arr2: any): number | number[] {
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            console.assert(arr1.length === arr2.length, 
                "Error: Dimension mismatch when dividing two arrays.");
            return arr1.map((x, i) => x / arr2[i]);
        } else if (Array.isArray(arr1)) {
            return arr1.map(x => x / arr2);
        } else if (Array.isArray(arr2)) {
            return arr2.map(x => x / arr1);
        } else {
            return arr1 / arr2;
        }
    },
    add: function (arr1: any, arr2: any): number | number[] {
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            console.assert(arr1.length === arr2.length, 
                "Error: Dimension mismatch when adding two arrays.");
            return arr1.map((x, i) => x + arr2[i]);
        } else if (Array.isArray(arr1)) {
            return arr1.map(x => x + arr2);
        } else if (Array.isArray(arr2)) {
            return arr2.map(x => x + arr1);
        } else {
            return arr1 + arr2;
        }
    },
    sub: function (arr1: any, arr2: any): number | number[] {
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            console.assert(arr1.length === arr2.length, 
                "Error: Dimension mismatch when subtracting two arrays.");
            return arr1.map((x, i) => x - arr2[i]);
        } else if (Array.isArray(arr1)) {
            return arr1.map(x => x - arr2);
        } else if (Array.isArray(arr2)) {
            return arr2.map(x => x - arr1);
        } else {
            return arr1 - arr2;
        }
    },
    dot: function (arr1: any, arr2: any): number | number[] {
        if (arr2 === undefined) {
            return this.dot(arr1, arr1);
        }
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            console.assert(arr1.length === arr2.length, 
                "Error: Dimension mismatch when dot multiplying two arrasy.");
            return arr1.reduce((acc, cur, i) => (acc + cur * arr2[i]), 0);
        } else if (!Array.isArray(arr1) && !Array.isArray(arr2)) {
            return arr1 * arr2;
        } else {
            throw new TypeError("Error: Can't take dot product of a vector and a number");
        }
    },
    cos: function (arr: number[]): number[] {
        return arr.map(x => Math.cos(x));
    },
    sin: function (arr: number[]): number[] {
        return arr.map(x => Math.sin(x));
    },
    var: function (arr: number[]): number {
        // Variance
        let mean = this.mean(arr);
        return this.sum(arr.map(x => Math.pow(x - mean, 2))) / arr.length;
    }
}