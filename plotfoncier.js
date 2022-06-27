<<<<<<< Updated upstream
function unpackcsv(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

d3.csv('https://raw.githubusercontent.com/filippi/ommatidie/main/scatterSetFoncierMOD.csv', function (err, rows) {
=======
/*d3.csv('https://raw.githubusercontent.com/filippi/ommatidie/main/scatterSetFoncierMOD.csv', function (err, rows) {
    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }
>>>>>>> Stashed changes
    var trace1 = {
        x: unpackcsv(rows, 'latitude'),
        y: unpackcsv(rows, 'longitude'),
        z: unpackcsv(rows, 'valeur_fonciere'),
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
    var trace2 = {
        y: unpackcsv(rows, 'latitude'),
        x: unpackcsv(rows, 'longitude'),
        z: unpackcsv(rows, 'valeur_fonciere'),
        mode: 'markers',
        marker: {
            size: 10,
            line: {
                color: 'rgba(217, 50, 50, 0.14)',
                width: 0.1
            },
            opacity: 0.4
        },
        type: 'scatter3d'
    };
    Global.trace2 = trace2;
    Global.trace1 = trace1;
    




    
    var data = [trace1];
    var layout = {
        
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        plot_bgcolor:"black",
        paper_bgcolor:"black",
        showLegend: false
    };

    //layout[:showLegend] = true

    var graphDiv = document.getElementById('myDiv')

    // Plotly.newPlot(graphDiv, data, layout);

}); */
d3.csv('https://raw.githubusercontent.com/filippi/ommatidie/main/scatterSetFoncierMOD.csv', function (err, rows) {
    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }
    
        Global.datalat = unpack(rows, 'latitude');
        console.log("datalatloaded");
    }
);

d3.csv('https://raw.githubusercontent.com/filippi/ommatidie/main/ajaccio.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

var z_data=[ ]
for(i=0;i<50;i++)
{
  z_data.push(unpack(rows,i));
}
Global.trace2 = {
           z: z_data,
           type: 'surface'
        };
Global.trace1 = {

  z: z_data,
  type: 'surface',
  contours: {
    z: {
      show:true,
      usecolormap: true,
      highlightcolor:"#42f462",
      project:{z: true}
    }
  },

}
var data = [Global.trace1];

var layout = {
  title: 'Ajaccio',
  autosize: true,
  margin: {
    l: 65,
    r: 50,
    b: 65,
    t: 90,
  },
    scene: {
    zaxis: { nticks: 12 }
    }
};

var graphDiv = document.getElementById('myDiv')
Plotly.newPlot(graphDiv, data, layout);
});

