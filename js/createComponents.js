
$( document ).ready(function() {

  dataNameSpace.getRefURL();

  languageNameSpace.initLanguage(REF.language);

  if (isAccessibilityMode()) {
    if (typeof globanManager !== 'undefined') { globanManager.init(); }
    setTimeout(() => {
      if (typeof cckManager !== 'undefined') { cckManager.regenerate(REF.language); }
    }, 300);
    buildComponents();
    languageNameSpace.initLanguage(REF.language);   // translate the freshly built header/footer
    showAccessibilityView();
    return;              // do not start the tool (no chart init, no data calls)
  }

 // Initialize GLOBAN after language is set
if (typeof globanManager !== 'undefined') {
  globanManager.init();
}

// Regenerate CCK with the current language (delay to ensure CCK is ready)
setTimeout(() => {
  if (typeof cckManager !== 'undefined') {
    cckManager.regenerate(REF.language);
  }
}, 300);

  buildComponents();

})

function buildComponents() {
  const components = isAccessibilityMode()
    ? [
        { instance: new Footer(), target: '#componentFooter' },
        { instance: new Navbar(), target: '#navbar-container' },
      ]
    : [
        { instance: new SubNavbar(), target: '#subnavbar-container' },
        { instance: new Footer(), target: '#componentFooter' },
        { instance: new Navbar(), target: '#navbar-container' },
        { instance: new FloatingChartControls(), target: '#chartBtns' },
      ];

  components.forEach(({ instance, target }) => {
    instance.addToDOM(target);
  });

  if (isAccessibilityMode()) {
    return;   // no selects to fill, no tooltips
  }

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
