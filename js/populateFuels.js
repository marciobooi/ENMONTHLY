// function populateFuel() {

//     fuelList = codesDataset[REF.dataset].siec

//     const fuelDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(4) > div > ul");
//     fuelDropDown.empty()
//     let content = '';
  
//     fuelList.forEach(fuel => {     
//         const isActive = fuel == REF.siec ? 'active' : '';
//       content += `
//         <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-siec="${fuel}" data-bs-toggle="button" aria-pressed="true">
//           <span>${languageNameSpace.labels[fuel]}</span>
//           <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
//         </a>`;
//     });
  
//     const dropdownMenu = $("<div>")
//       .attr("id", "dropdown-fuel-list")
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
//         $('#selectFuel').text(selectedText).append('<i class="fas fa-angle-down"></i>');

//         REF.siec = target.attr('data-siec')  
        
//         enmonthly()

//       });
  
//     fuelDropDown.prepend(dropdownMenu);

//     $('#selectFuel').hover(
//         function() {
//           $(this).data('prevText', $(this).text());
//           $(this).html(`${languageNameSpace.labels['MENU_FUEL']} <i class="fas fa-angle-down"></i>`);
//         },
//         function() {
//           const dropdownFuelList = $('#dropdown-fuel-list');
//           const prevText = dropdownFuelList.find('.dropdown-item.active span').text();
//           $(this).html(`${prevText} <i class="fas fa-angle-down"></i>`);
//         }
//       );

//   }



  function populateFuel() {

    fuelList = codesDataset[REF.dataset].siec

    const target = document.querySelector("#containerFuel");
    const elementId = 'selectFuel';
    const optionsArray = fuelList;
    const labelDescription = languageNameSpace.labels["FUEL"];
    const activeElement = REF.siec;
    const textChange = languageNameSpace.labels["MENU_FUEL"];
  
    const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {    
        existingSingleSelect.parentElement.parentElement.remove();
    }
  
    const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
      REF.siec = selectedValue;
        enmonthly()
    });
  
    const singleSelectHTML = singleSelect.createSingleSelect();
    target.insertAdjacentHTML('beforeend', singleSelectHTML);
  
  
  
    singleSelect.attachEventListeners();
  
  }
  
  
  