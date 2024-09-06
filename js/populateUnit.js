
  function populateUnit() {

  
    unitList = codesDataset[REF.dataset].unit

    const target = document.querySelector("#containerUnit");
    const elementId = 'selectUnit';
    const optionsArray = unitList;
    const labelDescription = "UNIT";
    const activeElement = REF.unit;
    const textChange = "MENU_UNIT";

    const existingSingleSelect = document.getElementById(elementId);
    if (existingSingleSelect) {
        existingSingleSelect.parentElement.parentElement.remove();
    }
  
  
    const singleSelect = new Singleselect(elementId, optionsArray, labelDescription, activeElement, textChange, selectedValue => {
        REF.unit = selectedValue;
        enmonthly();
    });
  
    const singleSelectHTML = singleSelect.createSingleSelect();
    target.insertAdjacentHTML('beforeend', singleSelectHTML);
  
    singleSelect.attachEventListeners();



  }