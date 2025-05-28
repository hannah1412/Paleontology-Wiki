import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { useState, useEffect, useContext, useRef, React, Fragment } from "react";
import styles from "./CSS/LeafletMap.module.css"
import L from "leaflet";
import { BACKEND_URL } from "./MapPage";
import SearchBar from "./SearchBar";
import { ThemeContext } from "@/store/ThemeContextProvider";



// Continent icon attributes
//<a href="https://www.freevector.com/continental-icons-vector-24924">FreeVector.com</a>
var continentIcon = L.Icon.extend({
  options: {
    iconSize: [125, 125],
    iconAnchor: [50, 50],
    popupAnchor: [20, 10]
  }
});

// Country icon attributes
var countryIcon = L.Icon.extend({
  options: {
    iconSize: [30, 17.5],
    iconAnchor: [0, 0],
    popupAnchor: [20, 10],


  }
});

// Fossil icon attributes
var FossilIcon = L.Icon.extend({
  options: {
    iconSize: [30, 30],
    iconAnchor: [0, 0],
    popupAnchor: [20, 10]
  }
});


/// SEARCH BAR DATA /// 

/**
 * Parses query response into a country information object.
 * @param {JSON} data - Response from back-end api.
 * @param {Object} country - Object containing current information client has on a country.
 * @returns Object - Represents a country.
 */
function searchBarData(data) {
  let countryArr = [];
  data.map((country) => {
    const countryInfo = {
      id: country.id,
      flag: country.flag,
      name: country.name,
      coordinatesArr: country.coordinatesArr
    }
    countryArr.push(countryInfo)
  })
  return countryArr;
}


/// FOSSIL FUNCTIONS ///

/**
 * Parses the data retrieved from our api to
 * reates a map of discovery locations (key) to array of fossils (value) in a discovery location.
 * @param {JSON} data Response from query
 * @returns Map - Map of discovery locations => fossil array
 */
function parseFossilsByCountry(data) {
  var fossilData = new Map();

  // Request was invalid.
  if (data == null) {
    return fossilData;
  }

  // Loops through each fossil retrieved from wikidata.
  for (let key in data) {
    let record = data[key]; // Gets fossil record from data.

    // Parsing string of coordinates into integer values.
    let coordinates = record.coordinates.value.match(/-?\d+.\d+/g);

    // Fetches fossil image from record if the 'image' attribute exists.
    let fossilImage = ""; // Blank otherwise
    if (Object.hasOwn(record, "image")) {
      fossilImage = record.image.value;
    }

    // Attrbiutes of the query become attributes of a fossil object.
    // ?fossil ?fossilLabel ?discoveryLocation ?discoveryLocationLabel ?coordinates
    const fossil = {
      fossilId: record.fossil.value.split("/")[record.fossil.value.split("/").length - 1],
      fossilLabel: record.fossilLabel.value,
      discoveryLocation: record.discoveryLocation.value.split("/")[record.discoveryLocation.value.split("/").length - 1],
      discoveryLocationLabel: record.discoveryLocationLabel.value,
      description: record.description.value,
      image: fossilImage,
      coordinatesArr: [parseFloat(coordinates[1]), parseFloat(coordinates[0])]
    }
    // Adds fossil to the array associated with its corresponding discovery location.
    var fossilArray = fossilData.get(fossil.discoveryLocation); // Gets current array of fossil objects.
    if (fossilArray == null) {
      fossilArray = [];
    }
    fossilArray.push(fossil); // Adds current fossil.
    fossilData.set(fossil.discoveryLocation, fossilArray); // Updates array in map.

  }
  return fossilData;
}

/**
 * Performs a request to our back-end API to fetch fossils discovered within a country.
 * @param {String} id - Country where fossils were found.
 * @param {*} map - Visual map to plot fossils on.
 * @param {Function} setCountry - Sets country state for information panel.
 * @param {Function} setDiscoveryLocation - State discovery location state for information panel.
 */
function fetchFossils(id, map, setCountry, setDiscoveryLocation) {

  // Sends query to our API to fetch fossils from wiki data.
  fetch(BACKEND_URL + '/countryfossils?country=' + id)
    .then((response) => {
      if (response.status == 400) { // Bad request error.
        return null;
      } else {
        // Parses query data to json
        return response.json();
      }

    }) //organises it by discovery location within a country and then plots the data.
    .then((data) => {
      let fossilData = parseFossilsByCountry(data);
      plotDiscoveryLocations(fossilData, map, setCountry, setDiscoveryLocation);
    })
    .catch((err) => console.log(err))
}

