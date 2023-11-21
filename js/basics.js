var log = console.log.bind(console);

var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 850 || /Mobi|Android/i.test(navigator.userAgent) && (window.innerWidth < window.innerHeight);

formMessage = (/The ENMONTHLY tool is down since:     (.*)/)

// function to openMeta link when press the link btn
function openMeta() {	
  window.open("https://ec.europa.eu/eurostat/cache/metadata/en/nrg_quant_esms.htm");	
}

 orderByPiles = (countriesAndValues, x, y) => {
  const categories = Object.values(x).map(country => languageNameSpace.labels[country]);
  const fuelTypes = Object.values(y).map(fuel => languageNameSpace.labels[fuel]);

  const mySeries = fuelTypes.map((fuel, i) => ({
    name: fuel,
    data: countriesAndValues[i].data.map(element => element)
  }));

  const categoriesAndPiles = categories.map((name, index) => ({
    name,
    piles: mySeries.map(serie => ({
      name: serie.name,
      value: serie.data[index]
    }))
  }));

  categoriesAndPiles.sort((a, b) => {
    const sumA = a.piles.reduce((sum, pile) => sum + pile.value, 0);
    const sumB = b.piles.reduce((sum, pile) => sum + pile.value, 0);
    return sumB - sumA;
  });

  const myXAxis = categoriesAndPiles.map(category => category.name);

  mySeries.forEach(serie => {
    serie.data = categoriesAndPiles.map(category => category.piles.find(pile => pile.name == serie.name).value);
  });

  return {
    myXAxis,
    mySeries
  };
};


 makeOrderedSeries = (categoriesAndStacks) => {
  const ordSeries = [];

  bardata = REF.chartId == "lineChart" ? linedata : bardata;

  for (let i = 0; i < categoriesAndStacks[0].y.length; i++) {
    const temp = categoriesAndStacks.map(category => category.y[i]);
    ordSeries.push({
      index: bardata[i].index,
      name: bardata[i].name,
      legendIndex: bardata[i].legendIndex,
      id: bardata[i].id,
      data: temp
    });
  }

  const [temp] = ordSeries.splice(1, 1);
  ordSeries.push(temp);

  return ordSeries;
};



   
function printChart() { $("#chart").highcharts().print()};
function exportPngChart() { $("#chart").highcharts().exportChart()};
function exportJpegChart() { $("#chart").highcharts().exportChart({type: 'image/jpeg'})};
function exportPdfChart() { $("#chart").highcharts().exportChart({type: 'application/pdf'})};
function exportSvgChart() { $("#chart").highcharts().exportChart({type: 'image/svg+xml'})};

function exportXlsChart() { $("#chart").highcharts().downloadXLS()};
function exportCsvChart() { $("#chart").highcharts().downloadCSV()};


function mailContact() {
  document.location = "mailto:ESTAT-ENERGY@ec.europa.eu?subject=ENERGY%20PRICES%20CONTACT&body=" +
  encodeURIComponent(window.location.href);
}

function exportTable() {
  window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('.highcharts-data-table').html()));
}

function addAuxiliarBarGraphOptions() {
  const auxiliarBarGraphOptions = new ChartControls();
  auxiliarBarGraphOptions.addToDOM("#subnavbar-container"); 
}
function removeAuxiliarBarGraphOptions() {
  const auxiliarBarGraphOptions = new ChartControls();
  auxiliarBarGraphOptions.removeFromDOM(); 
  hideAuxChartBtns()
  enmonthly()
}
function showAuxChartBtns() {
	// document.getElementById("togglePercentage").style.display = showHideValue;
  $("#toggleDetails").css('display', "initial")
  // document.getElementById("toggleRenuewbles").style.display = showHideValue;
}
function hideAuxChartBtns() {
  $("#togglePercentage").css('display', "none")
  $("#toggleRenuewbles").css('display', "none")
  $("#toggleDetails").css('display', "none")
  document.getElementById("tb-togle-details").innerHTML = agregateIcon();
  REF.percentage = 0
  REF.chartOption = 0
}

function sortArrayAlphabetically() {
  if (REF.detail == 1) {
    categoriesAndStacks.sort((a, b) => a.x.localeCompare(b.x));
  } else {
    bardata.sort((a, b) => a.name.localeCompare(b.name, undefined, { ignorePunctuation: true, sensitivity: 'base' }));
  }
}

