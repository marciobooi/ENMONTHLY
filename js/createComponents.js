
$( document ).ready(function() {

  dataNameSpace.getRefURL();

  languageNameSpace.initLanguage(REF.language);

  const euGlobanContainer = $('<div>').attr('id', 'euGlobanContainer')

  euGlobanContainer.prependTo('header');

    $wt.render("euGlobanContainer", {
      utility: "globan",
      lang: REF.language.toLowerCase(),
      theme: "dark",
    });

  buildComponents();

})

function buildComponents() {
  const components = [
    { instance: new SubNavbar(), target: '#subnavbar-container' },
    { instance: new Footer(), target: '#componentFooter' },
    { instance: new Navbar(), target: '#navbar-container' },
    { instance: new FloatingChartControls(), target: '#chartBtns' },
  ];

  components.forEach(({ instance, target }) => {
    instance.addToDOM(target);
  });

  populateDropdownData();

  // Enable tooltips for newly added components
  try { enableTooltips(); } catch(e) { console.warn('enableTooltips not available after buildComponents'); }
}

function removeComponents() {
  // Clean UI components
  $('#navbar-container').empty();
  $('#subnavbar-container').empty();
  $('#menuSwitch').remove();
  $('#floatingMenu').empty();
  $('#componentFooter').empty();

  // Clean tooltips and keyboard traps
  try { cleanupTooltips(); } catch (e) {}
  try { $('#subnavbar-container #chartOptionsMenu').off('.trap'); $(document).off('.trap'); $('#subnavbar-container #menu').off('.trap'); } catch(e) {}
}

function populateDropdownData() {
  populateCountries(); 
  populateIncicator(); 
  populateFlow(); 
  populateFuel();
  populateUnit();
  populateUnit();
  ECL.autoInit();
}
