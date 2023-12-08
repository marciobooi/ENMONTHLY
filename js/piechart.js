function createPieChart() {
  startLoadingAnimation()

  REF.chartId = "pieChart";

  hideAuxChartBtns()
  piechartdata()
 
  const chartTitle = getTitle()

  const pieColors = colors   

  const emptyResponse = d==null || Object.values(d.value).some(x => (x == null && x == ''))


  if (emptyResponse) {
    nullishChart();
    return
  }
  
  const seriesOpt = {
    innerSize: "75%",
    showInLegend: true,
    dataLabels: {
      enabled: true,
    },
  };

  const pieOpt = {  
      allowPointSelect: true,
      animation: true,
      cursor: "pointer",
      dataLabels: {
        enabled: true,
        format: "<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>value: {point.y:,.4f} " + languageNameSpace.labels[REF.unit],
      },
  } 
  
  const fullChart = $(window).width() > 700;

  const legendBig = {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
  };
  
  const legendSmall = {     
      layout: 'horizontal'
  }

  const tooltipFormatter = function() {
    return chartNormalTooltip(this.point);
  };

  const chartOptions = {
    containerId: "chart",
    type: "pie",
    title: chartTitle,
    subtitle: null,
    xAxis: null,
    yAxisFormat: "",
    tooltipFormatter: tooltipFormatter,
    creditsText: credits(),
    creditsHref: "",
    series: [
      {
        data: piedata.sort((a, b) => b[1] - a[1]),
        name: "",
      },
    ],
    colors: pieColors,
    legend: fullChart? legendBig : legendSmall,
    pieOptions: pieOpt,
    columnOptions: null,
    seriesOptions: seriesOpt,
  
  };
  
  const chart = new Chart(chartOptions);
  chart.createChart();
  disableChatOptionsBtn(REF.chartId)
  stopLoadingAnimation()

}


function piechartdata() {
  piedata = [];

  d = chartApiCall();

	value = d.value
	siec = d.Dimension("siec").id

			for (var item in siec) {
				for (var value in d.value) {
					if (item === value) {
						piedata.push([languageNameSpace.labels[d.Dimension("siec").id[item]], d.value[value]]);
					}
				}
			}

}
