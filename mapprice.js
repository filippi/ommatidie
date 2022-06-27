mapboxgl.accessToken = 'pk.eyJ1IjoiYmF0dGlmaWxpcHBpIiwiYSI6ImNsNHg0cjU4NzA1azIzaXA5MG16d25idWwifQ.QQa9li9WvL7qN-8PTDDN3A';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    // center: [-1.653, 47.225],
    center: [9.4244, 42.6935],
    zoom: 11,
    pitch: 50,
    antialias: true
});

var { MapboxLayer, HexagonLayer, ScatterplotLayer, GridLayer } = deck;

const bastiaLayer = getLayerInformation('bastia', 'https://raw.githubusercontent.com/filippi/ommatidie/main/bastia42d6935x9d4244.json')
const ajaccioLayer = getLayerInformation('ajaccio', 'https://raw.githubusercontent.com/filippi/ommatidie/main/ajaccio41d9189x8d7924.json')
const balagneLayer = getLayerInformation('balagne', 'https://raw.githubusercontent.com/filippi/ommatidie/main/balagne42d5494x8d759.json')
const portoVecchioLayer = getLayerInformation('portoVecchio', 'https://raw.githubusercontent.com/filippi/ommatidie/main/portovek41d587x9d275.json')

let flying = false;
let currentLayerIndex = 0;
const layers = [
    { layer: bastiaLayer, center: [9.4244, 42.6935], zoom: 11 },
    { layer: ajaccioLayer, center: [8.7924, 41.9189], zoom: 11 },
    { layer: balagneLayer, center: [8.759, 42.5494], zoom: 11 },
    { layer: portoVecchioLayer, center: [9.275, 41.587], zoom: 11 }
];

map.on('moveend', function(){
    flying = false;
});

map.once('load', function () {
    map.addLayer(bastiaLayer)
    map.addLayer(ajaccioLayer)
    map.addLayer(balagneLayer)
    map.addLayer(portoVecchioLayer)

    bastiaLayer.setProps({visible: true});
});


function changeMapLocation(index) {

    if (index == currentLayerIndex) return;
    console.log(index)

    flying = true;

    // Hide all layers
    for (let obj of layers) {
        obj.layer.setProps({visible: false});
    }

    // Toggle visible the one we want
    const layer = layers[index];
    layer.layer.setProps({visible: true});
    map.flyTo({ center: layer.center, zoom: layer.zoom });

    console.log(layer)

    currentLayerIndex = index
}

function getLayerInformation(layerId, jsonUrl) {
    return new MapboxLayer({
        type: HexagonLayer,
        id: layerId,
        data: jsonUrl,
        // data: 'https://raw.githubusercontent.com/mastersigat/data/main/csvjson.json',
        getPosition: d => [d.lng, d.lat],
        radius: 500,
        coverage: 0.9,
        extruded: true,
        getElevationValue: points => points.length,
        elevationRange: [0, 100],
        elevationScale: 50,
        getColorWeight: point => point.prix,
        colorAggregation: 'MEAN',
        colorScaleType: 'quantile',
        colorRange: [
            [77, 146, 33],
            [161, 215, 106],
            [230, 245, 208],
            [253, 224, 239],
            [233, 163, 201],
            [197, 27, 125]
        ],
        pickable: true,
        autoHighlight: true,
        visible: false,
        opacity: 1,
        // onHover: (info) => { console.log(info) }
    });
}