/// DISCOVERY LOCATION FUNCTIONS ///

/**
 * Plots each discovery location on the map.
 * @param {Map} discoveryMap - Map containing discovery location to fossils in that location mapping.
 * @param {*} map - Visual map to plot points on.
 * @param {*} setCountry - Function to set country state for information panel.
 * @param {*} setDiscoveryLocation - Function to set discovery location state for information panel.
 */
function plotDiscoveryLocations(discoveryMap, map, setCountry, setDiscoveryLocation) {
  //Plots each discovery location.
  // Iterates through each key-value pairs, where key is the discovery location and value is fossils, extracting only values
  for (let [_, fossils] of discoveryMap) {
    plotDiscoveryLocation(fossils, map, setCountry, setDiscoveryLocation)
  }
}

/**
 * Plots a discovery location on the map
 * @param {Array} fossils - Array of fossils, discovered at location
 * @param {*} map - Visual map to plot points on
 * @param {*} setCountry - Function to set country state for information panel
 * @param {*} setDiscoveryLocation - Function to set discovery location state for information panel
 * @returns 
 */
function plotDiscoveryLocation(fossils, map, setCountry, setDiscoveryLocation) {

  // Unlikely situation of discovery location has no fossil.
  if (fossils[0] == null) {
    return;
  }

  // Extracts discovery location info from first fossil (All have the same location).
  let discoveryLocation = fossils[0].discoveryLocation;
  let discoveryLocationLabel = fossils[0].discoveryLocationLabel;
  let coordinates = fossils[0].coordinatesArr;

  // Icon for discovery locations taken from: https://commons.wikimedia.org/wiki/File:Map_marker_icon_%E2%80%93_Nicolas_Mollet_%E2%80%93_Fossils_%E2%80%93_Nature_%E2%80%93_iphone.png
  var iconImg = new FossilIcon({ iconUrl: 'img/fossilIcon.png' });

  // Creates a marker using the discovery location's coordinates, with the pop up being the locations name and QID (hover over).
  var marker = L.marker(coordinates, { icon: iconImg }).bindPopup(discoveryLocationLabel);


  // Adds marker to map + functionality.
  marker.addTo(map)
    .on("mouseover", function (event) { // Hover Over //
      marker.openPopup();
    }).on("mouseout", function (event) { // Stop Hovering // 
      marker.closePopup();
    }).on("click", function (event) { // Click //
      fetchDiscoveryLocationInfo(fossils, setDiscoveryLocation, setCountry); // Displays discovery location info.
    })
}

/// COUNTRY INFO FUNCTIONS ///

/**
 * Performs a request to our back-end API to fetch additonal information on a country.
 * @param {Object} country - Object containing current information client have on a country.
 * @param {*} setCountry - Function to set country state for information panel.
 */
function fetchCountryInfo(country, setCountry) {

  // Sends query to our API to fetch additonal information on a country.
  fetch(BACKEND_URL + '/countryinfo?country=' + country.id)
    .then((response) => {
      if (response.status == 400) { // Bad request error.
        return null;
      } else {
        return response.json();
      }

    })
    // Displays country info on information panel by updating state of country.
    .then((data) => {
      setCountry((parseCountryInfo(data, country))); // Updates state for the country to be displayed on information panel.
    })
    .catch((err) => console.log(err))
}

/**
 * Parses query response into a country information object.
 * @param {JSON} data - Response from back-end api.
 * @param {Object} country - Object containing current information client has on a country.
 * @returns Object - Represents a country.
 */
function parseCountryInfo(data, country) {

  // Request was invalid.
  if (data == null) {
    return country;
  }

  let record = data[0]; // Gets first country listed (quick workaround to recieving multiple records for a single country query).

  // No records in wikidata response.
  if (record == null) {
    return country; // Returns known information.
  }

  // Object that represents information that can be displayed about a country.
  const countryDisplay = {
    id: country.id,
    name: country.name,
    coordinatesArr: country.coordinatesArr,
    flag: country.flag,
    description: record.description.value,
    capital: record.capitalLabel.value,
    continent: record.continentLabel.value,
    currency: record.currencyLabel.value,
    area: record.area.value,
    population: record.population.value
  }
  return countryDisplay;
}

