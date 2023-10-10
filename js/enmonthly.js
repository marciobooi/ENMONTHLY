function chartData() {

  REF.chartId = "mainChart"

    var val = []
    var ranges = []
    var valrw= []   

    d = chartApiCall();  

    const emptyResponse = d==null || Object.values(d.value).some(x => (x == null && x == ''))

    if (emptyResponse) {
      nullishChart();
      return
    }

    const time = d.Dimension('time').id;
    const value = d.value;
    const siecs = d.Dimension('siec').id
    
    if(REF.dataset == "nrg_cb_pem_RW"){
      time.forEach((years, yIdx) => {
        let sumNrw = 0;
        let sumRw = 0;
      
        siecs.forEach((siecs, cIdx) => {
          const nums = value[cIdx * time.length + yIdx];      
          if (typeof nums === "number") {
            Nrw.includes(siecs) ? sumNrw += nums : rw.includes(siecs) ? sumRw += nums : null;
          }
        });
      
        if (sumNrw > 1) { 
          val.push([years, sumNrw]);      
          ranges.push(years);  
        }
        if (sumRw > 1 && ranges.includes(years)) { 
          valrw.push([years, sumRw]);       
        }        
      
      });
    } else {
      for (i = 0; i < time.length; i++) {
        if (d.value[i] != null) {       
          num = d.value[i]            
          val.push([d.Dimension("time").id[i], d.value[i] ]);
          ranges.push(d.Dimension("time").id[i]);
        }
      }
    }
   

    const calculateMinMax = (values) => {
      const myranges = {
        '01': { max: null, min: null },
        '02': { max: null, min: null },
        '03': { max: null, min: null },
        '04': { max: null, min: null },
        '05': { max: null, min: null },
        '06': { max: null, min: null },
        '07': { max: null, min: null },
        '08': { max: null, min: null },
        '09': { max: null, min: null },
        '10': { max: null, min: null },
        '11': { max: null, min: null },
        '12': { max: null, min: null },
      };
    
      values.forEach((element) => {
        const month = element[0].substring(5, 7);
        const value = element[1];
    
        if (value > myranges[month].max || myranges[month].max === null) {
          myranges[month].max = value;
        }
        if (value < myranges[month].min || myranges[month].min === null) {
          myranges[month].min = value;
        }
      });
    
      return myranges;
    };
    
    const myranges = calculateMinMax(val);
    const myranges2 = calculateMinMax(valrw);       
    
    const createRangeArray = (ranges, myranges) => {
      const result = [];
      ranges.forEach((element) => {      
        const month = element.substring(5, 7);
        result.push([element, myranges[month].min, myranges[month].max]);
      });
      return result;
    };
    
    const seriesOne = createRangeArray(ranges, myranges);
    const seriesTwo = createRangeArray(ranges, myranges2);

  return { val, valrw, seriesOne, seriesTwo }
}


function enmonthly(d = null) {

  startLoadingAnimation()

  REF.chartId = "mainChart"

  const { val, valrw, seriesOne, seriesTwo } = chartData()

  getTitle()

  const chart = new HighchartsChart("chart", val, seriesOne, valrw, seriesTwo, languageNameSpace, REF);
  chart.setOptions({
    credits: {
      text: credits(),
      href: "",            
    },
    title: {
      text: getTitle(),
    },
  });
  
  chart.render();

  dataNameSpace.setRefURL();

stopLoadingAnimation()

}

function auxChartIni() {  
  addAuxiliarBarGraphOptions()
  createPieChart()
}



