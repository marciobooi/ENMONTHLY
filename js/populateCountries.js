function populateCountries() {

  const countryDropDown = $("#chartOptionsMenu > div.dropdown-grid > div > div:nth-child(1) > div > ul");
  countryDropDown.empty()
  let content = '';

  defGeos.forEach(geo => {
    const isActive = geo == REF.geos ? 'active' : '';  
    content += `
      <a role="menuitem" class="dropdown-item d-flex justify-content-between align-items-center ${isActive}" href="#" data-geo="${geo}" data-bs-toggle="button" aria-pressed="true">
        <span><img class="flag me-2" src="img/country_flags/${geo}.webp" alt="">${languageNameSpace.labels[geo]}</span>
        <i class="fas fa-check ms-2 ${isActive ? '' : 'invisible'}"></i>
      </a>`;
  });
  const dropdownMenu = $("<div>")
    .attr("id", "dropdown-geo-list")
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
      $('#selectCountry').text(selectedText).append('<i class="fas fa-angle-down"></i>');

      REF.geos = target.attr('data-geo')       

     
      enmonthly()

    });

    countryDropDown.prepend(dropdownMenu);

  $('#selectCountry').hover(
      function() {
        $(this).data('prevText', $(this).text());
        $(this).html(`${languageNameSpace.labels['MENU_COUNTRY']} <i class="fas fa-angle-down"></i>`);
      },
      function() {
        const dropdownGeoList = $('#dropdown-geo-list');
        const prevText = dropdownGeoList.find('.dropdown-item.active span').text();
        $(this).html(`${prevText} <i class="fas fa-angle-down"></i>`);
      }
    );
}