/// DISCOVERY LOCATION INFO FUNCTIONS ///

/**
 * Performs a request to our back-end API to fetch additonal information on a discovery location
 * @param {Array} fossils - Fossils found at discovery location
 * @param {*} setDiscoveryLocation - Function to set discovery location state for information panel
 * @param {*} setCountry - Function to set country state for information panel
 */
function fetchDiscoveryLocationInfo(fossils, setDiscoveryLocation, setCountry) {

  // Sends query to our API to fetch discovery location information from wiki data.
  fetch(BACKEND_URL + '/locationinfo?location=' + fossils[0].discoveryLocation)
    .then((response) => {
      if (response.status == 400) { // Bad request error.
        return null;
      } else {
        return response.json();
      }

    })
    .then((data) => {
      //Updates states so information panel component changes
      setDiscoveryLocation((parseDiscoveryInfo(data, fossils))); // Updates state for the discovery location to be displayed on information panel.
      setCountry(null); // Sets country state to null so there is no clash with displaying country + discovery location.
    })
    .catch((err) => console.log(err))
}

/**
 * Parses query response into a discovery location object.
 * @param {JSON} data - Response from back-end api.
 * @param {Array} fossils - Fossils at a location.
 * @returns Object - Discovery location.
 */
function parseDiscoveryInfo(data, fossils) {

  // Creates an default object based on data from first fossil in list.
  const defaultInfo = {
    id: fossils[0].discoveryLocation,
    name: fossils[0].discoveryLocationLabel,
    description: "A discovery location",
    fossils: fossils
  }

  // Request was invalid.
  if (data == null) {
    return defaultInfo;
  }

  // First description retrieved from wiki data.
  let record = data[0];

  if (record == null) {
    return defaultInfo; // Default description if no description on wikiData.
  }

  // Returns default object with updated description.
  return {
    id: fossils[0].discoveryLocation,
    name: fossils[0].discoveryLocationLabel,
    description: record.description.value,
    fossils: fossils
  }


}

/// COUNTRY PLOTTING ///

/**
   * Plots the flag markers of each country on the map.
   * @param {Object} country - Data associated with a country.
   * @param {*} map - Visual map to plot markers on.
   */
function plotCountry(country, map, setCountry, setDiscoveryLocation) {
  let id = country.id;

  // Creates an icon using the country's flag.
  let flag = country.flag;
  var iconImg = new countryIcon({ iconUrl: flag });

  // Sets the markers location to the latlong of the country, with the popup being its name.
  let countryName = country.name;
  let coordinates = country.coordinatesArr;
  var marker = L.marker(coordinates, { icon: iconImg }).bindPopup(countryName);

  // Adds marker to map + functionality.
  marker.addTo(map).on("click", function (event) {

    // Functions to call when the marker is clicked.
    fetchFossils(id, map, setCountry, setDiscoveryLocation);
    fetchCountryInfo(country, setCountry);
  }
    // Displays country name only when hovering over flag.
  ).on("mouseover", function (event) { // Hover Over //
    marker.openPopup();
  }).on("mouseout", function (event) { // Stop Hovering // 
    marker.closePopup();
  })
}


/// CONTINENT PLOTTING ///

/**
   * Plots the markers of each continent on the map.
   * @param {*} map - Visual map to plot markers on.
   */
function plotContinents(map, theme, setCoords, setZoom, setZoomThreshold) {
  var continentArr = [];


  const continents = [
    ['Africa', [7.1881, 21.0938]],
    ['Asia', [48.8566, 103.6750]],
    ['Europe', [54.5259, 15.2551]],
    ['North America', [54.5260, -105.2551]],
    ['Australia', [-25.2744, 133.7751]],
    ['South America', [-14.2350, -51.9253]]
  ];

  continents.map((continent) => {

    /*let iconImg = new continentIcon({ iconUrl: 'img/' + continent[0]  + '.png' }); */
    const continentIconUrl = theme === 'dark' ? 'img/' + continent[0] + ' Dark.png' : 'img/' + continent[0] + '.png';

    let iconImg = new continentIcon({ iconUrl: continentIconUrl });
    let marker = L.marker(continent[1], { icon: iconImg });

    marker.on("mouseover", function (event) { // Hover Over //
      marker.openPopup();
    }).on("mouseout", function (event) { // Stop Hovering // 
      marker.closePopup();
    }).on("click", function (event) { // Zoom into Continent //
      setCoords(continent[1]);
      setZoom(3.6);
      setZoomThreshold(prevThreshold => prevThreshold + 1);
    })
    continentArr.push(marker);
  })

  let continentLayer = L.layerGroup(continentArr);
  continentLayer.addTo(map)
}