function sortArrayByAscValues(arr) {
  if (REF.detail == 1) {
    arr.sort((a, b) => {
      const sumA = a.y.reduce((acc, val) => acc + val, 0);
      const sumB = b.y.reduce((acc, val) => acc + val, 0);
      return sumA - sumB;
    });
  } else {
    arr.sort((a, b) => a.y % 2 - b.y % 2 || a.y - b.y);
  }
}

function sortArrayByDescValues(arr) {
  if (REF.detail == 1) {
    arr.sort((a, b) => {
      const sumA = a.y.reduce((acc, val) => acc + val, 0);
      const sumB = b.y.reduce((acc, val) => acc + val, 0);
      return sumB - sumA;
    });
  } else {
    arr.sort((a, b) => b.y % 2 - a.y % 2 || b.y - a.y);
  }
}

function sortArrayByProtocolOrder(arr) {
  if (REF.detail == 1) {
    const energyCountriesCodes = REF.geos;
    arr.sort((a, b) => {
      if (a.code === "all") return -1; // Move "all" to the beginning
      if (b.code === "all") return 1; // Move "all" to the beginning
      return energyCountriesCodes.indexOf(a.code) - energyCountriesCodes.indexOf(b.code);
    });
    orderedSeries = makeOrderedSeries(categoriesAndStacks);
  } else {
    barproto = [];
    bardata = barproto;

    log(bardata);

    const geosProto = REF.geos.filter(geop => geop !== "all"); // Ignore "all" in REF.geos

    geosProto.map((geop, gIdx) => {
      geos.map((geo, yIdx) => {
        if (geop == geo && geop !== "all") {
          values = tax.map((tax, cIdx) => {
            return (num = arr.value[cIdx * geos.length + yIdx]);
          });
        }
      });

      const taxValue = REF.component == 1
        ? parseFloat((values.reduce((a, b) => a + Number(b), 0) * factor).toFixed(dec))
        : parseFloat((values[0] * factor).toFixed(dec));

      barcateg.push(languageNameSpace.labels[geop]);

      const languageLabel = languageNameSpace.labels[geop];
      const color = geop == "EU27_2020" ? '#14375a' : (geop == "EA" ? '#800000' : "#32afaf");

      barproto.push({ name: languageLabel, y: taxValue, color });
    });
  }
}



function chartNormalTooltip(points) {
  const value = Highcharts.numberFormat(points[0].y, 4);
  const unit = `${languageNameSpace.labels[REF.unit]}`;
  const na = languageNameSpace.labels['FLAG_NA'];
  const title = REF.chartId==="mainChart" ?  points[0].key : points[0].x
  return this.y == 0 ? `<b>${title}<br>Total: <b>${na}</b>` : `<b>${title}<br>Total: <b>${value}</b> ${unit}`;
}

function tooltipTable(points) {
  if(REF.percentage == 1 ){
    let html = "";
    html += `<table id="tooltipTable" class="table">                
                <thead>
                  <tr>
                    <th scope="cols">${points[0].x}</th>                    
                    <th scope="cols"></th>                    
                  </tr>
                </thead>`
      points.forEach(element => {
          const value = element.point.percentage.toFixed(0); // Limit decimals to three places
          const category = element.point.series.name; 
          const color = element.point.color;              
          html += `<tr>
                      <td><svg width="10" height="10" style="vertical-align: baseline;"><circle cx="5" cy="5" r="3" fill="${color}" /></svg> ${category}</td>
                      <td>${value} %</td>
                  </tr>` 
      });
    html += `</table>`;
    return `<div>${html}</div>`;
  } else {
  let html = "";
  let totalAdded = false; // Flag to track if total row has been added
  let totalColor = "#7cb5ec"
  
  // Sort the points so that "Total" item is at the last place
  const sortedPoints = points.slice().sort(function (a, b) {
    if (a.series.name == languageNameSpace.labels['TOTAL']) return 1;
    if (b.series.name == languageNameSpace.labels['TOTAL']) return -1;
    return 0;
  });
  html += `<table id="tooltipTable" class="table">                
                <thead>
                  <tr>
                    <th scope="cols">${sortedPoints[0].key}</th>                    
                    <th scope="cols"></th>                    
                  </tr>
                </thead>`;
  sortedPoints.forEach(function (point) {
    const color = point.series.color;
    const value = point.y.toFixed(2); // Limit decimals to three places
    const category = point.series.name;    
    
    html += `<tr>
                <td><svg width="10" height="10" style="vertical-align: baseline;"><circle cx="5" cy="5" r="3" fill="${color}" /></svg> ${category}</td>
                      <td>${value}</td>
                  </tr>` 
    
    
    


    // Check if point is "Total" and set the flag if found
    if (category == languageNameSpace.labels['TOTAL']) {
      totalAdded = true;
    }
  });

  // Add a row for the total if not already added
  if (!totalAdded) {
    // Calculate the total sum of all values
    const totalSum = sortedPoints.reduce(function (sum, point) {
      return sum + point.y;
    }, 0);

    // Format the total sum with three decimal places
    const totalValue = totalSum.toFixed(2);

    // Add a row for the total
    html += `<tr>
                      <td><svg width="10" height="10" style="vertical-align: baseline;"><circle cx="5" cy="5" r="3" fill="${totalColor}" /></svg> ${languageNameSpace.labels['TOTAL']}</td>
                      <td>${totalValue}</td>
  </tr>`
    
    
    
   
  }

  html += `</table>`;

  return `<div>${html}</div>`;
  }
}

