function auxiliarBarGraph() {
  startLoadingAnimation()
  REF.chartId = "barChart";
  auxBarCateg = [];
  auxBarTotals = [];
  bardata = [];
  barMean = []

  const d = chartApiCall();

  const years = d.Dimension("time").id;
  const siecs = d.Dimension("siec").id;

  if (REF.chartOption == 1) {

  year = d.Dimension("time");
  valores = [];
  valores = d.value;
  barMedia = d.value;


  auxBarCateg = years;

val2 = years.map((year, yIdx) => {
values = siecs.map((siec, cIdx) => {
  num = d.value[cIdx * years.length + yIdx];
  
  return num;
}).reduce((a, b) => a + Number(b), 0);	
barMean.push(values);
})

  for (var item in siecs) {
    var i = 0;
    data = [];
    for (var j = 0; j < year.length; j++) {
      if (valores[0] === null) {
        data.push(0);
      } else {
        data.push(valores[0]);
      }
      barMedia.push(d.value[j]);
      valores.shift();
    }
    names = siecs[item];
    valor = data.reduce((a, b) => a + Number(b), 0);
    valor2 = data;
    barobj = {
      name: languageNameSpace.labels[names],
      data: valor2,
  
    };
    bardata.push(barobj);
  }









    
  } else {
    // val2 = years.map((year, yIdx) => {
    //   const values = siecs.map((sic, cIdx) => d.value[yIdx * siecs.length + cIdx]);
    //   const tax = REF.component == 1 ? parseFloat((values.reduce((a, b) => a + Number(b), 0) * factor).toFixed(dec)) : parseFloat((values[0] ));
    //   auxBarCateg.push(languageNameSpace.labels[year]);
    //   auxBarTotals.push([tax]);
    // });


    val2 = years.map((year, yIdx) => {
      values = siecs.map((siecs, cIdx) => {
          num = d.value[cIdx * years.length + yIdx];
          return num;
        }).reduce((a, b) => a + Number(b), 0);
        auxBarCateg.push(year);
        auxBarTotals.push([year, Math.round(values * 100) / 100]);
    });
  }

  const chartTitle = getTitle();

  const tooltipFormatter = function() {
    return REF.chartOption == 1 ? tooltipTable(this.points) : chartNormalTooltip(this.points);
  };

  // const xAxis = REF.chartOption == 1 ? { reversedStacks: true, categories: categoriesAndStacks.map((e) => e.x) } : { categories: auxBarCateg };
  const series = REF.chartOption == 1 ?  bardata : [{ name: "Total", data: auxBarTotals }];
  const catColors = REF.chartOption == 1 ? colors : ["#32afaf"];
  const legend = REF.chartOption == 1 ? {enabled:true} : {enabled:false};

  const chartOptions = {
    containerId: "chart",
    type: "column",
    title: chartTitle,
    subtitle: null,
    xAxis: { categories: auxBarCateg },
    yAxisFormat: "{value:.2f}",
    tooltipFormatter: tooltipFormatter,
    creditsText: credits(),
    creditsHref: "",
    series: series,
    colors:  catColors,
    legend: legend,
    columnOptions: {
      stacking: REF.percentage == 0 ? "normal" : "percent",
      events: {
        mouseOver: function () {
          var point = this;
          var color = point.color;
          $('path.highcharts-label-box.highcharts-tooltip-box').css('stroke', color);
        }
      }
    },
    seriesOptions: ""
  };
    
  const chart = new Chart(chartOptions);
  chart.createChart();

  stopLoadingAnimation()
}