// Function component for the Map.
const LeafletMap = ({ hidden, data, setCountry, setDiscoveryLocation }) => {

  const [searchData, setSearchData] = useState(null);
  const [zoomThreshold, setZoomThreshold] = useState(0); // Even: Continents, Odd: Countries
  const [coords, setCoords] = useState([0, 0]);
  const [zoom, setZoom] = useState(2);
  const { theme } = useContext(ThemeContext);

  // Creates a persistent value for the map.
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {


    if (!mapContainerRef.current) return;
    // Check if a map instance already exists
    if (mapInstanceRef.current) {
      // If it exists, remove it and create a new one
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Sets boundaries for the map.
    let southWest = L.latLng(-90, -190);
    let northEast = L.latLng(90, 190);
    let bounds = L.latLngBounds(southWest, northEast);

    // Map starts centred at slightly zoomed. 
    const map = L.map(mapContainerRef.current, {
      maxZoom: 12,
      minZoom: 2,
      maxBounds: bounds,
      maxBoundsViscosity: 1,
      zoomControl: false,
      attributionControl: false
    }).setView(coords, zoom).on('zoomend', function () {
      //Centres Map and zooms out
      let currentZoom = map.getZoom();
      let currCords = [map.getCenter().lat, map.getCenter().lng];


      if (currentZoom <= 3.5) { // Zoomed out to continents, must be even threshold
        if (zoomThreshold % 2 != 0) setZoomThreshold(prevThreshold => prevThreshold + 1); // If not even, set to even
        setCountry(null); setDiscoveryLocation(null); // Reset info panel on zoom out
      } else {
        if (zoomThreshold % 2 == 0) setZoomThreshold(prevThreshold => prevThreshold + 1); // If not odd, set to odd
      }
      setCoords(currCords);
      setZoom(currentZoom);
    });

    //Allows the map to properly be resized
    const mapDiv = document.getElementById("mapContainer")
    const resizeObserver = new ResizeObserver(() => {

      try {
        map.invalidateSize();
      } catch (error) {
        console.log("Resizing too fast")
      }

    });

    //Checks if map was resized
    resizeObserver.observe(mapDiv)

    L.control.zoom({
      position: 'topright',
    }).addTo(map);

    L.control.attribution({
      position: 'topleft',
    }).addTo(map);

    //Adds text to make resize clearer
    L.Control.Watermark = L.Control.extend({
      onAdd: function (map) {
        var text = L.DomUtil.create('h2');

        text.textContent = "Drag to resize";
        

        return text;
      },

      onRemove: function (map) {
        // Nothing to do here
      }
    });

    L.control.watermark = function (opts) {
      return new L.Control.Watermark(opts);
    }

    L.control.watermark({ position: 'bottomright' }).addTo(map);

    // Base map layer is an empty map.
    L.tileLayer('http://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      position: 'bottomleft'
    }).addTo(map);




    mapInstanceRef.current = map;

    // Plots the initial countries on the map.
    if (data != null) {
      setSearchData(searchBarData(data))
      if (zoomThreshold % 2 == 0) {
        plotContinents(map, theme, setCoords, setZoom, setZoomThreshold, zoomThreshold);
      } else {
        data.map((country) => {
          plotCountry(country, map, setCountry, setDiscoveryLocation);
        })
      }
    }

    console.log(zoomThreshold + "thresh")

  }, [data, zoomThreshold, theme]);


  // Returns the map and search bar in a div
  return (
    <Fragment>
      {searchData && <SearchBar data={searchData} fetchCountryInfo={fetchCountryInfo} setCountry={setCountry} setCoords={setCoords} setZoom={setZoom} setZoomThreshold={setZoomThreshold} zoomThreshold={zoomThreshold} />}
      {!hidden ? <div className={styles["mapContainer"]} id="mapContainer">
        <div className={styles["map"]} ref={mapContainerRef}></div>
      </div>
      :
      <div className={styles["mapContainer_hidden"]} id="mapContainer">
        <div className={styles["map"]} ref={mapContainerRef}></div>
      </div>}
    </Fragment>
  );
};
export default LeafletMap;