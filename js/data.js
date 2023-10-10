const dataNameSpace = {
  version: "1",

  ref: {
    // geo: "EU27_2020",
    geos: "EU27_2020",
    unit: "GWH",   
    currency: "EUR",
    language: "EN",
    chartId: "mainChart",
    chartGeo: "",
    percentage: 0,
    share:"false",
    nrg_bal: "NEG",
    siec: "TOTAL",
    dataset:"nrg_cb_pem_RW",
    selectyear: "",
    chartOption: 0,
    siecsToLoad: "rw",
    time:"",
    chart:"",
    zoom:"",
    start:"",
    end:"",
  },

  setRefURL() {
    const url = new URL(window.location.href);
    const refParams = Object.entries(this.ref).map(([ref, value]) => `${ref}=${value}`);
    url.search = refParams.join("&");
    this.changeUrl("title", url.toString());
  },
  
  getRefURL() {
    const getUrlVars = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const vars = {};
      urlParams.forEach((value, key) => {
        vars[key] = value;
      });
      return vars;
    };
  
    const refURL = getUrlVars();
  
    Object.entries(this.ref).forEach(([ref, value]) => {
      if (refURL[ref] !== undefined) {
        this.ref[ref] = refURL[ref];
      }
    });
  
    if (refURL.taxs !== undefined) {
      this.ref.taxs = refURL.taxs.split(",");
    }
  
    if (refURL.nrg_prc !== undefined) {
      this.ref.nrg_prc = refURL.nrg_prc.split(",");
    }
    if (refURL.percentage) {
      this.ref.percentage = parseFloat(refURL.percentage);
    }
  
    if (refURL.geos !== undefined) {
      if (refURL.geos.includes('all')) {
        this.ref.geos = "";
      } else {
        this.ref.geos = refURL.geos.split(",");
      }
    }
  },  
  changeUrl(title, url) {
    if (typeof history.pushState !== "undefined") {
      var obj = {
        Title: title,
        Url: url,
      };
      history.pushState(obj, obj.Title, obj.Url);
    } else {
      alert(languageNameSpace.labels["MSG_BROWSER"]);
    }
  },
};

const REF = dataNameSpace.ref;
