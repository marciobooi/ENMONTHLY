class SubNavbar {
  constructor() {
    this.subNavbar = document.createElement("nav");
    this.subNavbar.setAttribute("aria-label", "Menu toolbar");
    this.subNavbar.setAttribute("id", "menuToolbar");
    this.subNavbar.setAttribute(
      "class",
      "navbar navbar-expand-sm navbar-light bg-light"
    );

    // const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768

    const notMobileContent = /*html*/ `<div class="container-fluid">
            <div class="col-1">              
             <button id="menu" class="btnGroup" type="button" data-i18n-label="MAINMENU" data-i18n-title="MAINMENU" aria-haspopup="true">
                <i class="fas fa-bars"></i>
                <span data-i18n="MAINMENU"></span>             
              </button>
            </div>
            <div class="col-8">
              <div class="text-group">
                <h2 id="title" class="title"></h2>
                <h2 id="subtitle" class="subtitle"></h2>      
              </div>
            </div>
            <div class="col-3">
            <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
                
                <li class="nav-item dropdown px-1" id="infoBtnChart" role="none">
                <button class="ecl-button ecl-button--primary round-btn" type="button" data-i18n-label="INFO" data-i18n-title="INFO" data-bs-toggle="dropdown" role="menuitem" aria-haspopup="true" aria-expanded="true" id="infoBtn">
                <i class="fas fa-info"></i>
              </button>
              
              <ul class="dropdown-menu dropdown-menu-end" role="menu" aria-labelledby="INFO">
              <button class="dropdown-item ecl-link" role="menuitem" onclick="tutorial()" data-i18n-labelledby="TUTORIAL" value="Tutorial" data-i18n="TUTORIAL"></button>
              <button class="dropdown-item ecl-link" role="menuitem" onclick="openMeta()" data-i18n-labelledby="META" value="metadata" data-i18n="META"></button>
              <button class="dropdown-item ecl-link" role="menuitem" onclick="socialNameSpace.email()" data-i18n-labelledby="FEED" value="Feedback" data-i18n="FEED"></button>
            </ul>
            
                </li>
                <li class="nav-item dropdown px-1" id="downloadChart" role="none">
                <button class="ecl-button ecl-button--primary round-btn" type="button" data-i18n-label="DOWNLOAD_CHART_IMAGE" data-i18n-title="DOWNLOAD_CHART_IMAGE" data-bs-toggle="dropdown" role="menuitem" aria-haspopup="true" aria-expanded="true" id="downloadBtn">
                <i class="fas fa-download"></i>
              </button>
              
              <ul class="dropdown-menu dropdown-menu-end" role="menu" data-i18n-labelledby="DOWNLOAD">
              <button class="dropdown-item ecl-link" role="menuitem" onclick="exportPngChart()" data-i18n-label="DOWNLOAD_PNG" data-i18n="DOWNLOAD_PNG"></button>
              <button class="dropdown-item ecl-link" role="menuitem" onclick="exportJpegChart()" data-i18n-label="DOWNLOAD_JPEG" data-i18n="DOWNLOAD_JPEG"></button>
              <button class="dropdown-item ecl-link" role="menuitem" onclick="exportXlsChart()" data-i18n-label="DOWNLOAD_XLS" data-i18n="DOWNLOAD_XLS"></button>
            </ul>
            
                </li>     
                <li class="nav-item dropdown px-1" id="social-media" role="none">
                <button class="ecl-button ecl-button--primary round-btn round-btn" type="button" data-i18n-label="SHARE" data-i18n-title="SHARE" data-bs-toggle="dropdown" role="menuitem" aria-haspopup="true" aria-expanded="true" id="shareChart">
                <i class="fas fa-share-alt" aria-hidden="true"></i>
              </button>
              
              <ul class="dropdown-menu dropdown-menu-end" role="menu" data-i18n-labelledby="SHARE">
              <p id="SHARETITLE" class="ecl-social-media-share__description" style="font-weight: normal;" data-i18n="SHARE"></p>
              <button class="dropdown-item ecl-link ecl-link--standalone" role="menuitem" onclick="socialNameSpace.twitter()" data-i18n-label="TWITTER">
              <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/twiter.svg" alt="Twitter Icon" width="24" height="24" focusable="false" aria-hidden="true">
              </span>
              <span class="ecl-link__label" data-i18n="TWITTER"></span>                  
            </button>
            
            <button class="dropdown-item ecl-link ecl-link--standalone" role="menuitem" onclick="socialNameSpace.facebook()" data-i18n-label="FACEBOOK">
              <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/face.svg" alt="Facebook Icon" width="24" height="24" focusable="false" aria-hidden="true">
              </span>
              <span class="ecl-link__label" data-i18n="FACEBOOK"></span>                  
            </button>
            
            <button class="dropdown-item ecl-link ecl-link--standalone" role="menuitem" onclick="socialNameSpace.linkedin()" data-i18n-label="LINKEDIN">
              <span class="socialImg ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon">
                <img class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" src="img/social-media/linkdin.svg" alt="Linkedin Icon" width="24" height="24" focusable="false" aria-hidden="true">
              </span>
              <span class="ecl-link__label" data-i18n="LINKEDIN"></span>                  
            </button>
            
                  </ul>
              </li>    
                <!-- <li class="nav-item button px-1" id="shareChart" role="none">
                  <button id="shareBtn" title="share chart" type="button" class="ecl-button ecl-button--primary round-btn" aria-label="share chart" onclick="">
                    <i class="fas fa-share-alt"></i>
                  </button>
                </li> -->
                <li class="nav-item button px-1" id="embebedChart" role="none">
                <button id="embebedBtn" data-i18n-title="EMBED_CHART_IFRAME" type="button" class="ecl-button ecl-button--primary round-btn" data-i18n-label="EMBEDDED" onclick="exportIframe()">
                  <i class="fas fa-code"></i>
                </button>
              </li>

              </ul>
            </div>
            </div>

            
            <div id="chartOptionsMenu" class="toggleMenu">
              <div class="close-button-container">
              <button id="closeChartMenuBtn" class="btn btn-primary close-chart-menu-btn" data-i18n-label="CLOSE">
              <i class="fas fa-times"></i>
            </button>
            
              </div>
              <div class="dropdown-grid">
                <div class="row w-75">
                  <div id="containerCountry" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerIndicator" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerFlow" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerFuel" class="col-12 col-sm-4 p-2"></div>
                  <div id="containerUnit" class="col-12 col-sm-4 p-2"></div>
                </div>
              </div>
            </div>
          </div>`;

    const mobileContent = /*html*/ `<div class="">
        <div class="col-12 subNavOne">
          <div class="">              
          <button id="tools" class="btnGroup" type="button" data-i18n-label="TOOLS" data-i18n-title="TOOLS" aria-haspopup="true">
          <i class="fas fa-ellipsis-h"></i>      
          <span class="iconText" data-i18n="TOOLS"></span>    
        </button>
        
          </div>
          <div class="">              
          <button id="menu" class="btnGroup" type="button" data-i18n-label="MENU" data-i18n-title="MENU" aria-haspopup="true">
            <i class="fas fa-bars"></i>                    
            <span class="iconText" data-i18n="MENU"></span>           
          </button>
        </div>
        

        <div class="chartMenuMobile toggleMenu">
          <ul id="chartBtns" role="menubar" aria-label="Options graph toolbox" class="navbar-nav ms-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 50vw;">
              <li class="nav-item dropdown px-1" id="infoBtnChart" role="none">
              <button class="ecl-button ecl-button--primary round-btn" type="button" data-i18n-label="INFO" data-bs-toggle="dropdown" role="menuitem" data-i18n-title="INFO" aria-haspopup="true" aria-expanded="true" id="infoBtn">
              <i class="fas fa-info"></i>
            </button>
            
            <ul class="dropdown-menu dropdown-menu-end" role="menu" data-i18n-labelledby="INFOBTN">
              <button class="dropdown-item" role="menuitem" onclick="tutorial()" data-i18n-label="TUTORIAL" value="Tutorial" data-i18n="TUTORIAL"></button>
              <button class="dropdown-item" role="menuitem" onclick="openMeta()" data-i18n-label="META" value="metadata" data-i18n="META"></button>
              <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.email()" data-i18n-label="FEED" value="Feedback" data-i18n="FEED"></button>
            </ul>
            
              </li>
              <li class="nav-item dropdown px-1" id="downloadChart" role="none">
              <button class="ecl-button ecl-button--primary round-btn" type="button" data-i18n-label="DOWNLOAD" data-bs-toggle="dropdown" role="menuitem" data-i18n-title="DOWNLOAD" aria-haspopup="true" aria-expanded="true" id="downloadBtn">
              <i class="fas fa-download"></i>
            </button>
            
            <ul class="dropdown-menu dropdown-menu-end" role="menu" data-i18n-labelledby="DOWNLOAD">
              <button class="dropdown-item" role="menuitem" onclick="exportPngChart()" data-i18n-label="DOWNLOAD_PNG" data-i18n="DOWNLOAD_PNG"></button>
              <button class="dropdown-item" role="menuitem" onclick="exportJpegChart()" data-i18n-label="DOWNLOAD_JPEG" data-i18n="DOWNLOAD_JPEG"></button>
              <button class="dropdown-item" role="menuitem" onclick="exportXlsChart()" data-i18n-label="DOWNLOAD_XLS" data-i18n="DOWNLOAD_XLS"></button>
            </ul>
            
              </li>     
              <li class="nav-item button px-1" id="embebedChart" role="none">
              <button id="embebedBtn" type="button" class="ecl-button ecl-button--primary round-btn" data-i18n-title="EMBEDDED" data-i18n-label="EMBEDDED" onclick="exportIframe()">
              <i class="fas fa-code"></i>
            </button>
            
              </li>
              <li class="nav-item dropdown px-1" id="social-media-dropdown" role="none">
              <button class="ecl-button ecl-button--primary round-btn round-btn" type="button" data-i18n-label="SHARE" data-bs-toggle="dropdown" role="menuitem" data-i18n-title="SHARE" aria-haspopup="true" aria-expanded="true" id="shareChart1">
              <i class="fas fa-share-alt" aria-hidden="true"></i>
            </button>
            
            <ul class="dropdown-menu dropdown-menu-end" role="menu" data-i18n-labelledby="SHARE_CHART">
              <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.twitter()" data-i18n-label="TWITTER" data-i18n="TWITTER"></button>
              <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.facebook()" data-i18n-label="FACEBOOK" data-i18n="FACEBOOK"></button>
              <button class="dropdown-item" role="menuitem" onclick="socialNameSpace.linkedin()" data-i18n-label="LINKEDIN" data-i18n="LINKEDIN"></button>
            </ul>
            </li>    
          </ul>
        </div>

        <div id="chartOptionsMenu" class="toggleMenu">
        <div class="close-button-container">
        <button id="closeChartMenuBtn" class="btn btn-primary close-chart-menu-btn" data-i18n-label="CLOSE">
        <i class="fas fa-times"></i>
      </button>
      
        </div>
        <div class="dropdown-grid">
          <div class="row w-75">
            <div id="containerCountry" class="col-12 col-sm-4 p-2"></div>
            <div id="containerIndicator" class="col-12 col-sm-4 p-2"></div>
            <div id="containerFlow" class="col-12 col-sm-4 p-2"></div>
            <div id="containerFuel" class="col-12 col-sm-4 p-2"></div>
            <div id="containerUnit" class="col-12 col-sm-4 p-2"></div>
          </div>
        </div>
      </div>


        </div>
        <div class="col-12 subNavTwo">
          <div class="text-group">
              <h2 id="title" class="title"></h2>
              <h6 id="subtitle" class="subtitle"></h6>      
            </div>
        </div>
      </div>`;

    if (isMobile) {
      this.subNavbar.innerHTML = mobileContent;

      this.toolsButton = this.subNavbar.querySelector("#tools");
      this.chartToolsMenu = this.subNavbar.querySelector(".chartMenuMobile");

      this.menuButton = this.subNavbar.querySelector("#menu");
      this.chartOptionsMenu = this.subNavbar.querySelector("#chartOptionsMenu");

      this.chartMenuOpen = this.subNavbar.querySelector("#menu");

      this.toolsButton.addEventListener("click", () => {
        this.toggleMenu(this.toolsButton, this.chartToolsMenu, "toggleMenu");
        if (this.menuButton.classList.contains("menuOpen")) {
          this.toggleMenu(this.menuButton, this.chartOptionsMenu, "toggleMenu");
        }
      });

      this.menuButton.addEventListener("click", () => {
        this.toggleMenu(this.menuButton, this.chartOptionsMenu, "toggleMenu");

        // Check if toolsButton has the menuOpen class and toggle it
        if (this.toolsButton.classList.contains("menuOpen")) {
          this.toggleMenu(this.toolsButton, this.chartToolsMenu, "toggleMenu");
        }
      });
    } else {
      this.subNavbar.innerHTML = notMobileContent;

      // this.dropdownButton = this.subNavbar.querySelector('.dropdown-toggle');

      this.menuButton = this.subNavbar.querySelector("#menu");
      this.chartOptionsMenu = this.subNavbar.querySelector("#chartOptionsMenu");
      this.chartMenuOpen = this.subNavbar.querySelector("#menu");

      this.menuButton.addEventListener("click", () => {
        this.toggleChartOptionsMenu();
        // $('#menu').css({"background-color": "#f3f6fc", "color": "#0e47cb"});
        trapTab();
      });

      this.closeChartMenuBtn =
        this.subNavbar.querySelector("#closeChartMenuBtn");

      this.closeChartMenuBtn.addEventListener("click", () => {
        this.toggleChartOptionsMenu();
      });
    }
  }

  toggleMenu(button, menu, menuClass) {
    menu.classList.toggle(menuClass);
    button.classList.toggle("menuOpen");
  }

  toggleChartOptionsMenu() {
    this.chartOptionsMenu.classList.toggle("toggleMenu");
    this.chartMenuOpen.classList.toggle("menuOpen");
  }

  addToDOM(targetElement) {
    const container = document.querySelector(targetElement);
    container.appendChild(this.subNavbar);
  }
}
