d3.csv('https://raw.githubusercontent.com/filippi/ommatidie/main/scatterSetFoncier.csv', function (err, rows) {
    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }
    var trace1 = {
        x: unpack(rows, 'latitude'),
        y: unpack(rows, 'longitude'),
        z: unpack(rows, 'valeur_fonciere'),
        mode: 'markers',
        marker: {
            size: 12,
            line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
            },
            opacity: 0.8
        },
        type: 'scatter3d'
    };

    var data = [trace1];
    var layout = {
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        showLegend: true
    };

    //layout[:showLegend] = true

    var graphDiv = document.getElementById('myDiv')

    Plotly.newPlot(graphDiv, data, layout);

    var update = {
        scene: {
            camera: {
                center: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                eye: {
                    x: 2,
                    y: 2,
                    z: 0.1
                },
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                }
            }
        },
    };
});