'use client';

/**
 * Exports information on each relevant geological time period 
 * @returns a list of objects, each object representing 1 period
 */
export default function PeriodArticles() {
    const periodArticles = [
        {
            id: 100,
            title: "Cambrian",
            subtitle: "540Ma to 488Ma BC",
            from: { year: -540000000 },
            to: { year: -488000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 101,
            title: "Ordivician",
            subtitle: "488Ma to 444Ma BC",
            from: { year: -488000000 },
            to: { year: -444000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 102,
            title: "Silurian",
            subtitle: "444Ma to 416Ma BC",
            from: { year: -444000000 },
            to: { year: -416000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 103,
            title: "Devonian",
            subtitle: "416Ma to 359Ma BC",
            from: { year: -416000000 },
            to: { year: -359000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 104,
            title: "Carboniferous",
            subtitle: "359Ma to 299Ma BC",
            from: { year: -359000000 },
            to: { year: -299000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 105,
            title: "Permian",
            subtitle: "299Ma to 251Ma BC",
            from: { year: -299000000 },
            to: { year: -251000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 106,
            title: "Triassic",
            subtitle: "251Ma to 202Ma BC",
            from: { year: -251000000 },
            to: { year: -202000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 107,
            title: "Jurassic",
            subtitle: "202Ma to 146Ma BC",
            from: { year: -202000000 },
            to: { year: -146000001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 108,
            title: "Cretaceous",
            subtitle: "146Ma to 65.5Ma BC",
            from: { year: -146000000 },
            to: { year: -65500001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 109,
            title: "Tertiary",
            subtitle: "65.5Ma to 2.6Ma BC",
            from: { year: -65500000 },
            to: { year: -2600001 },
            style: {
                color: '#bbe6f3',
            }
        },
        {
            id: 110,
            title: "Quanternary",
            subtitle: "2.6Ma BC to 2024 AD",
            from: { year: -2600000 },
            to: { year: 2024 },
            style: {
                color: '#bbe6f3',
            }
        },
    ]
    return periodArticles
}