function getTitle() {
  const country = languageNameSpace.labels[REF.geos];
  const geoLabel = languageNameSpace.labels[REF.chartGeo];
  const time = REF.selectyear;
  const dataset = languageNameSpace.labels[REF.dataset];
  const nrg_bal = languageNameSpace.labels[REF.nrg_bal];  
  const unit = languageNameSpace.labels[REF.unit];  

  let title = ""
  let subtitle = ""

  let chartTitle = "";
  switch (REF.chartId) {
    case "lineChart":
      chartTitle = `${dataset}<br><span style="font-size:10px; padding-top:5px">${geoLabel} - ${consoms}</span>`;
      title = `${dataset}`;
      subtitle = `<span style="font-size:12px; padding-top:5px">${geoLabel} - ${consoms}</span>`;
      break;
    case "pieChart":
      chartTitle = `${country} - ${dataset}<br><span style="font-size:10px; padding-top:5px">${nrg_bal} - ${country}</span>`;
      title = `${dataset}`;
      subtitle = `<span style="font-size:12px; padding-top:5px">${country} - ${time} - ${nrg_bal}</span>`;
      break;
    case "barChart":
      chartTitle = `${dataset}<br><span style="font-size:12px; padding-top:5px">${country} - ${unit} - ${nrg_bal}  - ${languageNameSpace.labels["total"]}</span>`;
      title = `${dataset}`;
      subtitle = `<span style="font-size:12px; padding-top:5px">${country} - ${unit} - ${nrg_bal}  - ${languageNameSpace.labels["total"]}</span>`;
      break;
    default:    
    chartTitle = `${country} - ${dataset}<br><span style="font-size:10px; padding-top:5px">${nrg_bal} - ${languageNameSpace.labels['rwTitle']}</span>`;
    title = `${country} - ${dataset}`;
    if(REF.dataset == "nrg_cb_pem_RW") {
      subtitle = `${nrg_bal} - ${languageNameSpace.labels['rwTitle']}`;   
    } else {
      subtitle = `${nrg_bal} - ${time}`;   
    }
    
  }

  $("#title").html(title);
  $("#subtitle").html(subtitle);

  return chartTitle;
}

function credits() {
  const dataset = REF.dataset === "nrg_cb_pem_RW" ? "nrg_cb_pem" : REF.dataset;
  const chartCredits = `<span style="font-size: .75rem;">${languageNameSpace.labels["CREDITS"]} - </span>
  <a style="color:blue; text-decoration: underline; font-size: .75rem;"
  href="https://ec.europa.eu/eurostat/databrowser/view/${dataset}/default/table?lang=${REF.language}">${languageNameSpace.labels['DB']}</a>,
  <span style="font-size: .875rem;">                           
</span>`;

  return chartCredits
}


