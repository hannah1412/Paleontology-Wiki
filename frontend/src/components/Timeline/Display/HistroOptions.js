'use client';

export default function HistroOptions (w, widthRatio, browserZoomLevel) {
    // Timeline Styling
    const stylesOptions = {
        width: w * widthRatio,
        initialDate: {
            year: 0
        },
        zoom: {
            initial: 72,
            minimum: 0,
            maximum: 123,
            wheelStep: 0.1,
            wheelSpeed: 15,
        },
        style: {
            dateLabel: {
                minor: {
                    font: "normal 10px Calibri",	
                    color: "#333",
                    futureColor: "#ccc",
                    textAlign: "start",
                    offset: {
                        x: 4,
                        y: 0,
                    },
                    yearPrefixes: {
                        ka: { label: "k", value: 1000, minDivision: 1000 },
                        Ma: { label: "M", value: 1e6, minDivision: 1e5 },
                        Ga: { label: "G", value: 1e9, minDivision: 1e8 },
                    },
                },
                major: {
                    font: "normal 16px Calibri",
                    color: "#000",
                    futureColor: "#ccc",
                    textAlign: "start",
                    offset: {
                        x: 4,
                        y: 0,
                    },
                    bceText: " ʙᴄ",
                    yearPrefixes: {
                        ka: { label: "k", value: 1000, minDivision: 1e5 },
                        Ma: { label: "M", value: 1e6, minDivision: 1e6 },
                        Ga: { label: "G", value: 1e9, minDivision: 1e9 },
                    },
                },
            },
        },
        article: {
            distanceToMainLine: 400 / browserZoomLevel
        }
    }
    return stylesOptions
}
