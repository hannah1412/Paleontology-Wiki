/* HistroFunctions contains reusable functions to format items, used 
when creating and manipulating Histropedia timelines */

/**
 * Format start and end years for item
 * @param {*} item contains information on the item
 * @returns item's start year, end year, start year string prefix, and
 * end year string prefix
 */
export function formatYears(item) {
    let start = item[1].split(' ')
    let end = []

    if (typeof item[2] !== "undefined") {
        end = item[2].split(' ')
    } else {
        end = ["undefined"]
    }

    let sYear = 0
    let eYear = 0
    let sPrefix = start[0]
    let ePrefix = end[0]
    if (start[1] == 'million') {
        sYear = start[0] * 1000000
        sPrefix = sPrefix + 'Ma'
    } else if (start[1] == 'thousand') {
        sYear = start[0] * 1000 
        sPrefix = sPrefix + 'ka'
    } else if (start[1] == 'hundred') {
        sYear = start[0] * 100 
        sPrefix = sPrefix + 'BC'
    } else {
        sYear = start[0]
        sPrefix = sPrefix + 'BC'
    }
    if (end[1] == 'million') {
        eYear = end[0] * 1000000 
        ePrefix = ePrefix + 'Ma BC'
    } else if (end[1] == 'thousand') {
        eYear = end[0] * 1000 
        ePrefix = ePrefix + 'ka BC'
    } else {
        eYear = end[0]
        ePrefix = ePrefix + 'BC'
    }
    return [-sYear, -eYear, sPrefix, ePrefix]
}

/**
 * Format item information for timeline article display
 * @param {*} item contains information on the item
 * @returns the attributes of the item in a nicely formatted object
 */
export function formatItemInfo(item) {
    const startEndPrefix = formatYears(item)
    let itemAttributes = {
        id: item[0].id,
        title: item[0].label,
        subtitle: startEndPrefix[2] + ' to ' + startEndPrefix[3],
        from:{ year: startEndPrefix[0]},
        to: { year: startEndPrefix[1]},
        imageUrl: item[0].imgURL,
    }          
    return itemAttributes
}

/**
 * Deformat time query string into plain English
 * @param {string} timeQueryString the query string
 * @returns the plain English version
 */
export function deformatString(timeQueryString) {
    if (!timeQueryString) {
        return
    }
    let timeString = timeQueryString.split("-01-01")[0]
    let year = Number(timeString)
    let hundred = 100
    let thousand = 1000
    let million = 1000000

    // formats the start and end date 
    if (Math.abs(year) > million) {
        year = ((2024-year)/1000000).toFixed(1)
        year = year.endsWith('.0') ? year.slice(0, -2) : year;
        timeString = year.toString() + " million years ago"
    }
    else if (Math.abs(year) > thousand) {
        year = ((2024-year)/1000).toFixed(1)
        year = year.endsWith('.0') ? year.slice(0, -2) : year;
        timeString = year.toString() + " thousand years ago"
    }
    else if (Math.abs(year) > hundred) {
        year = ((2024-year)/100).toFixed(1)
        year = year.endsWith('.0') ? year.slice(0, -2) : year;
        timeString = year.toString() + " hundred years ago"
    }
    
    return timeString
}