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
    {
        layer: bastiaLayer,
        center: [9.4244, 42.6935],
        zoom: 11,
        text: "<H2>Omatidie-Dataviz 2022</H2><H3>R.Baggio, D.Grandi, J.B.Filippi</H3>Immobilier Bastiais depuis 2017<br>Rouge: plus plus de 4000 euros/m2)<br>Hauteur max: 18 transactions par hectare <br>Total 2 milliards d'euros<br>403 piscines olympiques de super à 2 euros"
    },
    {
        layer: ajaccioLayer,
        center: [8.7924, 41.9189],
        zoom: 11,
        text: "<H2>Omatidie-Dataviz 2022</H2><H3>R.Baggio, D.Grandi, J.B.Filippi</H3>Immobilier Ajaccien depuis 2017<br>Rouge: plus de 4000 euros/m2)<br>Hauteur max: 25 transactions par hectare <br> Total 3,7 milliards d'euros<br>748 piscines olympiques de super à 2 euros"
    },
    {
        layer: balagneLayer,
        center: [8.759, 42.5494],
        zoom: 11,
        text:  "<H2>Omatidie-Dataviz 2022</H2><H3>R.Baggio, D.Grandi, J.B.Filippi</H3>Immobilier Balanin depuis 2017<br>Rouge: plus de 4000 euros/m2)<br>Hauteur max: 12 transactions par hectare <br> Total 700 millions d'euros<br>154 piscines olympiques de super à 2 euros"
    },
    {
        layer: portoVecchioLayer,
        center: [9.275, 41.587],
        zoom: 11,
        text:  "<H2>Omatidie-Dataviz 2022</H2><H3>R.Baggio, D.Grandi, J.B.Filippi</H3>Immobilier Alta-Rocca depuis 2017<br>Rouge: plus de 4000 euros/m2)<br>Hauteur max: 11 transactions par hectare <br> Total 2,5 milliards d'euros<br>513 piscines olympiques de super à 2 euros"
    }
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

    flying = true;

    // Hide all layers
    for (let obj of layers) {
        obj.layer.setProps({visible: false});
    }

    // Toggle visible the one we want
    const layer = layers[index];
    layer.layer.setProps({visible: true});
    map.flyTo({ center: layer.center, zoom: layer.zoom });

    setInfoText(layer.text)

    currentLayerIndex = index
}

function getLayerInformation(layerId, jsonUrl) {
    return new MapboxLayer({
        type: HexagonLayer,
        id: layerId,
        data: jsonUrl,
        getPosition: d => [d.lng, d.lat],
        radius: 150,
        coverage: 0.9,
        extruded: true,
        getElevationValue: points => points.length,
        elevationRange: [0, 5000],
        elevationScale: 1,
        getColorWeight: point => point.prixM2,
        colorAggregation: 'MEAN',
        colorScaleType: 'quantile',
        colorRange: [
            [77, 146, 33],
            [161, 215, 106],
            [230, 245, 208],
            [253, 224, 239],
            [255, 120, 0],
            [255, 0, 0]
        ],
        pickable: true,
        autoHighlight: true,
        visible: false,
        opacity: 1,
        // onHover: (info) => { console.log(info) }
    });
}
