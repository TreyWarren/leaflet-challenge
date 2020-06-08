// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?"
+ "format=geojson"
+ "&starttime=2019-01-01"
// + "&endtime=2020-06-05"
// + "&maxlongitude=-69.52148437"   // USA area
// + "&minlongitude=-123.83789062"
// + "&maxlatitude=48.74894534"
// + "&minlatitude=25.16517337"
+ "&minmagnitude=5.0";

// Begin by creating a function that will create your map //////////////////////////////////////////////////////////
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
  });

  var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [0, 0],
    zoom: 1,
    layers: [lightmap, earthquakes] // ADD ANY OTHER INITIAL LAYERS HERE
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true // false will make it so that it shows at all time
  }).addTo(myMap);
  
  // Set up the legend ////////////////////////////////////////////
  var legend = L.control({ position: "bottomleft" });
  
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5,6,7,8,9];
    var colors = ["white", "#fffbe6","#fff4b3","#ffec80","#ffe44d","gold","orange","red","darkred","black"];
    var labels1 = [];
    var labels2 = [];

    // Add min & max
    var legendInfo = "<h2>Earthquake Magnitude</h2>"

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels1.push(`<li>${limit}-${limit+1}</li>`);
      labels2.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels1.join("") + "</ul>";
    div.innerHTML += "<ul>" + labels2.join("") + "</ul>";
    
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

} /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag.toFixed(1)} <br>
        Location: ${feature.properties.place}</h3>
        <hr>
        <p>${new Date(feature.properties.time)}</p>
        <p><a href="${feature.properties.url}"target="_blank">See more about this earthquake here</a></p>`);
  }

  function pointToLayer(feature, latlng) {
    var fill = "white"
    // var opacity = 1

    if (feature.properties.mag >= 9.0) { // Catastrophic
        fill = "black";
        // opacity = 0.9;
    } else if (feature.properties.mag >= 8.0) { // Great
        fill = "darkred";
        // opacity = 0.8;
    } else if (feature.properties.mag >= 7.0) { // Major
        fill = "red";
        // opacity = 0.7;
    } else if (feature.properties.mag >= 6.0) { // Strong
        fill = "orange";
        // opacity = 0.6;
    } else if (feature.properties.mag >= 5.0) { // Moderate
        fill = "gold";
        // opacity = 0.5;
    } // not going to keep going because I only want to chart the larger earthquakes
    
    var geojsonMarkerOptions = {
        radius: 10**(feature.properties.mag/2)*50, // Richter Scale with multiplier
        fillColor: fill,
        color: "black",
        weight: 0.3,
        fillOpacity: 0.6 // opacity
    };
      
    return L.circle(latlng, geojsonMarkerOptions);
  }
    
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature

  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
} /////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Perform a GET request to the query URL
d3.json(queryUrl, data => createFeatures(data.features));