var languageNameSpace = {
  //Label containers for the selected language
  labels: {},
  tutorial: {},

  //selected language
  languageSelected: "",

  //init of the labels for the language defined in the URL
  initLanguage: function (val, language) {
    language == "" ? language = "EN" : language = val 


    languageNameSpace.languageSelected = language;

    //load the labels for the selected language asynchronously
    $.ajaxSetup({
      async: false
      });
    // load the labels for the selected language
    $.getJSON("data/labels_" + language + ".json", function (data) {
      languageNameSpace.labels = data;   
    }).then(
      $.getJSON("data/tutorial_" + language + ".json", function (data) {
        languageNameSpace.tutorial = data;   
      })
    )
    $.ajaxSetup({
      async: true
      });

    const elementsId = [".pie", ".barchart", ".line", ".db", ".meta", 
    ".info", ".details", "#close", ".componentsShow", ".componentsHide",
    ".play", "#share", ".Modalshare", ".twitter", ".linkedin", ".facebook", ".chartMenu",
    "#vizualizationMenu", "#visualization-table", "#find-more-menu-icon", ".toggle-thumb", "#header-title-label"
    ]

    elementsId.forEach(id => {
      const element = $(id);
      const label = languageNameSpace.labels[id.substring(1)];
      element.attr({
        'title': label,
        'data-original-title': label,
        'aria-label': label
      });
      element.html(languageNameSpace.labels[id.substring(1)]);
    });

      $("#footer-cookies").html(languageNameSpace.labels["COOKIES"]);
      $("#footer-privacy").html(languageNameSpace.labels["PRIVACY"]);
      $("#footer-legal").html(languageNameSpace.labels["LEGAL"]);



      $(".cck-content-content > p").html(languageNameSpace.labels["COOKIETEXT"]);
      $(".cck-actions > a:nth-child(1)").text(languageNameSpace.labels["COOKIECOMPLETEacceptAll"]);
      $(".cck-actions > a:nth-child(2)").text(languageNameSpace.labels["COOKIECOMPLETEonlyTechnical"]);
      $(".cck-content-complete > p").html(languageNameSpace.labels["COOKIECOMPLETE"]);
      $(".cck-actions > a[href=\'#close']").text(languageNameSpace.labels["COOKIECOMPLETEclose"]);
      $(".cck-actions > a[href=\'#close']").append('<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.538 15.205L13.32 11.99l3.199-3.194-1.332-1.332-3.2 3.193L8.812 7.48 7.48 8.812l3.177 3.177-3.195 3.199 1.334 1.333 3.193-3.2 3.217 3.217 1.333-1.333zm5.594-7.49a10.886 10.886 0 00-2.355-3.492 10.882 10.882 0 00-3.492-2.355A10.906 10.906 0 0012 1c-1.488 0-2.93.293-4.286.868a10.958 10.958 0 00-3.492 2.355 10.888 10.888 0 00-2.355 3.492A10.925 10.925 0 001 12a10.958 10.958 0 003.222 7.778 10.9 10.9 0 003.492 2.355C9.07 22.707 10.512 23 12 23a10.964 10.964 0 007.777-3.222 10.912 10.912 0 002.355-3.492A10.94 10.94 0 0023 12c0-1.487-.294-2.93-.868-4.285zM21.702 12a9.642 9.642 0 01-2.844 6.858A9.619 9.619 0 0112 21.703a9.635 9.635 0 01-6.859-2.844A9.617 9.617 0 012.298 12a9.619 9.619 0 012.843-6.859A9.615 9.615 0 0112 2.298a9.619 9.619 0 016.858 2.843A9.623 9.623 0 0121.703 12z"></path></svg>')

  },


  ChangeLanguage: function (val) {
    REF.language = val;
    languageNameSpace.initLanguage(REF.language);

    removeComponents()
    buildComponents()
    initenprices();

    if(REF.chartId != "mainChart"){
      addAuxiliarBarGraphOptions()
    }

    linksContent = 	"<div class='modalHeader'>"
    + '<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close">x</button>'
    + "<h5>" + languageNameSpace.labels["LINKS"] + "</h5>"
    + "</div>"
    + "<div>"
    + '<a href=\"https://ec.europa.eu/info/cookies_'+ REF.language.toLowerCase() +'\" target=\"_blank\" class="underline"><span>'+languageNameSpace.labels["COOKIES"]+'</span><svg viewBox="0 0 13 20"><polyline points="0.5 19.5 3 19.5 12.5 10 3 0.5" /></svg></a>'
    + "</div>"
    + "<div>"
    + '<a href=\"https://ec.europa.eu/info/privacy-policy_'+ REF.language.toLowerCase() +'\" target=\"_blank\" class="underline"><span>'+languageNameSpace.labels["PRIVACY"]+'</span><svg viewBox="0 0 13 20"><polyline points="0.5 19.5 3 19.5 12.5 10 3 0.5" /></svg></a>'
    + "</div>"
    + "<div>"
    + '<a href=\"https://ec.europa.eu/info/legal-notice_'+ REF.language.toLowerCase() +'\" target=\"_blank\" class="underline"><span>'+languageNameSpace.labels["LEGAL"]+'</span><svg viewBox="0 0 13 20"><polyline points="0.5 19.5 3 19.5 12.5 10 3 0.5" /></svg></a>'
    + "</div>"  
    + "<div>"
    + "</div>"
  
    if($("#links").html() === "") {
      $("#links").append(linksContent);
    }
  }
};