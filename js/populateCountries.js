function populateCountries() {

  const target = document.querySelector("#containerCountry");
  const elementId = 'selectCountry';
  const optionsArray = defaultGeos;
  const labelDescription = languageNameSpace.labels["COUNTRY"];
  const activeElement = REF.geos;
  const textChange = languageNameSpace.labels["BOX_COUNTRY_TITLE"];

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