function chartApiCall() {
  const dataset = REF.dataset === "nrg_cb_pem_RW" ? "nrg_cb_pem" : REF.dataset;
  const siecs = codesDataset[REF.dataset].siec     
  
  let url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + dataset + "?";
  url += "format=JSON";
  url += "&lang=" + REF.language;

  switch (REF.chartId) {
    // case "lineChart":
    //   url += (REF.component == 1? REF.nrg_prc.map(prc => "&nrg_prc=" + prc).join("") : REF.taxs.map(tax => "&tax=" + tax).join(""));
    //   url += (!REF.component ? "&product=" + REF.product + "&unit=" + REF.unit : "");
    //   url += "&nrg_cons=" + REF.consoms;
    //   url += "&currency=" + REF.currency;
    //   url += "&geo=" + REF.chartGeo;
    //   break;
    case "pieChart":
			url += "&geo=" + REF.geos;
			url += "&unit=" + REF.unit;
			url += "&time=" + REF.selectyear;
			for (let i = 0; i < siecs.length; i++) {
				if(siecs[i] != "TOTAL") url += "&siec=" + siecs[i]
			}
      if(dataset != "nrg_cb_pem") {url += "&nrg_bal=" + REF.nrg_bal}
      break;
    case "barChart":
			url += "&geo=" + REF.geos;
			url += "&unit=" + REF.unit;			
      if(dataset != "nrg_cb_pem") {url += "&nrg_bal=" + REF.nrg_bal}
      if(dataset == "nrg_cb_pem"){
        if(REF.siecsToLoad == "rw") {          
          for (let i = 0; i < rw.length; i++) {url += "&siec=" + rw[i]}
        } else if(REF.siecsToLoad == "Nrw") {
          for (let i = 0; i < Nrw.length; i++) {url += "&siec=" + Nrw[i]}
        } 
      } else {
        for (let i = 0; i < siecs.length; i++) {if(siecs[i] != "TOTAL") url += "&siec=" + siecs[i]}
      }
      break;  
    default:      
        url += "&geo=" + REF.geos;       
        url += "&unit=" + REF.unit;
        if(REF.dataset == "nrg_cb_pem_RW") {
          for (let i = 0; i < Nrw.length; i++) {url += "&siec=" + Nrw[i]}
          for (let i = 0; i < rw.length; i++) {url += "&siec=" + rw[i]} 
        } else if(REF.dataset == "nrg_cb_pem") {             
          url += "&siec=" + REF.siec;
        } else {
          url += "&nrg_bal=" + REF.nrg_bal;
          url += "&siec=" + REF.siec;
        }
      break;
  }

  const request = new XMLHttpRequest();
  request.open("GET", url, false); // Setting the third parameter to 'false' makes it synchronous
  request.send();

  if (request.status === 500 || request.status === 503) {
    // submitFormDown();
  }

  if (request.status !== 200) {
    // submitFormDown();
  }

  const data = JSON.parse(request.responseText);
  const d = JSONstat(data).Dataset(0);
  return d;
}

function startLoadingAnimation() {
  $('#loader').css('display', 'flex')
}
function stopLoadingAnimation() {
  $('#loader').css('display', 'none')
}

function agregateIcon() {
  const iconHTML = `
  <span class="agregates fa-stack fa-rotate-180" style="font-size: .9rem; position: absolute; top: 8px;">
    <i class="fa fa-square fa-stack-1x" style="top: .0em; left: .0em; color: white;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .2em; left: .2em; color: #0a328e;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .2em; left: .2em; color: transparent;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .3em; left: .3em; color: white;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .5em; left: .5em; color: #0a328e;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .5em; left: .5em; color: transparent;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .6em; left: .6em; color: white;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .8em; left: .8em; color: #0a328e;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .8em; left: .8em; color: transparent;"></i>
    <i class="fa fa-square fa-stack-1x" style="top: .9em; left: .9em; color: white;"></i>
  </span>
`;
return iconHTML;
}

function nonagregateIcon() {
  const iconHTML = `
      <span class="nonAgregates fa-stack fa-rotate-180" style="font-size: .9rem;position: absolute;top: 4px;">
        <i class="fa fa-square fa-stack-1x" style="top: .0em;left: .0em;color: white;"></i>
        <i class="fa fa-square fa-stack-1x" style="top: .2em;left: .2em;color: #0a328e;"></i>
        <i class="fa fa-square fa-stack-1x" style="top: .2em;left: .2em;color: transparent;"></i>
        <i class="fa fa-square fa-stack-1x" style="top: .3em;left: .3em;color: white;"></i>
      </span>`;
return iconHTML;
}

function chartToDisplay(d) { 

  if(REF.chartId == "mainChart") {
    enmonthly(d)  
  }
  if(REF.chartId == "pieChart") {
    createPieChart();
  }
  if(REF.chartId == "barChart") {
    auxiliarBarGraph();
  }
  if(REF.chartId == "lineChart") {
    createLineChart();
  }

}



function toggleBtns() {
  $('#chartDetails').toggle()
  
}


function enableScreenREader(params) {
	const titleElement = document.querySelector("text.highcharts-title")
	if (titleElement) {
	  titleElement.setAttribute('aria-hidden', 'false');
	}
  
	// Find and update the subtitle element
	const subtitleElement = document.querySelector('text.highcharts-subtitle');
	if (subtitleElement) {
	  subtitleElement.setAttribute('aria-hidden', 'false');
	}

	const container = document.querySelector(".highcharts-root")

	container.removeAttribute('aria-hidden');
  }