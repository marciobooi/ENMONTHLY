function populateCountries() {

  const target = document.querySelector("#containerCountry");
  const elementId = 'selectCountry';
  const optionsArray = defaultGeos;
  const labelDescription = "CTR";
  const activeElement = REF.geos;
  const textChange = "MENU_COUNTRY";

  const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {
        existingSingleSelect.parentElement.parentElement.remove();
    }

  const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
      REF.geos = selectedValue;
      enmonthly()

  });

  const singleSelectHTML = singleSelect.createSingleSelect();
  target.insertAdjacentHTML('beforeend', singleSelectHTML);

  singleSelect.attachEventListeners();

}

