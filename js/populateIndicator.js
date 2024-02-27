// function populateIncicator() {
//     const indicatorDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(2) > div > ul");
//     indicatorDropDown.empty()
//     let content = '';
  
//     Object.keys(selectChart).forEach(dataset => {     
//         const isActive = dataset == REF.dataset ? 'active' : '';
//       content += `
//         <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-indicator="${dataset}" data-bs-toggle="button" aria-pressed="true">
//           <span>${languageNameSpace.labels[dataset]}</span>
//           <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
//         </a>`;
//     });
  
//     const dropdownMenu = $("<div>")
//       .attr("id", "dropdown-indicator-list")
//       .attr("role", "menu")
//       .css("height", "auto")
//       .css("maxHeight", "48vh")
//       .css("overflowX", "hidden")
//       .html(content);


//       dropdownMenu.on('click', '.dropdown-item', function() {
//         const target = $(this);
//         const checkIcon = target.find('.fas.fa-check');
      
//         dropdownMenu.find('.dropdown-item').removeClass('active');
//         dropdownMenu.find('.fas.fa-check').addClass('invisible');
      
//         target.addClass('active');
//         checkIcon.removeClass('invisible');

//         const selectedText = target.find('span').text();
//         $('#selectIndicator').text(selectedText).append('<i class="fas fa-angle-down"></i>');

//         REF.dataset = target.attr('data-indicator')
//         REF.nrg_bal = codesDataset[REF.dataset].defaultNrg_bal.toString()
//         REF.siec = codesDataset[REF.dataset].defaultSiec.toString()
//         REF.unit = codesDataset[REF.dataset].defaultUnit.toString()
        
//         populateFlow(); 
//         populateFuel(); 
//         populateUnit(); 

//         log(REF.dataset)
        
//         enmonthly()

//       });
  
//     indicatorDropDown.prepend(dropdownMenu);


//     $('#selectIndicator').hover(
//         function() {
//           $(this).data('prevText', $(this).text());
//           $(this).html(`${languageNameSpace.labels['SELECTINDICATOR']} <i class="fas fa-angle-down"></i>`);
//         },
//         function() {
//           const dropdownIndicatorList = $('#dropdown-indicator-list');
//           const prevText = dropdownIndicatorList.find('.dropdown-item.active span').text();
//           $(this).html(`${prevText} <i class="fas fa-angle-down"></i>`);
//         }
//       );

//   }


  function populateIncicator() {
  
    const target = document.querySelector("#containerIndicator");
    const elementId = 'selectIndicator';
    const optionsArray = Object.keys(selectChart);
    const labelDescription = languageNameSpace.labels["INDICATOR"];
    const activeElement = REF.dataset;
    const textChange = languageNameSpace.labels["SELECTINDICATOR"];

    const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {
        existingSingleSelect.parentElement.parentElement.remove();
    }
  
  
    const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
        REF.dataset = selectedValue;
        REF.nrg_bal = codesDataset[REF.dataset].defaultNrg_bal
        REF.siec = codesDataset[REF.dataset].defaultSiec
        REF.unit = codesDataset[REF.dataset].defaultUnit

        populateFlow(); 
        populateFuel(); 
        populateUnit();         
        enmonthly()
    });
  
    const singleSelectHTML = singleSelect.createSingleSelect();
    target.insertAdjacentHTML('beforeend', singleSelectHTML);
  
    singleSelect.attachEventListeners();



  }