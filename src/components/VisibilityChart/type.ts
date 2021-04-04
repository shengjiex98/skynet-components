import { ChartPoint } from "chart.js"

export interface Range {
    start: number;
    stop: number;
};

export interface Target {
    name: string;
    ra: number;
    dec: number;
};

export interface Site {
    name: string;
    lat: number;
    lon: number;
    color: string;
};

export interface SiteCache {
    name: string;
    lat: number;
    lon: number;
    color: string;
    show: boolean;
    data: ChartPoint[];
    shadeData: ChartPoint[][];
};

export interface Shading {
    min: number,
    max: number,
    color: string;
};
