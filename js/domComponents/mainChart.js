class HighchartsChart {
    constructor(containerId, val, seriesOne, valrw, seriesTwo, languageNameSpace, REF) {
      this.containerId = containerId;
      this.val = val;
      this.seriesOne = seriesOne;
      this.valrw = valrw;
      this.seriesTwo = seriesTwo;
      this.languageNameSpace = languageNameSpace;
      this.REF = REF;
  
      // Default chart options
      this.options = {
        chart: {
          // type: 'areasplinerange',
          zoomType: "x",
          resetZoomButton: {
            theme: {
                style: {
                    color: 'white',                     
                  },
                fill: "#0A328E",                              
                stroke: "#0A328E",
                strokeWidth: 1,
                r: 4,
                states: {
                    hover: {
                        fill: '#0A328E',
                        stroke: "#0A328E",
                        strokeWidth: 1,
                        r: 1,
                        style: {
                            color: 'white',
                        }             
                    }
                },
              },

            position: {
              align: 'center',
              verticalAlign: 'top',
            },
          },
          
          panning: true,
          panKey: "shift",
          pinchType: "x",
          style: {
            animation: true,
            duration: 1000,
          },
        },        
          rangeSelector: {
            selected: 1,
          },
          xAxis: {
            type: "category",
            events: {
              setExtremes: function (e) { 
                REF.start = e.min
                REF.end = e.max
              }
            }
          },
          scrollbar: {
            enabled: true,
            // barBackgroundColor: "lightgray",
            // barWidth: 20,
            // barBorderRadius: 7,
            // barBorderWidth: 0,
            // buttonBackgroundColor: "transparent",
            // buttonBorderWidth: 0,
            // buttonBorderRadius: 7,
            // trackBackgroundColor: "none",
            // trackBorderWidth: 1,
            // trackBorderRadius: 8,
            // trackBorderColor: "#CCC",
            // trackHeight: 5,
          },      
          yAxis: {
            title: {
              text: languageNameSpace.labels[REF.unit],
            },
          },
      
          tooltip: {
            useHTML: true,
            formatter: function (e) {
              var points = this.points,i,result = "";
              
              function formatPoint(p, low, high) {        
                return (
                  '<span>' + (p.point && p.point.name ? p.point.name : '') + '</span><br>'
                  + '<span class="tooltiTopValue"><i style="color: #007bff" class="fas fa-arrow-up"></i>' + languageNameSpace.labels["high"] + ': ' + (high ? Highcharts.numberFormat(high, 2, ".") : '') + ' </span><br>'
                  + '<span class="tooltipMainValue">' + p.series.name + ': ' + (p.point && p.point.y ? Highcharts.numberFormat(p.point.y, 2, ".") : '') + ' - ' + (languageNameSpace.labels[REF.unit] ? languageNameSpace.labels[REF.unit] : '') + '</span><br>'
                  + '<span class="tooltiLowValue"><i style="color:red" class="fas fa-arrow-down"></i>' + languageNameSpace.labels["low"] + ': ' + (low ? Highcharts.numberFormat(low, 2, ".") : '') + '</span><br>'
                );
              }
              
              var points = this.points;
              var result = "";
              
              // Check if 'points' array exists and has at least two elements
              if (Array.isArray(points) && points.length >= 2) {
                for (var i = 0; i < points.length; i += 2) {
                  const currentPoint = points[i];
                  const nextPoint = points[i + 1];
              
                  // Check if both currentPoint and nextPoint have the 'point' property
                  if (currentPoint.point && nextPoint.point) {
                    result += formatPoint(
                      currentPoint,
                      nextPoint.point.low,
                      nextPoint.point.high
                    );
                  }
                }
              } else {
                result = languageNameSpace.labels['NODATA']; // Set a default message when 'points' is undefined or doesn't have enough elements
              }
              
              return result;
              
            },     
            crosshairs: true,
            shared: true, 
          },
      
          legend: {
            enabled: REF.dataset == "nrg_cb_pem_RW" ? true: false,
          },
          navigator: {
            enabled: true ,
            enableMouseWheelZoom: true,     
            xAxis: {
              labels: {
                  enabled: false
              }
          }
        },
          plotOptions: {
            series: {
              // showInNavigator: true,
              point: {
                events: {
                    click: function () {
                      REF.selectyear = this.name                    
                      startLoadingAnimation()
                      setTimeout(() => {
                        auxChartIni()
                      }, 700);
                    }
                }
            }
            },
          },
      
          series: [
            {
              name: languageNameSpace.labels['Nrw'],
              data: val,
              type: "spline",
              zIndex: 1,
              color: {
                linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                stops: [
                  [0, '#6190e8'],
                  [1, '#a7bfe8']
                ]
              },
              marker: {
                fillColor: "white",
                lineWidth: 2,
                lineColor:  {
                  linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                  stops: [
                    [0, '#6190e8'],
                    [1, '#a7bfe8']
                  ]
                },
              },
            },
            {
              name: "Range",
              data: seriesOne,
              type: "areasplinerange",
              lineWidth: 0,
              linkedTo: ":previous",
              color: Highcharts.getOptions().colors[0],
              fillOpacity: 0.2,
              zIndex: 0,
              marker: {
                enabled: false,
                color:  {
                  linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                  stops: [
                    [0, '#6190e8'],
                    [1, '#a7bfe8']
                  ]
                },
              },
            },
            {
              name: languageNameSpace.labels['rw'],
              data: valrw,
              type: "spline",
              zIndex: 1,
              color: {
                linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                stops: [
                  [0, '#61e861'],
                  [1, '#bfe8a7']       
                ]
              },
              marker: {
                fillColor: "white",
                lineWidth: 2,
                lineColor:  {
                  linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                  stops: [
                    [0, '#61e861'],
                    [1, '#bfe8a7']
                  ]
                },
              },
            },
            {
              name: "Range",
              data: seriesTwo,
              type: "areasplinerange",
              lineWidth: 0,
              linkedTo: ":previous",
              color: Highcharts.getOptions().colors[3],
              fillOpacity: 0.2,
              zIndex: 0,
              marker: {
                enabled: false,
                color:  {
                  linearGradient: { x1: 0,x2: 0,y1: 0,y2: 1 },
                  stops: [
                    [0, '#61e861'],
                    [1, '#bfe8a7']
                  ]
                },
              },
            },
          ],
          responsive: {
            rules: [
              {
                condition: {
                  maxWidth: 820,
                },
                chartOptions: {
                  "chart": {
                    height: 300,                      
                  }, 
                  credits:{
                    enabled: true,
                  },
                  scrollbar: {
                    enabled: false,
                  },      
                  legend: {
                    enabled: false
                  },     
                  xAxis: {
                    labels: {
                        style: {
                            fontSize:'6px'
                        }
                    }
                },
                yAxis: {
                  title: {
                    style: {
                      fontSize:'6px'
                  }
                  },
                  labels: {
                      style: {
                          fontSize:'6px'
                      }
                  }
              },
                },
              },
            ],
          },
      
          exporting: {
            tableCaption: ''+languageNameSpace.labels[REF.dataset]+'<br>'+languageNameSpace.labels[REF.geo]+'<br>'+languageNameSpace.labels[REF.unit]+'<br>'+languageNameSpace.labels[REF.siec]+'<br>'+languageNameSpace.labels[REF.nrg_bal]+'<br>Source Eurostat',   
      
            chartOptions: {     
              scale: 3, 
                scrollbar: {
                enabled: false
              }, 
              title: {
                text: languageNameSpace.labels[REF.dataset],
              },
              subtitle: {
                text: "<small>" + languageNameSpace.labels[REF.geo] + ' - ' + languageNameSpace.labels[REF.siec] + ' - ' + languageNameSpace.labels[REF.nrg_bal] +"</small>",   
              },
              chart: {
                width: 1000,
                events: {
                  load: function () {
                    this.renderer.image('https://ec.europa.eu/eurostat/statistics-explained/images/0/09/Logo_RGB-POS.png', 900, 10, 60, 25).add();
                  },
                },
        },
              exporting: {
                tableDecimalPoint: ",", // "." or ","
                tableDecimalValue: 2,
              },
            },
            buttons: {
              contextButton: {
                enabled: false
            },
              // contextButton: {
              //   menuItems: [
              //     // "printChart",
              //     // "separator",
              //     "downloadPNG",
              //     "downloadJPEG",
              //     // "downloadPDF",
              //     "downloadSVG",
              //     "separator",
              //     "downloadCSV",
              //     "downloadXLS",
              //     "viewData",
              //     // "openInCloud"
              //   ],
              // },
            },
            menuItemDefinitions: {
              // Custom definition
              viewData: {
                onclick: function () {
                  if (!this.insertedTable) {
                    var div = document.createElement('div');
                    div.className = 'highcharts-data-table';
                    // Insert after the chart container
                    this.renderTo.parentNode.insertBefore(div, this.renderTo.nextSibling);
                    div.innerHTML = this.getTable();
                    this.insertedTable = true;
                    var date_str = new Date().getTime().toString();
                    var rand_str = Math.floor(Math.random() * (1000000)).toString();
                    this.insertedTableID = 'div_' + date_str + rand_str
                    div.id = this.insertedTableID;
                    $('.highcharts-data-table').wrap("<div class='overlay'></div>");
                    $('.highcharts-data-table').append('<a class="print" onclick="tablePrint()"><i class="fad fa-print"></i></a>')
                    $('.highcharts-table-caption').html(
                      languageNameSpace.labels[REF.dataset]
                      + " <br> " + languageNameSpace.labels[REF.geo]
                      + " <br> " + languageNameSpace.labels[REF.unit]
                      + " - " + languageNameSpace.labels[REF.nrg_bal]
                      + " - " + languageNameSpace.labels[REF.siec]
                      )  
                      const cells = document.querySelectorAll('td');
                      cells.forEach(function(cell) {   
                        cell.innerHTML = Highcharts.numberFormat(cell.innerHTML, 3)
                      })
                  } else {
                    $('#' + this.insertedTableID).toggle();
                    $('.highcharts-data-table').wrap("<div class='overlay'></div>");
                    $('.highcharts-data-table').append('<a class="print" onclick="tablePrint()"><i class="fad fa-print"></i></a>')
                  }
                },
              }
            },
          },
      };



    }
  
    // Method to set custom chart options
    setOptions(customOptions) {
      this.options = { ...this.options, ...customOptions };
    }
  

  
    // Method to create and display the chart
    render() {
        Highcharts.chart(this.containerId, this.options, (chart) => {
            // After the chart is rendered, add a custom class to the Reset Zoom button
            const resetButton = chart.toolbar && chart.toolbar.resetZoomButton;
            if (resetButton && resetButton.element) {
              resetButton.element.classList.add("custom-reset-zoom-button");
            }
          });
    }
  }
  

  