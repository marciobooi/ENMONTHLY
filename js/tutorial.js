let tourDriver = null;

function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(nameEQ) == 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}

function checkAndShowTutorial() {
    const tutorialCookie = getCookie("tutorialShown");
    if (!tutorialCookie) {
        // If the cookie doesn't exist, show the tutorial and set the cookie
        setTimeout(() => {
            tutorial(); // Function to show the tutorial
            setCookie("tutorialShown", "true", 30); // Set cookie for 30 days
        }, 600);
    }
}

function tutorial() {

	if (tourDriver && tourDriver.isActive()) {
		tourDriver.destroy();
	}

	const driver = window.driver.js.driver;

	const steps = [
		{
			element: "#find-more-menu-icon",
			popover: {
				title: languageNameSpace.tutorial["TUTO_1"],
				description: languageNameSpace.tutorial["TUTO_2"],
				// On the first step the left button closes the tour, as before
				prevBtnText: languageNameSpace.labels['CLOSE'],
				disableButtons: [],
				onPrevClick: () => { tourDriver.destroy(); }
			}
		},
		{
			element: "path:nth-child(10)",
			popover: {
				title: languageNameSpace.tutorial["TUTO_3"],
				description: languageNameSpace.tutorial["TUTO_4"]
			}
		},
		{
			element: ".highcharts-series",
			popover: {
				title: languageNameSpace.tutorial["TUTO_5"],
				description: languageNameSpace.tutorial["TUTO_6"]
			}
		},
		{
			element: "#menu",
			popover: {
				title: languageNameSpace.tutorial["TUTO_7"],
				description: languageNameSpace.tutorial["TUTO_8"]
			}
		},
		{
			element: "#tb-togle-table",
			popover: {
				title: languageNameSpace.tutorial["TUTO_9"],
				description: languageNameSpace.tutorial["TUTO_10"]
			}
		},
		{
			element: "#infoBtn",
			popover: {
				title: languageNameSpace.tutorial["TUTO_11"],
				description: languageNameSpace.tutorial["TUTO_12"]
			}
		},
		{
			element: "#downloadBtn",
			popover: {
				title: languageNameSpace.tutorial["TUTO_13"],
				description: languageNameSpace.tutorial["TUTO_14"]
			}
		},
		{
			element: "#embebedBtn",
			popover: {
				title: languageNameSpace.tutorial["TUTO_15"],
				description: languageNameSpace.tutorial["TUTO_16"]
			}
		},
		{
			element: "#lang-selection",
			popover: {
				title: languageNameSpace.tutorial["TUTO_17"],
				description: languageNameSpace.tutorial["TUTO_18"]
			}
		},
		{
			element: "#social-media",
			popover: {
				title: languageNameSpace.tutorial["TUTO_19"],
				description: languageNameSpace.tutorial["TUTO_20"]
			}
		}
	];

	tourDriver = driver({
		animate: true,
		allowClose: true,
		showProgress: false,
		smoothScroll: false,
		popoverClass: "customTooltip",
		nextBtnText: languageNameSpace.labels['NEXT'],
		prevBtnText: languageNameSpace.labels['BACK'],
		doneBtnText: languageNameSpace.labels['CLOSE'],
		steps: steps,
		onPopoverRender: (popover) => {
			// Localised accessible name for the "x" close button
			popover.closeButton.setAttribute('aria-label', languageNameSpace.labels['CLOSE']);
		},
		onDestroyed: () => {
			window.scrollTo(0, 0);
			// Return focus to the info button after driver restores its own focus
			setTimeout(() => {
				const infoBtn = document.getElementById('infoBtn');
				if (infoBtn) {
					infoBtn.focus();
				}
			}, 0);
		}
	});

	tourDriver.drive();
}
