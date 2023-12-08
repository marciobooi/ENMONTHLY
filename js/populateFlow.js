function populateFlow() {

 

    flowList = codesDataset[REF.dataset].nrg_bal

    const flowDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(3) > div > ul");
    flowDropDown.empty()
    let content = '';
  
    flowList.forEach(flow => {     
        const isActive = flow == REF.nrg_bal ? 'active' : '';
      content += `
        <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-flow="${flow}" data-bs-toggle="button" aria-pressed="true">
          <span>${languageNameSpace.labels[flow]}</span>
          <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
        </a>`;
    });
    
  
    const dropdownMenu = $("<div>")
      .attr("id", "dropdown-flow-list")
      .attr("role", "menu")
      .css("height", "auto")
      .css("maxHeight", "48vh")
      .css("overflowX", "hidden")
      .html(content);


      dropdownMenu.on('click', '.dropdown-item', function() {
        const target = $(this);
        const checkIcon = target.find('.fas.fa-check');
      
        dropdownMenu.find('.dropdown-item').removeClass('active');
        dropdownMenu.find('.fas.fa-check').addClass('invisible');
      
        target.addClass('active');
        checkIcon.removeClass('invisible');

        const selectedText = target.find('span').text();
        $('#selectFlow').text(selectedText).append('<i class="fas fa-angle-down"></i>');

        REF.nrg_bal = target.attr('data-flow')       
       
        enmonthly()

      });
  
    flowDropDown.prepend(dropdownMenu);

    $('#selectFlow').hover(
        function() {
          $(this).data('prevText', $(this).text());
          $(this).html(`${languageNameSpace.labels['SELECTFLOW']} <i class="fas fa-angle-down"></i>`);
        },
        function() {
          const dropdownFlowList = $('#dropdown-flow-list');
          const prevText = dropdownFlowList.find('.dropdown-item.active span').text();
          $(this).html(`${prevText} <i class="fas fa-angle-down"></i>`);
        }
      );

  }