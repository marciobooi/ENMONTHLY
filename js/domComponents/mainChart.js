class HighchartsChart {
    constructor(containerId, val, seriesOne, valrw, seriesTwo, languageNameSpace, REF) {
      this.containerId = "chart";
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
          panning: true,
          panKey: "shift",
          pinchType: "x",
          spacingBottom: 70,
          style: {
            fontFamily: 'arial,sans-serif',
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
          yAxis: {
            title: {
              text: languageNameSpace.labels[REF.unit],
            },
            labels: {
              formatter: function() {
                  return Highcharts.numberFormat(this.value, 0, '.', ' ');
              }
          }
          },
      
          tooltip: {
            useHTML: true,
            formatter: function () {
                var points = this.points;
                var tableContent = '';
        
                // Helper function to create a table row
                function createTableRow(label, value, iconColor) {
                    return (
                        `<tr>
                        <td class="">${label}</td>
                        <td class=""style="color:${iconColor}">${value}</td>
                        </tr>`
                    );
                }
        
                // Check if 'points' array exists and has at least two elements
                if (Array.isArray(points) && points.length >= 2) {
                    // Add title row with the key
                    tableContent += `<tr>
                    <th class="" colspan="1">${points[0].key ? points[0].key : ''}</th>
                    <th class="" colspan="1">${REF.unit}</th>
                    </tr>`;
        
                
        
                    for (var i = 0; i < points.length; i += 2) {
                        const currentPoint = points[i];
                        const nextPoint = points[i + 1];
        
                        // Check if both currentPoint and nextPoint have the 'point' property
                        if (currentPoint.point && nextPoint.point) {
                            tableContent += createTableRow(
                                languageNameSpace.labels["HIGH"],
                                nextPoint.point.high ? Highcharts.numberFormat(nextPoint.point.high, 2, ".") : '',
                                '#007bff' // Blue color for high value
                            );
                            tableContent += createTableRow(
                              REF.dataset === "nrg_cb_pem_RW" ? currentPoint.series.name : languageNameSpace.labels["VALUES"],
                                currentPoint.point.y ? Highcharts.numberFormat(currentPoint.point.y, 2, ".") : '',
                                'black'
                            );
                            tableContent += createTableRow(
                                languageNameSpace.labels["LOW"],
                                nextPoint.point.low ? Highcharts.numberFormat(nextPoint.point.low, 2, ".") : '',
                                'red' // Red color for low value
                            );
                        }
                    }
                } else {
                    // Set a default message when 'points' is undefined or doesn't have enough elements
                    tableContent = '<tr><td colspan="2">' + languageNameSpace.labels['NODATA'] + '</td></tr>';
                }
        
                // Wrap the content in a table
                return '<table  class="table_component">' + tableContent + '</table>';
            },
            padding: 0,
            crosshairs: true,
            shared: true,
        },
        
      
          legend: {
            enabled: REF.dataset == "nrg_cb_pem_RW" ? true: false,
          },
          credits: {
            enabled: false,
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
              name: languageNameSpace.labels['nrw'],
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
              name: languageNameSpace.labels["RANGE"],
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
              name: languageNameSpace.labels["RANGE"],
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
            filename: "Enegy Monthly - " + REF.geos,
            enabled: false,
            allowHTML: true,
            sourceWidth: 1200,
            sourceHeight: 800,
            scale: 1,
            chartOptions: {
              subtitle: null,
              credits:"",
              chart: {
                marginTop: 100,
                marginLeft: 100,
                marginRight: 100,
                events: {
                  load: function () {                  
                    this.renderer.image(
                      'https://ec.europa.eu/eurostat/statistics-explained/images/0/09/Logo_RGB-POS.png', 
                      1100, 
                      750, 
                      90, 
                      50
                    ).add();
                  },
                  redraw: function () {
                    const chart = this;
                    const images = chart.container.getElementsByTagName('image');
                    if (images.length > 0) {
                      images[0].setAttribute('x', chart.chartWidth - 100);
                      images[0].setAttribute('y', chart.chartHeight - 40);
                    }
                  }
                }
            } 
            },
          }
      
       
      };



    }
  
    // Method to set custom chart options
    setOptions(customOptions) {
      this.options = { ...this.options, ...customOptions };
    }
    
    destroy() {
      const existingChart = Highcharts.charts.find(chart => chart.renderTo.id === this.containerId);
      if (existingChart) {
          existingChart.destroy();
      }
  }

  
    // Method to create and display the chart
    render() {        
      Highcharts.chart(this.containerId, this.options, (chart) => {
          // Enable screen reader accessibility
          enableScreenREader()
  
          // Check if the chart toolbar and resetZoomButton are available
          if (chart && chart.toolbar && chart.toolbar.resetZoomButton) {
              // After the chart is rendered, add a custom class to the Reset Zoom button
              const resetButton = chart.toolbar.resetZoomButton.element;
              if (resetButton) {
                  resetButton.classList.add("custom-reset-zoom-button");
              }
          }

          // Render custom credits after chart is created
          setTimeout(() => {
            this.renderCustomCredits();
          }, 1000);
      });
  }

  renderCustomCredits() {
    const creditsText = credits();
    if (!creditsText) {
      return;
    }

    const container = document.getElementById('chart');
    if (!container) {
      return;
    }

    const regionId = 'chart-credits-region';
    let creditsWrapper = document.getElementById(regionId);

    if (!creditsWrapper) {
      creditsWrapper = document.createElement('div');
      creditsWrapper.id = regionId;
      creditsWrapper.className = 'chart-credits-region';

      if (container.parentNode) {
        container.parentNode.insertBefore(creditsWrapper, container.nextSibling);
      } else {
        container.appendChild(creditsWrapper);
      }
    }

    // Use role="note" for chart-level supplementary info to avoid nested page-level landmarks
    creditsWrapper.setAttribute('role', 'note');
    creditsWrapper.setAttribute('aria-label', 'Chart credits');
    creditsWrapper.setAttribute('aria-live', 'polite');
    creditsWrapper.innerHTML = creditsText;

    const link = creditsWrapper.querySelector('a');
    if (link) {
      link.setAttribute('tabindex', '0');
      link.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          link.click();
        }
      });
    }
  }
  }
  

  