class FloatingChartControls {
  constructor() {
    this.chartControls = document.createElement('div');
    this.chartControls.className = 'menuSwitch';
    this.chartControls.id = 'menuSwitch';

    this.chartControls.innerHTML = ` 
          <li class="nav-item px-1" id="togglePercentage" role="none"></li>
          <li class="nav-item px-1" id="toggleRenuewbles" role="none"></li>
          <li class="nav-item px-1" id="toggleDetails" role="none"></li>
          <li class="nav-item px-1 iconSpacer" id="toggleTable" role="none"></li>
       `;
    
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
    const tableIcon = this.chartControls.querySelector('#table-icon');
    const chartIcon = this.chartControls.querySelector('#chart-icon');
    const toggleButton = this.chartControls.querySelector('#tb-togle-table');
  
  
    tableIcon.style.display = tableIcon.style.display === 'none' ? '' : 'none';
    chartIcon.style.display = chartIcon.style.display === 'none' ? '' : 'none';
  
    if (tableIcon.style.display === 'none') {
      toggleButton.setAttribute('aria-label', languageNameSpace.labels['BTNATABLE']);
      toggleButton.title = languageNameSpace.labels['BTNATABLE'];
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
      toggleButton.setAttribute('aria-label', languageNameSpace.labels['BTNATABLE']);
      toggleButton.title = languageNameSpace.labels['BTNATABLE'];      
      closeTable()
    }
  }

  

  
  addToDOM(targetElement) {
    const container = document.querySelector(targetElement);

    const referenceElement = container.firstChild; 
    
    container.insertBefore(this.chartControls, referenceElement);

    
    const showHideValue = REF.chartOption === 1 ? '' : 'none';

    const self = this; 

		const percentageButton = new Button("tb-togle-percentage", ["ecl-button", "ecl-button--primary", "round-btn"], languageNameSpace.labels['BTNPERCENTAGECHART'], "", "true");		
		const tableButton = new Button("tb-togle-table", ["ecl-button", "ecl-button--primary", "round-btn"], languageNameSpace.labels['BTNATABLE'], "", "true");
		const detailsButton = new Button("tb-togle-details", ["ecl-button", "ecl-button--primary", "round-btn"], languageNameSpace.labels['BTNEDETAILS'], "", "true");    
		const renewButton = new Button("tb-togle-renew", ["ecl-button", "ecl-button--primary", "round-btn"], languageNameSpace.labels['BTNRNW'], "", "true");

    percentageButton.setInnerHtml('<i id="percentage-icon" class="fas fa-percentage"></i>');
    tableButton.setInnerHtml('<i id="table-icon" class="fas fa-table"></i><i id="chart-icon" class="fas fa-chart-bar" style="display: none;"></i>');
    detailsButton.setInnerHtml(agregateIcon());
    renewButton.setInnerHtml('<i class="fas fa-industry"></i>');

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
				$('#toggleRenuewbles').css('display', 'none');
			  } else {
				$('#toggleRenuewbles').css('display', 'initial');
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

    const percentageElement = percentageButton.createButton();
    const tableElement = tableButton.createButton();
    const detailsElement = detailsButton.createButton();
    const renewElement = renewButton.createButton();    

    document.getElementById("togglePercentage").appendChild(percentageElement);
    document.getElementById("toggleTable").appendChild(tableElement);
    document.getElementById("toggleDetails").appendChild(detailsElement);
    document.getElementById("toggleRenuewbles").appendChild(renewElement);

    document.getElementById("togglePercentage").style.display = showHideValue;
    document.getElementById("toggleDetails").style.display = showHideValue;
    document.getElementById("toggleRenuewbles").style.display = showHideValue;

  }
}




