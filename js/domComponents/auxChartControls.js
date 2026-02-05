class ChartControls {
	constructor() {
	  this.controls = document.createElement("div");
  
	  const select = document.createElement("select");
	  // select.id = REF.chartId;
	  select.classList.add("form-select", "mx-2");
	  select.setAttribute("aria-label", "Select flow");
  
	  const notMobileContent = `
		<div class="container-fluid">
		  <nav aria-label="Chart controls" id="chartControls" class="navbar navbar-expand-sm navbar-light bg-light navChartControls">
			<div class="container-fluid">
			  <div id="auxChartTitle">
				<h2 id="title" class="title auxTitle"></h2>
					<h3 id="subtitle" class="subtitle auxSubtitle"></h3>>
			  </div>
			  <div class="menu">
				<div id="chartBtns"  aria-label="options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
					<div class="groupOne">
						<li class="nav-item button px-1" id="toggleBarChart" role="none"></li>
						<li class="nav-item button px-1" id="togglePieChart" role="none"></li>
					</div>  
					<div class="groupTwo">
						<li class="nav-item px-1" id="togglePercentage" role="none"></li>
						<li class="nav-item px-1" id="toggleRenuewbles" role="none"></li>
						<li class="nav-item px-1" id="toggleDetails" role="none"></li>
						<li class="nav-item px-1" id="toggleTable" role="none"></li>
					</div>  
					<div class="groupTree">
						<li class="nav-item button px-1" id="printChart" role="none"></li>
						<li class="nav-item dropdown px-1" id="downloadChart" role="none"></li>
						<li class="nav-item button px-1" id="downloadExcel" role="none"></li>
						<li class="nav-item button px-1" id="embebedChart" role="none"></li>
						<li class="nav-item button px-1" id="closeChart" role="none"></li>
					</div>  
				</div>
			  </div>
			</div>
		  </nav>
		</div>`;
  
	  const mobileContent = /*html*/`
		<div id="chartOptions">
		  <div class="col-12 subNavOne auxChartbtn">
		  <button id="tools" class="btnGroup pe-2" type="button" data-i18n-label="TOOLS" data-i18n-title="TOOLS" aria-haspopup="true">
		  <i class="fas fa-ellipsis-h"></i>
		  <span class="iconText" data-i18n="TOOLS"></span>
		</button>
		
			<div class="menu d-none">
			  <ul id="chartBtns"  aria-label="options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
				
			 	<li class="nav-item button px-1" id="toggleBarChart" role="none"></li>
				<li class="nav-item button px-1" id="togglePieChart" role="none"></li>


				<li class="nav-item px-1" id="togglePercentage" role="none"></li>
				<li class="nav-item px-1" id="toggleRenuewbles" role="none"></li>
				<li class="nav-item px-1" id="toggleDetails" role="none"></li>
				<li class="nav-item px-1" id="toggleTable" role="none"></li>
				
				<li class="nav-item button px-1" id="printChart" role="none"></li>
				<li class="nav-item dropdown px-1" id="downloadChart" role="none"></li>
				<li class="nav-item button px-1" id="downloadExcel" role="none"></li>
				<li class="nav-item button px-1" id="embebedChart" role="none"></li>
				<li class="nav-item button px-1" id="closeChart" role="none"></li>
			  </ul>
			</div>
		  </div>
		  <div class="col-12 subNavTwo">
			<div id="auxChartTitle">
			<h2 id="title" class="title auxTitle"></h2>
				<h6 id="subtitle" class="subtitle auxSubtitle"></h6>
			</div>
		  </div>
		</div>`;	
		
  
	  if (isMobile) {
		this.controls.innerHTML = mobileContent;
		this.toolsButton = this.controls.querySelector("#tools");
		this.chartToolsMenu = this.controls.querySelector(".menu");
  
		this.toolsButton.addEventListener("click", () => {
		  this.chartToolsMenu.classList.toggle("d-none");
		//   this.toolsButton.style.display = "none";
		});
	  } else {
		this.controls.innerHTML = notMobileContent;
	  }	  
	}

	
	toggleChartPercentage() {
		REF.percentage = REF.percentage == 0 ? 1 : 0;
		auxiliarBarGraph()
	  }
	
	  toggleChartDetails() {
		REF.chartOption = REF.chartOption == 0 ? 1 : 0;
		auxiliarBarGraph()
	  }
	
	  toggleIcons() {
		const tableIcon = this.controls.querySelector('#table-icon');
		const chartIcon = this.controls.querySelector('#chart-icon');
		const toggleButton = this.controls.querySelector('#tb-togle-table');
	  
	  
		tableIcon.style.display = tableIcon.style.display === 'none' ? '' : 'none';
		chartIcon.style.display = chartIcon.style.display === 'none' ? '' : 'none';
	  
		if (tableIcon.style.display === 'none') {
		  toggleButton.setAttribute('data-i18n-label', 'SHOW_TABLE');
		  toggleButton.setAttribute('data-i18n-title', 'SHOW_TABLE');
      if (typeof languageNameSpace !== 'undefined' && languageNameSpace.translateElementAttributes) {
        languageNameSpace.translateElementAttributes(toggleButton);
      }
		 
		  const charts = ["barChart", "pieChart"];  
		  charts.forEach(chart => {
			  $("#" + chart).attr("disabled", "disabled")
			  $("#" + chart).attr("aria-disabled", "true")
		  })
		 
		  $("#"+REF.chartId).addClass('highlighDisbleBtn');
		 
		 
		 
		  openVizTable()
		  setTimeout(() => {
            const thElements = document.querySelectorAll('thead > tr:nth-child(2) > th');
            thElements.forEach(element => {
              const innerHTML = element.innerHTML.toLowerCase();
              if (innerHTML.includes('low')) {
                element.textContent = languageNameSpace.labels['LOW'];
                element.style.color = 'red';
              } else if (innerHTML.includes('high')) {
                element.textContent = languageNameSpace.labels['HIGH'];
                element.style.color = 'blue';
              }
            });   
    }, 200);  
		} else {
			toggleButton.setAttribute('data-i18n-label', 'SHOW_TABLE');
			toggleButton.setAttribute('data-i18n-title', 'SHOW_TABLE'); 
      if (typeof languageNameSpace !== 'undefined' && languageNameSpace.translateElementAttributes) {
        languageNameSpace.translateElementAttributes(toggleButton);
      }
		  $('.ecl-button').not('button#tb-togle-table').prop('disabled', false);
		  $("#"+REF.chartId).removeClass('highlighDisbleBtn');
		  closeTable()
		  disableChatOptionsBtn(REF.chartId)
		}
	  }
  
	addToDOM(targetElement) {
	  $("#menuToolbar").toggle();	
	  const container = document.querySelector(targetElement);
	  container.insertBefore(this.controls, container.firstChild);

	  const showHideValue = REF.chartOption === 1 ? '' : 'none';

      const self = this; 
	  
	    // Create the button instances
		const barChart = new Button("barChart", ["ecl-button", "ecl-button--primary", "round-btn"], "SHOW_BAR_CHART", "barChart", "true");
		const pieChart = new Button("pieChart", ["ecl-button", "ecl-button--primary", "round-btn"], "SHOW_PIE_CHART", "pieChart", "false");
		// const lineChart = new Button("lineChart", ["ecl-button", "ecl-button--primary", "round-btn"], "Toggle line Chart", "lineChart", "false");
		const createprintChart = new Button("printBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "PRINT_CHART", "false");
		const downloadChart = new Button("downloadBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "DOWNLOAD_CHART_IMAGE", "false");
		const downloadExcel = new Button("excelBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "DOWNLOAD_XLS", "false");
		const embebedeChart = new Button("embebedBtn", ["ecl-button", "ecl-button--primary", "round-btn"], "SHARE", "false");
		const closeChart = new Button("btnCloseModalChart", ["ecl-button", "ecl-button--primary", "round-btn", "close-chart-menu-btn"], "CLOSE", "false");
		const percentageButton = new Button("tb-togle-percentage", ["ecl-button", "ecl-button--primary", "round-btn"], "SHOW_PERCENTAGE", "", "true");		
		const tableButton = new Button("tb-togle-table", ["ecl-button", "ecl-button--primary", "round-btn"], "SHOW_TABLE", "", "true");
		const detailsButton = new Button("tb-togle-details", ["ecl-button", "ecl-button--primary", "round-btn"], "DETAILS", "", "true");    
		const renewButton = new Button("tb-togle-renew", ["ecl-button", "ecl-button--primary", "round-btn"], "RENEW", "", "true");
	
		// Set inner HTML content for each button
		barChart.setInnerHtml('<i class="fas fa-chart-bar"></i>');
		pieChart.setInnerHtml('<i class="fas fa-chart-pie"></i>');
		// lineChart.setInnerHtml('<i class="fas fa-chart-line"></i>');
		createprintChart.setInnerHtml('<i class="fas fa-print"></i>');
		downloadChart.setInnerHtml('<i class="fas fa-download"></i>');
		downloadExcel.setInnerHtml('<i class="fas fa-file-excel"></i>');
		embebedeChart.setInnerHtml('<i class="fas fa-code"></i>');
		closeChart.setInnerHtml('<i class="fas fa-times"></i>');
		percentageButton.setInnerHtml('<i id="percentage-icon" class="fas fa-percentage"></i>');
		tableButton.setInnerHtml('<i id="table-icon" class="fas fa-table"></i><i id="chart-icon" class="fas fa-chart-bar" style="display: none;"></i>');
		detailsButton.setInnerHtml(agregateIcon());
		renewButton.setInnerHtml('<i class="fas fa-industry"></i>');
	
		// Set click handlers for each button
		barChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  $("#toggleDetails").css('display', "initial")
		  auxiliarBarGraph();
		});
		pieChart.setClickHandler(function() {
		  disableChatOptionsBtn(this.value);
		  createPieChart();
		});
		// lineChart.setClickHandler(function() {
		//   disableChatOptionsBtn(this.value);
		//   createLineChart();
		// });
		createprintChart.setClickHandler(function() {
		  printChart();
		});
		downloadChart.setClickHandler(function() {
		  exportPngChart();
		});
		downloadExcel.setClickHandler(function() {
		  exportXlsChart();
		});
		embebedeChart.setClickHandler(function() {
			exportIframe();
		});
		closeChart.setClickHandler(function() {		
		  removeAuxiliarBarGraphOptions();
		  closeTable()	
		  $("#infoBtn").prop("disabled", false);
		  $("#downloadBtn").prop("disabled", false);
		  $("#shareChart").prop("disabled", false);
		  $("#embebedBtn").prop("disabled", false);
		});

		renewButton.setClickHandler(function() {
			REF.siecsToLoad === "rw" ? REF.siecsToLoad = "Nrw" : REF.siecsToLoad = "rw";
	  
			const renewBtnElement = document.getElementById("tb-togle-renew");
			REF.siecsToLoad === "rw"
			  ? (renewBtnElement.innerHTML = '<i class="fas fa-industry"></i>')
			  : (renewBtnElement.innerHTML = '<i class="fas fa-wind"></i>');
			  
			auxiliarBarGraph();
		  });
	  
		  percentageButton.setClickHandler(function() {
			self.toggleChartPercentage(); // Call the class method using the stored reference
		  });
	  
		  detailsButton.setClickHandler(function() {      


	  
			REF.chartOption === 1 ? REF.chartOption = 0 : REF.chartOption = 1;    
			
			if(REF.chartOption === 1) {
			  $("#togglePercentage").css('display', "initial")
			  log(REF.dataset)
			  if(REF.dataset == "nrg_cb_pem_RW") {
				$('#toggleRenuewbles').css('display', 'initial');
			  } else {
				$('#toggleRenuewbles').css('display', 'none');
			  }
			  document.getElementById("tb-togle-details").innerHTML = nonagregateIcon();
			} else {
			  REF.percentage = 0
			  $("#togglePercentage").css('display', "none")
			  $("#toggleRenuewbles").css('display', "none")
			  document.getElementById("tb-togle-details").innerHTML = agregateIcon();
			}   
			



			auxiliarBarGraph();
		  });
	  
		  tableButton.setClickHandler(function() {
			self.toggleIcons(); // Call the class method using the stored reference
		  });

	  	  // Create the button elements
			const barChartElement = barChart.createButton();
			const pieChartElement = pieChart.createButton();
			// const lineChartElement = lineChart.createButton();
			const printChartElement = createprintChart.createButton();
			const downloadChartElement = downloadChart.createButton();
			const downloadExcelElement = downloadExcel.createButton();
			const embebedeChartElement = embebedeChart.createButton();
			const closeChartElement = closeChart.createButton();
			const percentageElement = percentageButton.createButton();
			const tableElement = tableButton.createButton();
			const detailsElement = detailsButton.createButton();
			const renewElement = renewButton.createButton();    

		
			// Append the button elements to the document
			document.getElementById("toggleBarChart").appendChild(barChartElement);
			document.getElementById("togglePieChart").appendChild(pieChartElement);
			// document.getElementById("toggleLineChart").appendChild(lineChartElement);
			// document.getElementById("printChart").appendChild(printChartElement);
			document.getElementById("downloadChart").appendChild(downloadChartElement);
			document.getElementById("downloadExcel").appendChild(downloadExcelElement);
			document.getElementById("embebedChart").appendChild(embebedeChartElement);
			document.getElementById("closeChart").appendChild(closeChartElement);

			document.getElementById("togglePercentage").appendChild(percentageElement);
			document.getElementById("toggleTable").appendChild(tableElement);
    if (typeof languageNameSpace !== 'undefined' && languageNameSpace.translateElementAttributes) {
      languageNameSpace.translateElementAttributes(tableElement);
    }

			document.getElementById("togglePercentage").style.display = showHideValue;
			document.getElementById("toggleDetails").style.display = showHideValue;
			document.getElementById("toggleRenuewbles").style.display = showHideValue;

			pieChart.setDisabled(true);


			languageNameSpace.initLanguage(REF.language);


	}
  
	removeFromDOM() {
	  let navElement;
	  if (isMobile) {
		navElement = document.querySelector("#chartOptions");
	  } else {
		navElement = document.querySelector("div > nav.navChartControls");
	  }
  
	  if (navElement) {
		const parentContainer = navElement.closest("#subnavbar-container > div");
		if (parentContainer) {
		  parentContainer.parentNode.removeChild(parentContainer);
		}
	  }
	  $("#menuToolbar").toggle();
	}
  }
  

  function disableChatOptionsBtn(chart) {
	REF.chartId = chart;  
	const charts = ["barChart", "pieChart", "lineChart"];  
	charts.forEach(chart => {
	  if (REF.chartId == chart) {
		$("#" + chart).attr("disabled", "disabled");
		$("#" + chart).attr("aria-disabled", "true")
	  } else {
		$("#" + chart).removeAttr("disabled");
		$("#" + chart).attr("aria-disabled")
	  }
	});
  }

