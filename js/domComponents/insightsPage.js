/*
  Insights page renderer.

  Turns the numbers produced by insightsData.js into the markup
  css/newStiles/insights.css targets, and injects it into #insightsContent
  inside the #insightsPage section (see enmonthly.html). Triggered from
  toggleInsightsView(true) in subNavBarComponent.js so the content always
  reflects the country currently selected on the main chart.

  Mirrors the architecture of ENPRICES's own insightsView.js (IIFE render
  namespace, async load()/render()/renderLoading()/renderError()).

  Built against insights.md's own "RECOMMENDED INFOGRAPHIC FLOW" - all 15
  flow items are now implemented: Headline, KPI Scorecard, Key Findings,
  Energy Transition, Electricity Mix, Historical Evolution, Trend &
  Momentum, Energy Security, Gas Market, Oil Market, Market Pressure,
  Electricity Trade, EU Comparison, Direction of Travel, Key Takeaways.
  Visuals: donut (Energy Transition), gauge (Fossil Dependency), stacked
  area chart (Electricity Mix), trend-line sparklines (Renewable Momentum,
  Gas Consumption, Crude Oil Price) - see insightsData.js's header for the
  md-section-number mapping.
*/
const insightsRenderNameSpace = (function () {

  let currentRequestId = 0;
  let cachedData = null;
  let popoverIdCounter = 0;

  // ---- label / formatting helpers ---------------------------------------------------

  function t(key, fallback) {
    return (typeof languageNameSpace !== "undefined" && languageNameSpace.labels[key]) || fallback || key;
  }

  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatTemplate(template, vars) {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? vars[key] : match));
  }

  function formatMonth(monthCode) {
    if (!monthCode) return "";
    const parts = monthCode.split("-");
    const monthIdx = parseInt(parts[1], 10) - 1;
    const months = (Highcharts.getOptions().lang && Highcharts.getOptions().lang.months) || [];
    return (months[monthIdx] || parts[1]) + " " + parts[0];
  }

  function formatNumber(value, decimals) {
    if (typeof value !== "number" || isNaN(value)) return null;
    return Highcharts.numberFormat(value, decimals != null ? decimals : 1, ".", " ");
  }

  function formatPercent(value, decimals) {
    const n = formatNumber(value, decimals);
    return n === null ? null : n + "%";
  }

  function countryLabel(geo) {
    return t(geo, geo);
  }

  function directionIcon(direction) {
    if (direction === "up") return "fa-arrow-up";
    if (direction === "down") return "fa-arrow-down";
    return "fa-minus";
  }

  function directionLabel(direction) {
    if (direction === "up") return t("INSIGHTS_RISING", "Rising");
    if (direction === "down") return t("INSIGHTS_FALLING", "Falling");
    return t("INSIGHTS_STABLE", "Stable");
  }

  // Formats a month-on-month delta expressed in percentage points (e.g. a
  // renewable-share change), with a direction icon/label - used as a KPI
  // card's `sub` line.
  function changeSubPp(deltaPp, vsLabel) {
    if (typeof deltaPp !== "number" || isNaN(deltaPp)) return null;
    const direction = deltaPp > 0.05 ? "up" : deltaPp < -0.05 ? "down" : "stable";
    const sign = deltaPp > 0 ? "+" : "";
    return '<i class="fas ' + directionIcon(direction) + '" aria-hidden="true"></i> ' + esc(directionLabel(direction)) +
      ' (' + sign + esc(formatNumber(deltaPp, 1)) + ' pp ' + esc(vsLabel) + ')';
  }

  // ---- card / section primitives -----------------------------------------------------

  function card(opts) {
    const hasValue = opts.value !== null && opts.value !== undefined && opts.value !== "";
    return '<div class="insight-card' + (opts.modifier ? ' insight-card--' + opts.modifier : '') + '">' +
      '<div class="insight-card__label"><span>' + esc(opts.label) + '</span></div>' +
      '<div class="insight-card__value">' + (hasValue ? opts.value : esc(t("INSIGHTS_NOT_AVAILABLE", "Not available"))) + '</div>' +
      (opts.sub ? '<div class="insight-card__sub">' + opts.sub + '</div>' : "") +
      (opts.note ? '<div class="insight-card__note">' + esc(opts.note) + '</div>' : "") +
      '</div>';
  }

  // One "how is this calculated" popover per section, attached to the title -
  // not per card. insights.css already positions `.ecl-popover__container`
  // absolutely below `.insights-section__title`, so no JS positioning math
  // is needed here (unlike a free-floating popover attached to an arbitrary button).
  function section(titleText, bodyHtml, info) {
    if (!bodyHtml) return "";
    popoverIdCounter++;
    const popoverId = "insightPopover-" + popoverIdCounter;

    let popoverHtml = "";
    if (info) {
      const whatHtml = info.whatItIs ? '<div class="insight-popover-card__item"><strong>' + esc(t("INSIGHTS_WHAT_IT_IS", "What it is")) + ':</strong> ' + esc(info.whatItIs) + '</div>' : "";
      const calcHtml = info.calculation ? '<div class="insight-popover-card__item"><strong>' + esc(t("INSIGHTS_CALCULATION", "Calculation")) + ':</strong> <code>' + esc(info.calculation) + '</code></div>' : "";
      const purposeHtml = info.purpose ? '<div class="insight-popover-card__item"><strong>' + esc(t("INSIGHTS_PURPOSE", "Purpose")) + ':</strong> ' + esc(info.purpose) + '</div>' : "";
      const calcLabel = t("INSIGHTS_CALC_LABEL", "How is this calculated?");

      popoverHtml = '<span class="ecl-popover">' +
        '<button type="button" class="insight-card__info-btn ecl-popover__toggle" aria-controls="' + popoverId + '" aria-expanded="false" title="' + esc(calcLabel) + '" onclick="insightsRenderNameSpace.togglePopover(this, event)">' +
        '<span aria-hidden="true">i</span><span class="ecl-u-sr-only">' + esc(calcLabel) + '</span>' +
        '</button>' +
        '<div id="' + popoverId + '" class="ecl-popover__container" hidden>' +
        '<button type="button" class="ecl-popover__close" aria-label="' + esc(t("CLOSE", "Close")) + '" onclick="insightsRenderNameSpace.closePopover(this, event)">' +
        '<span aria-hidden="true">&times;</span><span class="ecl-u-sr-only">' + esc(t("CLOSE", "Close")) + '</span>' +
        '</button>' +
        '<h4 class="insight-popover-card__title">' + esc(titleText) + '</h4>' +
        whatHtml + calcHtml + purposeHtml +
        '</div>' +
        '</span>';
    }

    return '<section class="insights-section">' +
      '<h3 class="insights-section__title">' + esc(titleText) + popoverHtml + '</h3>' +
      bodyHtml +
      '</section>';
  }

  function togglePopover(btn, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const $popover = $(btn).closest(".ecl-popover");
    const $container = $popover.find(".ecl-popover__container");
    const isHidden = $container.attr("hidden") !== undefined;

    $(".ecl-popover__container").attr("hidden", "hidden");
    $(".ecl-popover__toggle").attr("aria-expanded", "false");

    if (isHidden) {
      $container.removeAttr("hidden");
      $(btn).attr("aria-expanded", "true");
    }
  }

  function closePopover(btn, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const $popover = $(btn).closest(".ecl-popover");
    $popover.find(".ecl-popover__container").attr("hidden", "hidden");
    $popover.find(".ecl-popover__toggle").attr("aria-expanded", "false");
  }

  // Hovering a composition-bar segment or its matching legend swatch
  // highlights both (and dims every other fuel source), so the bar's
  // colours are easy to trace back to their label.
  function highlightSource(el) {
    const siec = $(el).attr("data-siec");
    if (!siec) return;
    $("[data-siec]").each(function () {
      const isMatch = $(this).attr("data-siec") === siec;
      $(this).css({
        transition: "all 0.15s ease",
        opacity: isMatch ? "1" : "0.3",
        filter: isMatch ? "brightness(1.15)" : "grayscale(0.4)",
      });
    });
  }

  function unhighlightSource() {
    $("[data-siec]").css({ opacity: "", filter: "" });
  }

  function scrollToTop() {
    const target = document.getElementById("insightsPage") || document.getElementById("insightsView");
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Move focus back to the panel too, matching how opening the view
    // already focuses it - helps keyboard/screen-reader users, not just
    // mouse users scrolling visually.
    const panel = document.querySelector("#insightsContent .insights-panel");
    if (panel) panel.focus();
  }

  // ---- Section 1: Headline of the Month ---------------------------------------------

  function renderHeadline(data) {
    const geoLabel = countryLabel(data.geo);
    const monthLabel = formatMonth(data.latest.month);
    const h = data.headline;

    let templateKey, fallback, vars;
    switch (h.type) {
      case "record_high":
        templateKey = "INSIGHTS_HEADLINE_RECORD_HIGH";
        fallback = "{country} reached a record renewable electricity share of {value} in {month}.";
        vars = { country: esc(geoLabel), value: esc(formatPercent(h.value)), month: esc(formatMonth(h.month)) };
        break;
      case "record_low":
        templateKey = "INSIGHTS_HEADLINE_RECORD_LOW";
        fallback = "{country} recorded its lowest renewable electricity share of {value} in {month}.";
        vars = { country: esc(geoLabel), value: esc(formatPercent(h.value)), month: esc(formatMonth(h.month)) };
        break;
      case "crossover_renewables_up":
        templateKey = "INSIGHTS_HEADLINE_CROSSOVER_UP";
        fallback = "Renewables overtook fossil fuels in {country}'s electricity mix in {month}.";
        vars = { country: esc(geoLabel), month: esc(formatMonth(h.month)) };
        break;
      case "crossover_fossil_up":
        templateKey = "INSIGHTS_HEADLINE_CROSSOVER_DOWN";
        fallback = "Fossil fuels overtook renewables in {country}'s electricity mix in {month}.";
        vars = { country: esc(geoLabel), month: esc(formatMonth(h.month)) };
        break;
      default:
        templateKey = "INSIGHTS_HEADLINE_DEFAULT";
        fallback = "In {month}, renewables made up {value} of {country}'s electricity generation.";
        vars = { country: esc(geoLabel), value: esc(formatPercent(h.value)), month: esc(monthLabel) };
    }

    const headlineText = formatTemplate(t(templateKey, fallback), vars);
    return '<p class="insights-summary">' + headlineText + '</p>';
  }

  // ---- Section 2: KPI Scorecard -------------------------------------------------------

  function renderKpiSection(data) {
    const kpi = data.kpi;

    const renewableCard = card({
      label: t("INSIGHTS_KPI_RENEWABLE_SHARE", "Renewable Share"),
      value: esc(formatPercent(kpi.renewableShare.value)),
      sub: changeSubPp(kpi.renewableShare.deltaMoM, t("INSIGHTS_VS_PREV_MONTH", "vs previous month")),
    });

    const fossilCard = card({
      label: t("INSIGHTS_KPI_FOSSIL_SHARE", "Fossil Share"),
      value: esc(formatPercent(kpi.fossilShare.value)),
      sub: changeSubPp(kpi.fossilShare.deltaMoM, t("INSIGHTS_VS_PREV_MONTH", "vs previous month")),
    });

    let tradeCard = "";
    if (kpi.tradeBalance) {
      const b = kpi.tradeBalance;
      tradeCard = card({
        label: t("INSIGHTS_KPI_TRADE_BALANCE", "Electricity Trade Balance"),
        value: esc((b.balance >= 0 ? "+" : "") + formatNumber(b.balance, 0) + " GWh"),
        sub: esc(formatMonth(b.month)),
        note: b.balance >= 0 ? t("INSIGHTS_NET_EXPORTER", "Net exporter") : t("INSIGHTS_NET_IMPORTER", "Net importer"),
      });
    }

    let gasCard = "";
    if (kpi.gasDependency) {
      const g = kpi.gasDependency;
      gasCard = card({
        label: t("INSIGHTS_KPI_GAS_DEPENDENCY", "Gas Import Dependency"),
        value: esc(formatPercent(g.dependency)),
        sub: esc(formatMonth(g.month)),
      });
    }

    return section(
      t("INSIGHTS_KPI_TITLE", "KPI Scorecard"),
      '<div class="insights-cards">' + renewableCard + fossilCard + tradeCard + gasCard + '</div>',
      {
        whatItIs: t("INSIGHTS_KPI_WHAT_IT_IS", "A quick scoreboard of the country's energy transition, trade position and import exposure this month."),
        calculation: "Renewable % = (RA100+RA200+RA300+RA400+RA500_5160)/TOTAL×100 · Fossil % = (C0000+G3000+O4000XBIO)/TOTAL×100 · Trade = EXP−IMP · Gas dependency % = Net_imp/(IPRD+Net_imp)×100",
        purpose: t("INSIGHTS_KPI_PURPOSE", "Gives a quick read on transition progress, trade exposure and import dependency."),
      }
    );
  }

  // For a difference between two shares/percentages (e.g. renewable share
  // 60% -> 65%), correctly labelled in percentage points.
  function formatSignedPp(deltaPp, decimals) {
    return formatSigned(deltaPp, decimals, " pp");
  }

  // For a relative change in a raw quantity (e.g. GWh output up 30%) -
  // NOT the same unit as a percentage-point difference, so must not be
  // suffixed "pp".
  function formatSignedPercent(pctChange, decimals) {
    return formatSigned(pctChange, decimals, "%");
  }

  function formatSigned(value, decimals, suffix) {
    if (typeof value !== "number" || isNaN(value)) return null;
    const sign = value > 0 ? "+" : "";
    return sign + formatNumber(value, decimals != null ? decimals : 1) + (suffix || "");
  }

  // ---- Section 3: Key Findings ---------------------------------------------------------

  function renderFinding(f) {
    switch (f.type) {
      // Plain (unsigned) pp magnitude - the surrounding sentence's verb
      // ("rose"/"fell") already carries the direction, so a "+"/"-" prefix
      // here would be redundant at best and contradictory at worst.
      case "largest_increase":
        return formatTemplate(
          t("INSIGHTS_FINDING_LARGEST_INCREASE", "The largest month-on-month jump on record: renewable share rose {delta} between {previousMonth} and {month}."),
          { delta: esc(formatNumber(Math.abs(f.delta), 1)) + " pp", previousMonth: esc(formatMonth(f.previousMonth)), month: esc(formatMonth(f.month)) }
        );
      case "largest_decrease":
        return formatTemplate(
          t("INSIGHTS_FINDING_LARGEST_DECREASE", "The largest month-on-month drop on record: renewable share fell {delta} between {previousMonth} and {month}."),
          { delta: esc(formatNumber(Math.abs(f.delta), 1)) + " pp", previousMonth: esc(formatMonth(f.previousMonth)), month: esc(formatMonth(f.month)) }
        );
      case "new_record_high":
        return formatTemplate(
          t("INSIGHTS_FINDING_RECORD_HIGH", "New historical high: {value} renewable share, the highest on record."),
          { value: esc(formatPercent(f.value)) }
        );
      case "new_record_low":
        return formatTemplate(
          t("INSIGHTS_FINDING_RECORD_LOW", "New historical low: {value} renewable share, the lowest on record."),
          { value: esc(formatPercent(f.value)) }
        );
      case "eu_deviation": {
        const above = f.gapPp >= 0;
        const key = above ? "INSIGHTS_FINDING_EU_ABOVE" : "INSIGHTS_FINDING_EU_BELOW";
        const fallback = above ? "Renewable share is {delta} above the EU27 average." : "Renewable share is {delta} below the EU27 average.";
        return formatTemplate(t(key, fallback), { delta: esc(formatNumber(Math.abs(f.gapPp), 1)) + " pp" });
      }
      case "largest_share_change": {
        const source = esc(t(f.siec, f.siec));
        const up = f.delta >= 0;
        const key = up ? "INSIGHTS_FINDING_SHARE_CHANGE_UP" : "INSIGHTS_FINDING_SHARE_CHANGE_DOWN";
        const fallback = up ? "{source} saw the biggest month-on-month increase, +{value} GWh." : "{source} saw the biggest month-on-month decrease, {value} GWh.";
        return formatTemplate(t(key, fallback), { source, value: esc(formatNumber(Math.abs(f.delta), 0)) });
      }
      // Cross-domain findings (insights.md #30 "Automatic Insight Feed") -
      // reuses the label maps already defined for the Energy Security section.
      case "energy_security": {
        const levelLabel = t(SECURITY_LEVEL_LABEL_KEY[f.level], SECURITY_LEVEL_LABEL_FALLBACK[f.level]);
        const factorLabel = t(SECURITY_FACTOR_LABEL_KEY[f.factorKey], SECURITY_FACTOR_LABEL_FALLBACK[f.factorKey]);
        return formatTemplate(
          t("INSIGHTS_FINDING_ENERGY_SECURITY", "Energy security risk is {level}, driven mainly by {factor} ({value})."),
          { level: esc(levelLabel), factor: esc(factorLabel), value: esc(formatPercent(f.factorValue)) }
        );
      }
      case "oil_price_move": {
        const up = f.deltaPct >= 0;
        const key = up ? "INSIGHTS_FINDING_OIL_PRICE_UP" : "INSIGHTS_FINDING_OIL_PRICE_DOWN";
        const fallback = up ? "Crude oil price jumped {delta} month-on-month, to {price}." : "Crude oil price dropped {delta} month-on-month, to {price}.";
        return formatTemplate(t(key, fallback), { delta: esc(formatPercent(Math.abs(f.deltaPct))), price: esc(formatNumber(f.price, 1)) + " USD/bbl" });
      }
      default:
        return "";
    }
  }

  function renderFindingsSection(data) {
    const findings = data.findings || [];
    if (!findings.length) return "";

    const items = findings.map((f) => '<li class="insights-note">' + renderFinding(f) + '</li>').join("");

    return section(
      t("INSIGHTS_FINDINGS_TITLE", "Key Findings"),
      '<ul class="insights-note-list">' + items + '</ul>',
      {
        whatItIs: t("INSIGHTS_FINDINGS_WHAT_IT_IS", "The most notable facts auto-detected in this month's data."),
        calculation: t("INSIGHTS_FINDINGS_CALCULATION", "Largest historical month-on-month swings, new records, EU27 deviation and the fuel with the biggest single-month move."),
        purpose: t("INSIGHTS_FINDINGS_PURPOSE", "Surfaces the stories worth reading first, without digging through the raw series."),
      }
    );
  }

  // ---- Section 4: Energy Transition (donut) --------------------------------------------

  function buildDonutSvg(slices) {
    const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
    const r = 15.915; // circumference ~= 100, so dasharray can be read directly as a percentage
    let cumulative = 0;

    const circles = slices.map((slice) => {
      const percent = (slice.value / total) * 100;
      const dashoffset = -cumulative;
      cumulative += percent;
      return '<circle cx="21" cy="21" r="' + r + '" fill="transparent" stroke="' + slice.color + '" stroke-width="5" ' +
        'stroke-dasharray="' + percent.toFixed(2) + ' ' + (100 - percent).toFixed(2) + '" stroke-dashoffset="' + dashoffset.toFixed(2) + '"></circle>';
    }).join("");

    return '<svg class="insights-donut-svg" viewBox="0 0 42 42" role="img" aria-hidden="true">' + circles + '</svg>';
  }

  // insights.md #7 "Fossil Dependency": Visual: Gauge. A semicircular
  // progress arc (0-100%, drawn left-to-right) coloured by risk zone.
  const GAUGE_ZONES = [
    { max: 33, color: "#15803d", labelKey: "INSIGHTS_GAUGE_LOW", fallback: "Low (< 33%)" },
    { max: 66, color: "#ca8a04", labelKey: "INSIGHTS_GAUGE_MEDIUM", fallback: "Medium (33-66%)" },
    { max: 100, color: "#b91c1c", labelKey: "INSIGHTS_GAUGE_HIGH", fallback: "High (≥ 66%)" },
  ];

  function gaugeColor(value) {
    const zone = GAUGE_ZONES.find((z) => value < z.max) || GAUGE_ZONES[GAUGE_ZONES.length - 1];
    return zone.color;
  }

  function buildGaugeSvg(value) {
    const cx = 80, cy = 88, r = 62, strokeWidth = 14;
    const circumference = Math.PI * r; // half circumference - the arc spans 180 degrees
    const pct = Math.max(0, Math.min(100, value || 0)) / 100;
    const fillLength = pct * circumference;
    const color = gaugeColor(value);
    const arcPath = "M " + (cx - r) + " " + cy + " A " + r + " " + r + " 0 0 1 " + (cx + r) + " " + cy;

    return '<svg class="insights-gauge__svg" viewBox="0 0 160 112" role="img" aria-hidden="true">' +
      '<path class="insights-gauge__track" d="' + arcPath + '" stroke-width="' + strokeWidth + '"></path>' +
      '<path class="insights-gauge__fill" d="' + arcPath + '" stroke="' + color + '" stroke-width="' + strokeWidth + '" stroke-dasharray="' + fillLength.toFixed(1) + ' ' + circumference.toFixed(1) + '"></path>' +
      '<text class="insights-gauge__value" x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" fill="' + color + '">' + esc(formatPercent(value, 0)) + '</text>' +
      '</svg>';
  }

  function renderFossilGauge(fossilShare) {
    if (typeof fossilShare !== "number") return "";

    const legend = GAUGE_ZONES.map((z) => (
      '<div class="insights-gauge-legend__item"><span class="insights-gauge-legend__dot" style="background:' + z.color + '"></span>' + esc(t(z.labelKey, z.fallback)) + '</div>'
    )).join("");

    return '<div class="insights-gauge-container">' +
      '<div class="insights-gauge">' + buildGaugeSvg(fossilShare) + '</div>' +
      '<div class="insights-gauge-legend">' +
      '<div style="font-size:0.8rem;font-weight:700;color:#0f172a;margin-bottom:0.2rem">' + esc(t("INSIGHTS_FOSSIL_DEPENDENCY", "Fossil Dependency")) + '</div>' +
      legend +
      '</div></div>';
  }

  function renderEnergyTransitionSection(data) {
    const latest = data.latest;
    const nonRenewables = latest.fossil + latest.other;
    const climateTransitionIndicator = latest.fossil > 0 || latest.renewables > 0
      ? (latest.renewables / (latest.renewables + latest.fossil)) * 100
      : null;

    const slices = [
      { label: t("INSIGHTS_RENEWABLES", "Renewables"), value: latest.renewables, color: "#15803d" },
      { label: t("INSIGHTS_NON_RENEWABLES", "Non-renewables"), value: nonRenewables, color: "#64748b" },
    ];

    const legend = slices.map((s) => (
      '<div class="insights-donut-legend__item">' +
      '<span class="insights-donut-legend__badge"><span class="insights-donut-legend__dot" style="background:' + s.color + '"></span>' + esc(s.label) + '</span>' +
      '<strong>' + esc(formatNumber((s.value / latest.total) * 100, 1)) + '%</strong>' +
      '</div>'
    )).join("");

    const climateCard = climateTransitionIndicator !== null ? card({
      label: t("INSIGHTS_CLIMATE_TRANSITION", "Climate Transition Indicator"),
      value: esc(formatPercent(climateTransitionIndicator)),
      note: t("INSIGHTS_CLIMATE_TRANSITION_NOTE", "Renewables' share of renewables + fossils (nuclear excluded)"),
    }) : "";

    const body = '<div class="insights-transition-row">' +
      '<div class="insights-donut-container">' +
      '<div class="insights-donut-chart">' + buildDonutSvg(slices) +
      '<div class="insights-donut-center">' +
      '<div class="insights-donut-center__val">' + esc(formatPercent(latest.renewableShare)) + '</div>' +
      '<div class="insights-donut-center__lbl">' + esc(t("INSIGHTS_RENEWABLES", "Renewables")) + '</div>' +
      '</div></div>' +
      '<div class="insights-donut-legend">' + legend + '</div>' +
      '</div>' +
      renderFossilGauge(latest.fossilShare) +
            (climateCard ? '<div class="insights-cards" style="margin-bottom: 0;">' + climateCard + '</div>' : "") +
      '</div>' +
      renderRenewableVsNonRenewableCards(data) +
      renderFuelExplorerCard(data);


    return section(
      t("INSIGHTS_TRANSITION_TITLE", "Energy Transition"),
      body,
      {
        whatItIs: t("INSIGHTS_TRANSITION_WHAT_IT_IS", "How green the electricity system is right now."),
        calculation: "Renewables = RA100+RA200+RA300+RA400+RA500_5160 · Non-renewables = C0000+G3000+O4000XBIO+N9000 · Climate Transition Indicator = Renewables/(Renewables+Fossils) · Fossil Dependency = (C0000+G3000+O4000XBIO)/TOTAL",
        purpose: t("INSIGHTS_TRANSITION_PURPOSE", "Tracks the direction and pace of decarbonisation."),
      }
    );
  }

  // Renewable vs Non-Renewable (Fossil) vs Non-Renewable (Nuclear) - a 3-way
  // split (matching how Eurostat itself frames "renewables vs non-renewables"),
  // with the EU27 equivalent share alongside each row where available. Uses
  // the dataset's *official* TOTAL code as the denominator (see
  // insightsData.js's computeRenewableVsNonRenewable for why that's more
  // accurate than this app's own summed total for some countries).
  const FUEL_CATEGORY_LABEL_KEY = { renewable: "INSIGHTS_RENEWABLES", fossil: "INSIGHTS_FUEL_CLASS_FOSSIL", nuclear: "INSIGHTS_FUEL_CLASS_NUCLEAR" };
  const FUEL_CATEGORY_LABEL_FALLBACK = { renewable: "Renewables", fossil: "Non-Renewable (Fossil)", nuclear: "Non-Renewable (Nuclear)" };
  const FUEL_CATEGORY_COLOR = { renewable: "#15803d", fossil: "#b45309", nuclear: "#7c3aed" };

  function renderRenewableVsNonRenewableCards(data) {
    const rvnr = data.renewableVsNonRenewable;
    if (!rvnr) return "";

    const cards = rvnr.categories.map((cat, i) => {
      const sourcesLabel = cat.codes.map((c) => t(c, c)).join(", ");
      const euCat = rvnr.euCategories ? rvnr.euCategories[i] : null;
      return card({
        label: t(FUEL_CATEGORY_LABEL_KEY[cat.key], FUEL_CATEGORY_LABEL_FALLBACK[cat.key]),
        value: esc(formatPercent(cat.sharePct)),
        sub: esc(sourcesLabel),
        note: euCat ? t("INSIGHTS_VS_EU_AVERAGE", "vs EU27 average") + ': ' + formatPercent(euCat.sharePct) : null,
      });
    }).join("");

    return '<div class="insights-cards" style="margin-top: 1.1rem;">' + cards + '</div>';
  }

  // ---- Fuel Explorer: interactive drill-down matching the app's own
  // #selectFuel dropdown (js/populateFuels.js) exactly, code-for-code. ----

  const FUEL_EXPLORER_OPTIONS = ["TOTAL", "C0000", "CF", "RA200", "RA100", "G3000", "N9000", "O4000XBIO", "X9900", "RA500_5160", "RA400", "RA300"];
  const FUEL_EXPLORER_CLASS = {
    TOTAL: "total", CF: "aggregate", X9900: "other",
    C0000: "fossil", G3000: "fossil", O4000XBIO: "fossil",
    N9000: "nuclear",
    RA100: "renewable", RA200: "renewable", RA300: "renewable", RA400: "renewable", RA500_5160: "renewable",
  };
  const FUEL_EXPLORER_CLASS_LABEL_KEY = {
    total: "INSIGHTS_FUEL_CLASS_TOTAL", aggregate: "INSIGHTS_FUEL_CLASS_AGGREGATE", other: "INSIGHTS_FUEL_CLASS_OTHER",
    fossil: "INSIGHTS_FUEL_CLASS_FOSSIL", nuclear: "INSIGHTS_FUEL_CLASS_NUCLEAR", renewable: "INSIGHTS_RENEWABLES",
  };
  const FUEL_EXPLORER_CLASS_LABEL_FALLBACK = {
    total: "Total", aggregate: "Combustible Fuels (aggregate)", other: "Other / Not Classified",
    fossil: "Non-Renewable (Fossil)", nuclear: "Non-Renewable (Nuclear)", renewable: "Renewable",
  };
  const FUEL_EXPLORER_CLASS_COLOR = {
    total: "#334155", aggregate: "#64748b", other: "#94a3b8",
    fossil: "#b45309", nuclear: "#7c3aed", renewable: "#15803d",
  };

  function fuelExplorerResultHtml(code, data) {
    const latest = data.latest;
    const value = latest.bySiec ? latest.bySiec[code] : undefined;
    const officialTotal = data.renewableVsNonRenewable ? data.renewableVsNonRenewable.officialTotal : latest.total;
    const pct = (typeof value === "number" && officialTotal) ? (value / officialTotal) * 100 : null;

    const classKey = FUEL_EXPLORER_CLASS[code] || "other";
    const classLabel = t(FUEL_EXPLORER_CLASS_LABEL_KEY[classKey], FUEL_EXPLORER_CLASS_LABEL_FALLBACK[classKey]);
    const classColor = FUEL_EXPLORER_CLASS_COLOR[classKey];

    return card({
      label: t(code, code),
      value: typeof value === "number" ? esc(formatNumber(value, 0)) + " GWh" : null,
      sub: '<span class="insight-badge" style="background:' + classColor + ';color:#fff">' + esc(classLabel) + '</span>',
      note: pct !== null ? formatPercent(pct) + " " + t("INSIGHTS_OF_TOTAL", "of total generation") : null,
    });
  }

  function renderFuelExplorerCard(data) {
    if (!data.latest || !data.latest.bySiec) return "";

    const options = FUEL_EXPLORER_OPTIONS
      .map((code) => '<option value="' + esc(code) + '"' + (code === "TOTAL" ? " selected" : "") + '>' + esc(t(code, code)) + '</option>')
      .join("");

    return '<div class="insights-widget-card">' +
      '<div class="insights-widget-card__title">' + esc(t("INSIGHTS_FUEL_EXPLORER_TITLE", "Fuel Explorer")) + '</div>' +
      '<div class="insights-input-group">' +
      '<label class="insights-input-label" for="insightFuelSelect">' + esc(t("INSIGHTS_SELECT_FUEL", "Select a fuel")) + '</label>' +
      '<select class="insight-select" id="insightFuelSelect" onchange="insightsRenderNameSpace.onFuelExplorerChange(this.value)">' + options + '</select>' +
      '</div>' +
      '<div id="insightFuelExplorerResult">' + fuelExplorerResultHtml("TOTAL", data) + '</div>' +
      '</div>';
  }

  function onFuelExplorerChange(code) {
    if (!cachedData) return;
    $("#insightFuelExplorerResult").html(fuelExplorerResultHtml(code, cachedData));
  }

  // ---- Section 5: Electricity Mix (composition, top/fastest/declining source) ---------

  // codes.js's `colors` is a plain array used for Highcharts series-index
  // colouring elsewhere in the app - it isn't keyed by siec code, so it
  // can't be reused here. Fixed, semantically-themed colours per fuel type
  // instead (blue/green family for renewables, warm/dark family for fossils).
  const SOURCE_COLORS = {
    RA100: "#0284c7", // Hydro
    RA200: "#b45309", // Geothermal
    RA300: "#0ea5e9", // Wind
    RA400: "#f59e0b", // Solar
    RA500_5160: "#16a34a", // Other renewables
    C0000: "#334155", // Coal
    G3000: "#ea580c", // Natural gas
    O4000XBIO: "#78350f", // Oil
    N9000: "#7c3aed", // Nuclear
  };

  function sourceColor(siec) {
    return SOURCE_COLORS[siec] || "#64748b";
  }

  // insights.md #5 "Electricity Mix": Visual: Stacked Area Chart. Renewables
  // stacked first (bottom) so the "green base" reads clearly against the
  // fossil/nuclear layers on top - same fuel colours and hover-highlight as
  // the composition bar/legend below it.
  const MIX_STACK_ORDER = ["RA100", "RA200", "RA300", "RA400", "RA500_5160", "C0000", "G3000", "O4000XBIO", "N9000"];

  function buildMixAreaSvg(rows) {
    const width = 900, height = 220, padding = 24;
    const xStep = rows.length > 1 ? (width - padding * 2) / (rows.length - 1) : 0;
    const xFor = (i) => padding + i * xStep;

    const totals = rows.map((r) => MIX_STACK_ORDER.reduce((sum, siec) => sum + (r.bySiec[siec] || 0), 0));
    const maxTotal = Math.max.apply(null, totals) || 1;
    const yFor = (v) => height - padding - (v / maxTotal) * (height - padding * 2);

    const stacked = rows.map((row) => {
      let cumulative = 0;
      return MIX_STACK_ORDER.map((siec) => {
        const v = row.bySiec[siec] || 0;
        const bottom = cumulative;
        cumulative += v;
        return { bottom, top: cumulative };
      });
    });

    const bands = MIX_STACK_ORDER.map((siec, sIdx) => {
      const topPts = stacked.map((month, i) => [xFor(i), yFor(month[sIdx].top)]);
      const bottomPts = stacked.map((month, i) => [xFor(i), yFor(month[sIdx].bottom)]).reverse();
      const d = topPts.concat(bottomPts).map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ") + " Z";
      return '<path class="insights-mix-area__band" data-siec="' + esc(siec) + '" d="' + d + '" fill="' + sourceColor(siec) + '" ' +
        'onmouseenter="insightsRenderNameSpace.highlightSource(this)" onmouseleave="insightsRenderNameSpace.unhighlightSource()"></path>';
    }).join("");

    return '<svg class="insights-mix-area__svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" role="img" aria-hidden="true">' + bands + '</svg>';
  }

  function renderMixAreaChart(series) {
    // Full history, not a recent slice - it's a continuous area chart (like
    // a stock-price chart), so hundreds of monthly points render fine; the
    // month spacing just gets tighter, it doesn't become unreadable the way
    // discrete bars/segments would.
    const rows = series;
    if (rows.length < 2) return "";
    const first = rows[0], last = rows[rows.length - 1];

    return '<div class="insights-mix-area">' +
      buildMixAreaSvg(rows) +
      '<div class="insights-mix-area__axis"><span>' + esc(formatMonth(first.month)) + '</span><span>' + esc(formatMonth(last.month)) + '</span></div>' +
      '</div>';
  }

  function renderElectricityMixSection(data) {
    const ranking = data.sourceRanking || [];
    if (!ranking.length) return "";

    const total = ranking.reduce((sum, s) => sum + s.value, 0) || 1;
    // A <button>, not a <div>: tooltipManager (js/tooltip.js) only wires its
    // own styled tooltip up for `button[title]`/`button[aria-label]`
    // elements - anything else keeps the browser's native title tooltip.
    const barSegments = ranking.map((s) => {
      const pct = (s.value / total) * 100;
      const color = sourceColor(s.siec);
      return '<button type="button" class="insights-composition-bar__segment" data-siec="' + esc(s.siec) + '" style="width:' + pct.toFixed(1) + '%;background:' + color + '" title="' + esc(t(s.siec, s.siec)) + ': ' + esc(formatNumber(pct, 1)) + '%" onmouseenter="insightsRenderNameSpace.highlightSource(this)" onmouseleave="insightsRenderNameSpace.unhighlightSource()"></button>';
    }).join("");

    // Full legend (not just the top few) - every segment gets a matching,
    // hoverable swatch so the bar's colours are actually identifiable.
    const legend = ranking.map((s) => {
      const color = sourceColor(s.siec);
      const pct = (s.value / total) * 100;
      return '<div class="insights-mini-profile__item" data-siec="' + esc(s.siec) + '" onmouseenter="insightsRenderNameSpace.highlightSource(this)" onmouseleave="insightsRenderNameSpace.unhighlightSource()">' +
        '<span class="insights-donut-legend__dot" style="background:' + color + '"></span>' +
        '<span class="insights-mini-profile__label">' + esc(t(s.siec, s.siec)) + '</span>' +
        '<span class="insights-mini-profile__value">' + esc(formatNumber(pct, 1)) + '%</span>' +
        '</div>';
    }).join("");

    const growth = data.sourceGrowth || {};
    let growthCards = "";
    if (growth.fastestGrowing) {
      growthCards += card({
        label: t("INSIGHTS_FASTEST_GROWING", "Fastest Growing Source"),
        value: esc(t(growth.fastestGrowing.siec, growth.fastestGrowing.siec)),
        sub: esc(formatSignedPercent(growth.fastestGrowing.pctChange)) + " " + esc(t("INSIGHTS_YOY", "year-on-year")),
      });
    }
    if (growth.largestDecline) {
      growthCards += card({
        label: t("INSIGHTS_LARGEST_DECLINE", "Largest Decline"),
        value: esc(t(growth.largestDecline.siec, growth.largestDecline.siec)),
        sub: esc(formatSignedPercent(growth.largestDecline.pctChange)) + " " + esc(t("INSIGHTS_YOY", "year-on-year")),
      });
    }

    const body = renderMixAreaChart(data.series) +
      '<div class="insights-composition-bar">' + barSegments + '</div>' +
      '<div class="insights-mini-profile">' + legend + '</div>' +
      (growthCards ? '<div class="insights-cards">' + growthCards + '</div>' : "");

    return section(
      t("INSIGHTS_MIX_TITLE", "Electricity Mix"),
      body,
      {
        whatItIs: t("INSIGHTS_MIX_WHAT_IT_IS", "The breakdown of electricity generation by individual fuel source this month."),
        calculation: t("INSIGHTS_MIX_CALCULATION", "Each source's share of total generation; growth is year-on-year change per source."),
        purpose: t("INSIGHTS_MIX_PURPOSE", "Shows which sources dominate the mix and which are moving fastest."),
      }
    );
  }

  // ---- Section 6: Historical Evolution (records + ranking) ----------------------------

  function renderHistoricalEvolutionSection(data) {
    const { records, historicalPercentile } = data;
    const he = data.historicalEvolution;
    if (!records) return "";

    const cards = [
      card({
        label: t("INSIGHTS_RECORDS_HIGH", "Historical maximum renewable share"),
        value: esc(formatPercent(records.max.renewableShare)),
        sub: esc(formatMonth(records.max.month)),
        modifier: "positive",
      }),
      card({
        label: t("INSIGHTS_RECORDS_LOW", "Historical minimum renewable share"),
        value: esc(formatPercent(records.min.renewableShare)),
        sub: esc(formatMonth(records.min.month)),
        modifier: "negative",
      }),
    ];

    if (typeof historicalPercentile === "number") {
      cards.push(card({
        label: t("INSIGHTS_PERCENTILE", "Historical Ranking"),
        value: esc(formatNumber(historicalPercentile, 0)) + t("INSIGHTS_PERCENTILE_SUFFIX", "th percentile"),
        note: t("INSIGHTS_PERCENTILE_NOTE", "Share of past months at or below the current renewable share"),
      }));
    }

    if (he && he.dataCoverage) {
      cards.push(card({
        label: t("INSIGHTS_DATA_COVERAGE", "Data Coverage"),
        value: esc(he.dataCoverage.years) + " " + esc(t("INSIGHTS_YEARS", "years")),
        sub: esc(t("INSIGHTS_SINCE", "Since")) + " " + esc(formatMonth(he.dataCoverage.firstMonth)),
      }));
    }

    if (he && he.recordBreakCount) {
      cards.push(card({
        label: t("INSIGHTS_RECORD_BREAKS", "Records Set"),
        value: String(he.recordBreakCount),
        sub: t("INSIGHTS_RECORD_BREAKS_SUB", "New all-time highs across the full history"),
      }));
    }

    if (he && he.longestStreaks) {
      const up = he.longestStreaks.longestIncrease;
      const down = he.longestStreaks.longestDecrease;
      if (up) {
        cards.push(card({
          label: t("INSIGHTS_LONGEST_STREAK_UP", "Longest Rising Streak"),
          value: up.months + " " + esc(t("INSIGHTS_MONTHS", "months")),
          sub: esc(formatMonth(up.startMonth)) + " → " + esc(formatMonth(up.endMonth)),
          modifier: "positive",
        }));
      }
      if (down) {
        cards.push(card({
          label: t("INSIGHTS_LONGEST_STREAK_DOWN", "Longest Falling Streak"),
          value: down.months + " " + esc(t("INSIGHTS_MONTHS", "months")),
          sub: esc(formatMonth(down.startMonth)) + " → " + esc(formatMonth(down.endMonth)),
          modifier: "negative",
        }));
      }
    }

    if (he && he.yearlyExtremes) {
      cards.push(card({
        label: t("INSIGHTS_BEST_YEAR", "Best Year"),
        value: he.yearlyExtremes.best.year,
        sub: esc(formatPercent(he.yearlyExtremes.best.avg)) + " " + esc(t("INSIGHTS_AVG", "Average")),
        modifier: "positive",
      }));
      cards.push(card({
        label: t("INSIGHTS_WORST_YEAR", "Worst Year"),
        value: he.yearlyExtremes.worst.year,
        sub: esc(formatPercent(he.yearlyExtremes.worst.avg)) + " " + esc(t("INSIGHTS_AVG", "Average")),
        modifier: "negative",
      }));
    }

    let milestonesHtml = "";
    if (he && he.milestoneCrossings && he.milestoneCrossings.length) {
      const items = he.milestoneCrossings.map((m) => (
        '<span class="insight-rank-item">' + m.threshold + '%: <strong>' + esc(formatMonth(m.month)) + '</strong></span>'
      )).join(" → ");
      milestonesHtml = '<div class="insights-rank-movement">' +
        '<div class="insights-rank-movement__label">' + esc(t("INSIGHTS_MILESTONES", "First Crossed")) + '</div>' +
        '<div class="insights-rank-movement__items">' + items + '</div>' +
        '</div>';
    }

    return section(
      t("INSIGHTS_HISTORY_TITLE", "Historical Evolution"),
      '<div class="insights-cards">' + cards.join("") + '</div>' + milestonesHtml,
      {
        whatItIs: t("INSIGHTS_HISTORY_WHAT_IT_IS", "Where this month sits against the entire recorded history for this country."),
        calculation: t("INSIGHTS_HISTORY_CALCULATION", "Max/min and percentile across the full series; streaks are unbroken runs of month-on-month moves; best/worst year is by calendar-year average; milestones are the first month each round-number threshold was reached."),
        purpose: t("INSIGHTS_HISTORY_PURPOSE", "Puts the current reading in long-run perspective."),
      }
    );
  }

  // ---- Section 7: Trend & Momentum -----------------------------------------------------

  // Generic trend-line sparkline (insights.md's "Visual: Trend Line" shows
  // up for Renewable Momentum #6, and the same treatment is worth reusing
  // for Gas Consumption #11 and Crude Oil Price #14, which have the same
  // "value per month" shape). ref-lines for max/avg/min, markers for
  // max/min/latest, all built from `points = [{month, value}]`.
  function buildTrendSparkline(points, formatValue) {
    const width = 900, height = 220, padding = 28;
    const values = points.map((p) => p.value);
    const max = Math.max.apply(null, values);
    const min = Math.min.apply(null, values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const range = (max - min) || 1;

    const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const yFor = (v) => height - padding - ((v - min) / range) * (height - padding * 2);
    const xFor = (i) => padding + i * xStep;

    const coords = points.map((p, i) => [xFor(i), yFor(p.value)]);
    const linePath = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
    const areaPath = linePath +
      " L" + coords[coords.length - 1][0].toFixed(1) + "," + (height - padding) +
      " L" + coords[0][0].toFixed(1) + "," + (height - padding) + " Z";

    const maxIdx = values.indexOf(max);
    const minIdx = values.indexOf(min);
    const latestIdx = points.length - 1;

    const refLine = (v, cls) => '<line class="insights-sparkline__ref-line ' + cls + '" x1="' + padding + '" y1="' + yFor(v).toFixed(1) + '" x2="' + (width - padding) + '" y2="' + yFor(v).toFixed(1) + '"></line>';
    const marker = (idx, markerCls, labelCls, text) => {
      const [x, y] = coords[idx];
      return '<circle class="insights-sparkline__marker ' + markerCls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4"></circle>' +
        '<text class="insights-sparkline__label ' + labelCls + '" x="' + x.toFixed(1) + '" y="' + (y - 10).toFixed(1) + '" text-anchor="middle">' + text + '</text>';
    };

    return '<svg class="insights-sparkline__svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" role="img" aria-hidden="true">' +
      refLine(max, "insights-sparkline__ref-line--max") +
      refLine(avg, "insights-sparkline__ref-line--avg") +
      refLine(min, "insights-sparkline__ref-line--min") +
      '<path class="insights-sparkline__area" d="' + areaPath + '"></path>' +
      '<path class="insights-sparkline__line" d="' + linePath + '"></path>' +
      marker(maxIdx, "insights-sparkline__marker--max", "insights-sparkline__label--max", esc(formatValue(max))) +
      marker(minIdx, "insights-sparkline__marker--min", "insights-sparkline__label--min", esc(formatValue(min))) +
      marker(latestIdx, "insights-sparkline__marker--latest", "insights-sparkline__label--avg", esc(formatValue(values[latestIdx]))) +
      '</svg>';
  }

  function renderTrendLine(points, titleKey, titleFallback, formatValue) {
    if (points.length < 2) return "";
    const first = points[0], last = points[points.length - 1];

    return '<div class="insights-history-trend">' +
      '<div class="insights-history-trend__title">' + esc(t(titleKey, titleFallback)) +
      '<span class="insights-history-trend__meta">' + esc(formatMonth(first.month)) + ' – ' + esc(formatMonth(last.month)) + '</span></div>' +
      '<div class="insights-sparkline">' + buildTrendSparkline(points, formatValue) +
      '<div class="insights-sparkline__axis"><span>' + esc(formatMonth(first.month)) + '</span><span>' + esc(formatMonth(last.month)) + '</span></div>' +
      '<div class="insights-sparkline__legend">' +
      '<span><span class="insights-sparkline__legend-dot" style="background:#b91c1c"></span>' + esc(t("INSIGHTS_MAX", "Max")) + '</span>' +
      '<span><span class="insights-sparkline__legend-dot" style="background:#1d4ed8"></span>' + esc(t("INSIGHTS_AVG", "Average")) + '</span>' +
      '<span><span class="insights-sparkline__legend-dot" style="background:#15803d"></span>' + esc(t("INSIGHTS_MIN", "Min")) + '</span>' +
      '</div></div></div>';
  }

  function renderMomentumTrendLine(series) {
    // Full history - the database has it, and a line chart handles many
    // points fine (unlike the discrete bars this app uses elsewhere).
    const points = series.map((r) => ({ month: r.month, value: r.renewableShare }));
    return renderTrendLine(points, "INSIGHTS_MOMENTUM_TREND_TITLE", "Renewable share trend", (v) => formatPercent(v));
  }

  function renderTrendMomentumSection(data) {
    const trend = data.trend || {};
    const cards = [];

    [["threeYear", "INSIGHTS_TREND_3Y", "3-Year Trend"], ["fiveYear", "INSIGHTS_TREND_5Y", "5-Year Trend"], ["tenYear", "INSIGHTS_TREND_10Y", "10-Year Trend"]]
      .forEach(([key, labelKey, labelFallback]) => {
        const trendPoint = trend[key];
        if (!trendPoint) return;
        cards.push(card({
          label: t(labelKey, labelFallback),
          value: esc(formatSignedPp(trendPoint.deltaPp)),
          sub: esc(formatMonth(trendPoint.baseMonth)) + " → " + esc(formatMonth(trendPoint.latestMonth)),
        }));
      });

    if (trend.momentum) {
      cards.push(card({
        label: t("INSIGHTS_MOMENTUM_INDICATOR", "Momentum"),
        value: esc(formatSignedPp(trend.momentum.deltaPp)),
        sub: esc(t("INSIGHTS_MOMENTUM_SUB_3V12", "3-month avg vs 12-month avg")),
      }));
    }

    if (trend.structuralChange) {
      cards.push(card({
        label: t("INSIGHTS_STRUCTURAL_CHANGE", "Structural Change"),
        value: esc(formatSignedPp(trend.structuralChange.deltaPp)),
        sub: esc(t("INSIGHTS_STRUCTURAL_CHANGE_SUB", "12-month avg vs 5-year avg")),
      }));
    }

    if (trend.volatility) {
      cards.push(card({
        label: t("INSIGHTS_VOLATILITY", "Volatility"),
        value: esc(formatNumber(trend.volatility.volatility, 1)) + " pp",
        sub: esc(t("INSIGHTS_VOLATILITY_SUB", "Month-to-month stability (last 24 months)")),
      }));
    }

    if (trend.recovery2019) {
      cards.push(card({
        label: t("INSIGHTS_RECOVERY_TRACKER", "Recovery vs 2019"),
        value: esc(formatSignedPp(trend.recovery2019.deltaPp)),
        sub: esc(formatMonth(trend.recovery2019.baselineMonth)),
      }));
    }

    if (trend.displacement5Year) {
      cards.push(card({
        label: t("INSIGHTS_DISPLACEMENT", "Displacement (5y)"),
        value: esc(formatSignedPp(trend.displacement5Year.renewableDeltaPp)) + " / " + esc(formatSignedPp(trend.displacement5Year.fossilDeltaPp)),
        sub: esc(t("INSIGHTS_DISPLACEMENT_SUB", "Renewables gained vs fossils lost")),
      }));
    }

    let journeyHtml = "";
    const journey = trend.decarbonisationJourney;
    if (journey && journey.length > 1) {
      const items = journey.map((p) => {
        const label = p.isLatest ? esc(t("INSIGHTS_TODAY", "Today")) : esc(p.year);
        const deltaHtml = typeof p.deltaPp === "number"
          ? ' <span class="' + (p.deltaPp >= 0 ? "insight-rank-up" : "insight-rank-down") + '">(' + esc(formatSignedPp(p.deltaPp)) + ')</span>'
          : "";
        return '<span class="insight-rank-item">' + label + ': <strong>' + esc(formatPercent(p.value)) + '</strong>' + deltaHtml + '</span>';
      }).join(" → ");
      journeyHtml = '<div class="insights-rank-movement">' +
        '<div class="insights-rank-movement__label">' + esc(t("INSIGHTS_DECARBONISATION_JOURNEY", "Decarbonisation Journey")) + '</div>' +
        '<div class="insights-rank-movement__items">' + items + '</div>' +
        '</div>';
    }

    const trendLineHtml = renderMomentumTrendLine(data.series);

    if (!cards.length && !journeyHtml && !trendLineHtml) return "";

    return section(
      t("INSIGHTS_TREND_MOMENTUM_TITLE", "Trend & Momentum"),
      trendLineHtml + '<div class="insights-cards">' + cards.join("") + '</div>' + journeyHtml,
      {
        whatItIs: t("INSIGHTS_TREND_MOMENTUM_WHAT_IT_IS", "How the renewable share is moving over multiple time horizons - not just this month."),
        calculation: t("INSIGHTS_TREND_MOMENTUM_CALCULATION", "5-year change, 3-month vs 12-month average, 12-month vs 5-year average, month-to-month volatility, and change since 2019."),
        purpose: t("INSIGHTS_TREND_MOMENTUM_PURPOSE", "Answers: is the transition accelerating, stalling, or reversing?"),
      }
    );
  }

  // ---- Section 8: Energy Security (composite traffic light) ---------------------------

  const SECURITY_LEVEL_COLOR = { green: "#15803d", yellow: "#ca8a04", red: "#b91c1c" };
  const SECURITY_LEVEL_LABEL_KEY = { green: "INSIGHTS_SECURITY_LOW", yellow: "INSIGHTS_SECURITY_MODERATE", red: "INSIGHTS_SECURITY_HIGH" };
  const SECURITY_LEVEL_LABEL_FALLBACK = { green: "Low risk", yellow: "Moderate risk", red: "High risk" };
  const SECURITY_FACTOR_LABEL_KEY = { gas: "INSIGHTS_KPI_GAS_DEPENDENCY", oil: "INSIGHTS_OIL_DEPENDENCY", electricity: "INSIGHTS_ELECTRICITY_IMPORT_SHARE" };
  const SECURITY_FACTOR_LABEL_FALLBACK = { gas: "Gas Import Dependency", oil: "Oil Import Dependency", electricity: "Electricity Import Share" };

  function renderEnergySecuritySection(data) {
    const security = data.energySecurity;
    if (!security) return "";

    const color = SECURITY_LEVEL_COLOR[security.level];
    const levelLabel = t(SECURITY_LEVEL_LABEL_KEY[security.level], SECURITY_LEVEL_LABEL_FALLBACK[security.level]);

    const badge = '<p class="insights-summary" style="border-left-color:' + color + ';display:flex;align-items:center;gap:0.6rem">' +
      '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + color + ';flex-shrink:0" aria-hidden="true"></span>' +
      '<strong>' + esc(levelLabel) + '</strong> &middot; ' + security.score + ' / ' + security.maxScore +
      '</p>';

    const factorCards = security.factors.map((f) => card({
      label: t(SECURITY_FACTOR_LABEL_KEY[f.key], SECURITY_FACTOR_LABEL_FALLBACK[f.key]),
      value: esc(formatPercent(f.value)),
    })).join("");

    return section(
      t("INSIGHTS_SECURITY_TITLE", "Energy Security"),
      badge + '<div class="insights-cards">' + factorCards + '</div>',
      {
        whatItIs: t("INSIGHTS_SECURITY_WHAT_IT_IS", "A combined read of import exposure across gas, oil and electricity."),
        calculation: t("INSIGHTS_SECURITY_CALCULATION", "Each factor scores 0-2 points (< 50% = 0, 50-80% = 1, ≥ 80% = 2); risk level is the share of the maximum possible score."),
        purpose: t("INSIGHTS_SECURITY_PURPOSE", "A single at-a-glance signal for how exposed the country is to external energy supply."),
      }
    );
  }

  // ---- Section 9: Gas Market (consumption + storage) -----------------------------------

  function renderGasMarketSection(data) {
    const gm = data.gasMarket;
    if (!gm || (!gm.consumption && !gm.storage)) return "";

    const cards = [];
    if (gm.consumption) {
      const c = gm.consumption;
      cards.push(card({
        label: t("INSIGHTS_GAS_CONSUMPTION", "Gas Consumption"),
        value: esc(formatNumber(c.latest.consumption, 0)) + " TJ",
        sub: esc(formatMonth(c.latest.month)),
      }));
      if (c.deltaMoMPct !== null) {
        cards.push(card({
          label: t("INSIGHTS_VS_PREV_MONTH", "vs previous month"),
          value: esc(formatSignedPercent(c.deltaMoMPct)),
        }));
      }
      if (c.deltaYoYPct !== null) {
        cards.push(card({
          label: t("INSIGHTS_YOY_CHANGE", "vs same month last year"),
          value: esc(formatSignedPercent(c.deltaYoYPct)),
        }));
      }
      if (c.deltaVsAvgPct !== null) {
        cards.push(card({
          label: t("INSIGHTS_VS_HISTORICAL_AVG", "vs historical average"),
          value: esc(formatSignedPercent(c.deltaVsAvgPct)),
          sub: esc(t("INSIGHTS_SAMPLE_YEARS", "{n}-year average").replace("{n}", c.sampleYears)),
        }));
      }
    }

    if (gm.storage) {
      cards.push(card({
        label: t("INSIGHTS_STORAGE_CONTRIBUTION", "Storage Contribution"),
        value: esc(formatSigned(gm.storage.stockChange, 0)) + " TJ",
        sub: esc(formatMonth(gm.storage.month)),
        note: gm.storage.isDrawdown ? t("INSIGHTS_STORAGE_DRAWDOWN", "Drawing from storage") : t("INSIGHTS_STORAGE_INJECTION", "Injecting into storage"),
        modifier: gm.storage.isDrawdown ? "negative" : "positive",
      }));
    }

    const trendPoints = (gm.series || [])
      .filter((r) => r.consumption !== null)
      .map((r) => ({ month: r.month, value: r.consumption }));
    const trendHtml = renderTrendLine(trendPoints, "INSIGHTS_GAS_CONSUMPTION_TREND_TITLE", "Gas consumption trend", (v) => formatNumber(v, 0) + " TJ");

    return section(
      t("INSIGHTS_GAS_MARKET_TITLE", "Gas Market"),
      trendHtml + '<div class="insights-cards">' + cards.join("") + '</div>',
      {
        whatItIs: t("INSIGHTS_GAS_MARKET_WHAT_IT_IS", "How much gas the country used this month, and how storage is supporting supply."),
        calculation: t("INSIGHTS_GAS_MARKET_CALCULATION", "Inland gas consumption compared to the previous month, the same month last year, and the same calendar month's historical average; storage contribution is the month-on-month stock change."),
        purpose: t("INSIGHTS_GAS_MARKET_PURPOSE", "Tracks demand pressure and the role storage plays in balancing supply."),
      }
    );
  }

  // ---- Section 10: Oil Market (production/trade, crude price/volume, stocks) ----------

  function renderOilMarketSection(data) {
    const om = data.oilMarket;
    if (!om || !om.latest) return "";

    const cards = [];
    if (om.latest) {
      cards.push(card({
        label: t("INSIGHTS_OIL_PRODUCTION", "Oil Production"),
        value: esc(formatNumber(om.latest.production, 0)) + " kt",
        sub: esc(formatMonth(om.latest.month)),
      }));
      cards.push(card({
        label: t("INSIGHTS_IMPORTS", "Imports"),
        value: esc(formatNumber(om.latest.imports, 0)) + " kt",
      }));
      cards.push(card({
        label: t("INSIGHTS_EXPORTS", "Exports"),
        value: esc(formatNumber(om.latest.exports, 0)) + " kt",
      }));
    }
    if (om.dependency !== null) {
      cards.push(card({
        label: t("INSIGHTS_OIL_DEPENDENCY", "Oil Import Dependency"),
        value: esc(formatPercent(om.dependency)),
      }));
    }
    if (om.crude) {
      if (om.crude.price !== null) {
        cards.push(card({
          label: t("INSIGHTS_CRUDE_OIL_PRICE", "Crude Oil Price"),
          value: esc(formatNumber(om.crude.price, 1)) + " USD/bbl",
          sub: esc(formatMonth(om.crude.month)),
        }));
      }
      if (om.crude.volume !== null) {
        cards.push(card({
          label: t("INSIGHTS_CRUDE_OIL_VOLUME", "Crude Oil Import Volume"),
          value: esc(formatNumber(om.crude.volume, 0)) + " kbbl",
          sub: esc(formatMonth(om.crude.month)),
        }));
      }
    }
    if (om.stocks) {
      cards.push(card({
        label: t("INSIGHTS_STOCK_LEVEL_EUE", "Oil Stocks (EU-defined)"),
        value: esc(formatNumber(om.stocks.stockEue, 0)) + " kt",
        sub: esc(formatMonth(om.stocks.month)),
      }));
      cards.push(card({
        label: t("INSIGHTS_STOCK_LEVEL_NAT", "Oil Stocks (nationally-defined)"),
        value: esc(formatNumber(om.stocks.stockNat, 0)) + " kt",
        sub: esc(formatMonth(om.stocks.month)),
      }));
    }

    let alertHtml = "";
    if (om.stockAlert && om.stockAlert.isMajorMove) {
      const up = om.stockAlert.deltaPct >= 0;
      const key = up ? "INSIGHTS_STOCK_ALERT_BUILD" : "INSIGHTS_STOCK_ALERT_DRAWDOWN";
      const fallback = up ? "Stock alert: a major build-up of {delta} was recorded in {month}." : "Stock alert: a major drawdown of {delta} was recorded in {month}.";
      alertHtml = '<p class="insights-summary">' + formatTemplate(t(key, fallback), {
        delta: esc(formatPercent(Math.abs(om.stockAlert.deltaPct))),
        month: esc(formatMonth(om.stockAlert.month)),
      }) + '</p>';
    }

    const trendPoints = (om.crudeSeries || [])
      .filter((r) => r.price !== null)
      .map((r) => ({ month: r.month, value: r.price }));
    const trendHtml = renderTrendLine(trendPoints, "INSIGHTS_CRUDE_OIL_PRICE_TREND_TITLE", "Crude oil price trend", (v) => formatNumber(v, 1) + " USD/bbl");

    return section(
      t("INSIGHTS_OIL_MARKET_TITLE", "Oil Market"),
      trendHtml + '<div class="insights-cards">' + cards.join("") + '</div>' + alertHtml,
      {
        whatItIs: t("INSIGHTS_OIL_MARKET_WHAT_IT_IS", "Petroleum production, trade, crude oil prices and strategic stock levels this month."),
        calculation: t("INSIGHTS_OIL_MARKET_CALCULATION", "Oil dependency = Imports / (Production + Imports) × 100; stock alert flags a month-on-month stock change of 10% or more."),
        purpose: t("INSIGHTS_OIL_MARKET_PURPOSE", "Tracks petroleum market pressure and reserve adequacy."),
      }
    );
  }

  // ---- Section 11: Electricity Trade (imports vs exports) -----------------------------

  function renderElectricityTradeSection(data) {
    const trade = data.kpi && data.kpi.tradeBalance;
    if (!trade) return "";

    const maxVal = Math.max(trade.imp, trade.exp) || 1;
    const pctImp = Math.max(5, (trade.imp / maxVal) * 100);
    const pctExp = Math.max(5, (trade.exp / maxVal) * 100);

    const body = '<div class="insights-comparison-barchart">' +
      '<div class="insights-comparison-barchart__row">' +
      '<span class="insights-comparison-barchart__label">' + esc(t("INSIGHTS_IMPORTS", "Imports")) + '</span>' +
      '<div class="insights-comparison-barchart__track"><div class="insights-comparison-barchart__fill" style="width:' + pctImp.toFixed(1) + '%;background:#0284c7"></div></div>' +
      '<span class="insights-comparison-barchart__value">' + esc(formatNumber(trade.imp, 0)) + ' GWh</span>' +
      '</div>' +
      '<div class="insights-comparison-barchart__row">' +
      '<span class="insights-comparison-barchart__label">' + esc(t("INSIGHTS_EXPORTS", "Exports")) + '</span>' +
      '<div class="insights-comparison-barchart__track"><div class="insights-comparison-barchart__fill" style="width:' + pctExp.toFixed(1) + '%;background:var(--nav-color)"></div></div>' +
      '<span class="insights-comparison-barchart__value">' + esc(formatNumber(trade.exp, 0)) + ' GWh</span>' +
      '</div>' +
      '</div>' +
      '<p class="insights-summary">' + esc(formatMonth(trade.month)) + ': ' +
      esc(trade.balance >= 0 ? t("INSIGHTS_NET_EXPORTER", "Net exporter") : t("INSIGHTS_NET_IMPORTER", "Net importer")) +
      ' (' + esc((trade.balance >= 0 ? "+" : "") + formatNumber(trade.balance, 0)) + ' GWh)</p>';

    const stats = data.kpi && data.kpi.tradeStats;
    let statsHtml = "";
    if (stats) {
      const statCards = [
        card({
          label: t("INSIGHTS_TRADE_HIGH", "Highest Balance on Record"),
          value: esc((stats.max.value >= 0 ? "+" : "") + formatNumber(stats.max.value, 0)) + " GWh",
          sub: esc(formatMonth(stats.max.month)),
          modifier: "positive",
        }),
        card({
          label: t("INSIGHTS_TRADE_LOW", "Lowest Balance on Record"),
          value: esc((stats.min.value >= 0 ? "+" : "") + formatNumber(stats.min.value, 0)) + " GWh",
          sub: esc(formatMonth(stats.min.month)),
          modifier: "negative",
        }),
        card({
          label: t("INSIGHTS_TRADE_AVG", "Average Balance"),
          value: esc((stats.avg >= 0 ? "+" : "") + formatNumber(stats.avg, 0)) + " GWh",
          sub: t("INSIGHTS_TRADE_AVG_SUB", "Across the full recorded history"),
        }),
      ];
      statsHtml = '<div class="insights-cards">' + statCards.join("") + '</div>';
    }

    return section(
      t("INSIGHTS_TRADE_TITLE", "Electricity Trade"),
      body + statsHtml,
      {
        whatItIs: t("INSIGHTS_TRADE_WHAT_IT_IS", "How much electricity the country imported and exported this month."),
        calculation: "Trade balance = Exports − Imports",
        purpose: t("INSIGHTS_TRADE_PURPOSE", "Shows whether the country relies on imported electricity or exports its surplus."),
      }
    );
  }

  // ---- Section 13: EU Comparison --------------------------------------------------------

  function renderEuComparisonSection(data) {
    const eu = data.euComparison;
    if (!eu) return "";

    const cards = [
      card({
        label: t("INSIGHTS_KPI_RENEWABLE_SHARE", "Renewable Share"),
        value: esc(formatSignedPp(eu.gapPp)),
        sub: esc(t("INSIGHTS_VS_EU_AVERAGE", "vs EU27 average")) + ' (' + esc(formatPercent(eu.euRenewableShare)) + ')',
        modifier: eu.gapPp >= 0 ? "positive" : "negative",
      }),
      card({
        label: t("INSIGHTS_KPI_FOSSIL_SHARE", "Fossil Share"),
        value: esc(formatSignedPp(eu.fossilGapPp)),
        sub: esc(t("INSIGHTS_VS_EU_AVERAGE", "vs EU27 average")) + ' (' + esc(formatPercent(eu.euFossilShare)) + ')',
        modifier: eu.fossilGapPp <= 0 ? "positive" : "negative",
      }),
    ];

    // "Who's decarbonising fastest" - the country's own 5-year pace vs the
    // EU27 aggregate's own 5-year pace over the same window.
    let paceHtml = "";
    if (eu.paceComparison) {
      const pc = eu.paceComparison;
      const key = pc.fasterThanEu ? "INSIGHTS_PACE_FASTER" : "INSIGHTS_PACE_SLOWER";
      const fallback = pc.fasterThanEu
        ? "Transitioning faster than the EU27 average over the last {years} years."
        : "Transitioning slower than the EU27 average over the last {years} years.";
      paceHtml = '<p class="insights-summary">' + formatTemplate(t(key, fallback), { years: pc.years }) + '</p>' +
        '<div class="insights-cards">' +
        card({
          label: t("INSIGHTS_PACE_FOCUS", "5-Year Pace (this country)"),
          value: esc(formatSignedPp(pc.focusDeltaPp)),
        }) +
        card({
          label: t("INSIGHTS_PACE_EU", "5-Year Pace (EU27 average)"),
          value: esc(formatSignedPp(pc.euDeltaPp)),
        }) +
        '</div>';
    }

    return section(
      t("INSIGHTS_EU_COMPARISON_TITLE", "EU Comparison"),
      '<div class="insights-cards">' + cards.join("") + '</div>' + paceHtml,
      {
        whatItIs: t("INSIGHTS_EU_COMPARISON_WHAT_IT_IS", "How this country's electricity mix compares with the EU27 average."),
        calculation: t("INSIGHTS_EU_COMPARISON_CALCULATION", "Country value minus EU27_2020 aggregate value, for the same reference month where available; pace compares each side's own 5-year change."),
        purpose: t("INSIGHTS_EU_COMPARISON_PURPOSE", "Puts the national picture in a European context."),
      }
    );
  }

  // ---- Section 29: Market Pressure Indicator -------------------------------------------

  const MARKET_PRESSURE_FACTOR_LABEL_KEY = { oilPrice: "INSIGHTS_CRUDE_OIL_PRICE", gasImports: "INSIGHTS_GAS_IMPORTS", electricityImports: "INSIGHTS_ELECTRICITY_IMPORTS", oilImportVolume: "INSIGHTS_CRUDE_OIL_VOLUME" };
  const MARKET_PRESSURE_FACTOR_LABEL_FALLBACK = { oilPrice: "Crude Oil Price", gasImports: "Gas Imports", electricityImports: "Electricity Imports", oilImportVolume: "Crude Oil Import Volume" };
  const MARKET_PRESSURE_LEVEL_KEY = { rising: "INSIGHTS_PRESSURE_RISING", easing: "INSIGHTS_PRESSURE_EASING", mixed: "INSIGHTS_PRESSURE_MIXED" };
  const MARKET_PRESSURE_LEVEL_FALLBACK = { rising: "Rising pressure", easing: "Easing pressure", mixed: "Mixed signals" };
  const MARKET_PRESSURE_LEVEL_COLOR = { rising: "#b91c1c", easing: "#15803d", mixed: "#ca8a04" };

  function renderMarketPressureSection(data) {
    const mp = data.marketPressure;
    if (!mp) return "";

    const color = MARKET_PRESSURE_LEVEL_COLOR[mp.level];
    const levelLabel = t(MARKET_PRESSURE_LEVEL_KEY[mp.level], MARKET_PRESSURE_LEVEL_FALLBACK[mp.level]);

    const badge = '<p class="insights-summary" style="border-left-color:' + color + ';display:flex;align-items:center;gap:0.6rem">' +
      '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + color + ';flex-shrink:0" aria-hidden="true"></span>' +
      '<strong>' + esc(levelLabel) + '</strong></p>';

    const cards = mp.factors.map((f) => card({
      label: t(MARKET_PRESSURE_FACTOR_LABEL_KEY[f.key], MARKET_PRESSURE_FACTOR_LABEL_FALLBACK[f.key]),
      value: esc(formatSignedPercent(f.delta)),
      sub: esc(t("INSIGHTS_VS_PREV_MONTH", "vs previous month")),
      modifier: f.delta > 2 ? "negative" : f.delta < -2 ? "positive" : null,
    })).join("");

    return section(
      t("INSIGHTS_MARKET_PRESSURE_TITLE", "Market Pressure"),
      badge + '<div class="insights-cards">' + cards + '</div>',
      {
        whatItIs: t("INSIGHTS_MARKET_PRESSURE_WHAT_IT_IS", "Whether energy costs and import volumes are rising or easing right now."),
        calculation: t("INSIGHTS_MARKET_PRESSURE_CALCULATION", "Month-on-month % change in crude oil price, gas imports, electricity imports and crude oil import volume; a majority moving the same way (beyond ±2%) sets the overall signal."),
        purpose: t("INSIGHTS_MARKET_PRESSURE_PURPOSE", "An early warning for tightening or loosening energy markets."),
      }
    );
  }

  // ---- Section 33/44: Direction of Travel (a trend read, explicitly not a forecast) ---

  const DIRECTION_KEY = { up: "INSIGHTS_DIRECTION_UP", down: "INSIGHTS_DIRECTION_DOWN", flat: "INSIGHTS_DIRECTION_FLAT" };
  const DIRECTION_FALLBACK = { up: "Renewables trending up", down: "Renewables trending down", flat: "Broadly flat" };

  function renderDirectionOfTravelSection(data) {
    const dot = data.directionOfTravel;
    if (!dot) return "";

    const label = t(DIRECTION_KEY[dot.direction], DIRECTION_FALLBACK[dot.direction]);
    const summary = '<p class="insights-summary"><strong>' + esc(label) + '</strong> — ' + formatTemplate(
      t("INSIGHTS_DIRECTION_TEXT", "based on the pace of the last {years} years ({pace} per year). This is a simple trend read, not a forecast."),
      { years: dot.years, pace: esc(formatSignedPp(dot.annualizedPp)) }
    ) + '</p>';

    return section(
      t("INSIGHTS_DIRECTION_TITLE", "Direction of Travel"),
      summary,
      {
        whatItIs: t("INSIGHTS_DIRECTION_WHAT_IT_IS", "A simple read of where the renewable share has been heading recently."),
        calculation: t("INSIGHTS_DIRECTION_CALCULATION", "Change over the last 3 years, divided by 3 to get an annualised pace."),
        purpose: t("INSIGHTS_DIRECTION_PURPOSE", "Answers \"where are we heading?\" without pretending to forecast the future."),
      }
    );
  }

  // ---- Flow item #15: Final Key Takeaways ----------------------------------------------
  // A closing narrative synthesised entirely from data other sections already
  // computed (no new data-layer function needed) - answers insights.md's own
  // four framing questions: where were we / are we / heading / why it matters.

  function renderKeyTakeawaysSection(data) {
    const { latest, trend, energySecurity, geo } = data;
    const geoLabel = countryLabel(geo);
    const items = [];

    if (trend.fiveYear) {
      items.push({
        labelKey: "INSIGHTS_TAKEAWAY_WHERE_WERE_WE", labelFallback: "Where were we?",
        text: formatTemplate(t("INSIGHTS_TAKEAWAY_WERE_TEXT", "{years} years ago, renewable share stood at {value} ({month})."), {
          years: trend.fiveYear.years, value: esc(formatPercent(trend.fiveYear.baseValue)), month: esc(formatMonth(trend.fiveYear.baseMonth)),
        }),
      });
    }

    items.push({
      labelKey: "INSIGHTS_TAKEAWAY_WHERE_NOW", labelFallback: "Where are we now?",
      text: formatTemplate(t("INSIGHTS_TAKEAWAY_NOW_TEXT", "Renewable share is {value} as of {month}."), {
        value: esc(formatPercent(latest.renewableShare)), month: esc(formatMonth(latest.month)),
      }),
    });

    if (data.directionOfTravel) {
      const dLabel = t(DIRECTION_KEY[data.directionOfTravel.direction], DIRECTION_FALLBACK[data.directionOfTravel.direction]);
      items.push({
        labelKey: "INSIGHTS_TAKEAWAY_WHERE_HEADING", labelFallback: "Where are we heading?",
        text: esc(dLabel) + " (" + esc(formatSignedPp(data.directionOfTravel.annualizedPp)) + "/" + esc(t("INSIGHTS_YEAR_ABBR", "year")) + ").",
      });
    }

    if (energySecurity) {
      const secLabel = t(SECURITY_LEVEL_LABEL_KEY[energySecurity.level], SECURITY_LEVEL_LABEL_FALLBACK[energySecurity.level]);
      items.push({
        labelKey: "INSIGHTS_TAKEAWAY_WHY_MATTERS", labelFallback: "Why does it matter?",
        text: formatTemplate(t("INSIGHTS_TAKEAWAY_MATTERS_TEXT", "Energy security: {level}. The pace of transition directly shapes {country}'s exposure to imported fuel."), {
          level: esc(secLabel), country: esc(geoLabel),
        }),
      });
    }

    if (!items.length) return "";

    const html = items.map((item) => (
      '<p class="insights-summary"><strong>' + esc(t(item.labelKey, item.labelFallback)) + '</strong> ' + item.text + '</p>'
    )).join("");

    return section(
      t("INSIGHTS_TAKEAWAYS_TITLE", "Key Takeaways"),
      html,
      {
        whatItIs: t("INSIGHTS_TAKEAWAYS_WHAT_IT_IS", "A short narrative wrap-up of everything above."),
        purpose: t("INSIGHTS_TAKEAWAYS_PURPOSE", "Answers the four framing questions from the top of this page in one place."),
      }
    );
  }

  function renderMeta(data) {
    const geoLabel = countryLabel(data.geo);
    const monthLabel = formatMonth(data.latest.month);

    function item(label, value) {
      return '<div class="insights-meta__item"><span class="insights-meta__label">' + esc(label) + '</span>' +
        '<span class="insights-meta__value">' + esc(value) + '</span></div>';
    }

    return '<div class="insights-meta">' +
      item(t("INSIGHTS_META_COUNTRY", "Country"), geoLabel) +
      item(t("INSIGHTS_META_MONTH", "Reference month"), monthLabel) +
      item(t("INSIGHTS_META_UNIT", "Unit"), "GWh") +
      '</div>';
  }

  // ---- shell states (loading / error / empty) ---------------------------------------

  function shell(bodyHtml) {
    return '<div id="insightsView">' +
      '<div id="insightsViewBody">' +
      '<h2 class="insights-title">' + esc(t("INSIGHTS_TITLE", "Insights")) + '</h2>' +
      '<div class="insights-panel" tabindex="-1">' + bodyHtml + '</div>' +
      '</div></div>';
  }

  function renderLoading() {
    $("#insightsContent").html(shell(
      '<p class="insights-no-prev"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ' +
      esc(t("INSIGHTS_LOADING", "Loading insights…")) + '</p>'
    ));
  }

  function renderError() {
    $("#insightsContent").html(shell(
      '<p class="insights-no-prev"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> ' +
      esc(t("INSIGHTS_ERROR", "We couldn't load insights right now.")) + '</p>'
    ));
  }

  function renderEmpty() {
    $("#insightsContent").html(shell(
      '<p class="insights-no-prev">' + esc(t("INSIGHTS_NO_DATA", "No data available to build insights for this selection.")) + '</p>'
    ));
  }

  // ---- top-level render ---------------------------------------------------------------

  function render(data) {
    cachedData = data;

    if (!data || !data.hasData) {
      renderEmpty();
      return;
    }

    const geoLabel = countryLabel(data.geo);
    const monthLabel = formatMonth(data.latest.month);

    const titleLine = esc(t("INSIGHTS_TITLE", "Insights")) +
      ' <span class="insights-year-label">' + esc(geoLabel) + ' — ' + esc(monthLabel) + '</span>';

    const body = renderMeta(data) +
      renderHeadline(data) +
      '<div class="insights-sections">' +
      renderKpiSection(data) +
      renderFindingsSection(data) +
      renderEnergyTransitionSection(data) +
      renderElectricityMixSection(data) +
      renderHistoricalEvolutionSection(data) +
      renderTrendMomentumSection(data) +
      renderEnergySecuritySection(data) +
      renderGasMarketSection(data) +
      renderOilMarketSection(data) +
      renderMarketPressureSection(data) +
      renderElectricityTradeSection(data) +
      renderEuComparisonSection(data) +
      renderDirectionOfTravelSection(data) +
      renderKeyTakeawaysSection(data) +
      '</div>';

    // Dispose of the previous render's tooltip elements/listeners before
    // their buttons are torn down (mirrors createComponents.js's
    // removeComponents(), which does the same before rebuilding the nav).
    if (typeof cleanupTooltips === "function") {
      try { cleanupTooltips(); } catch (e) {}
    }

    const scrollTopLabel = t("INSIGHTS_SCROLL_TOP", "Back to top");
    const scrollTopBtn = '<button type="button" class="insights-scroll-top-btn" onclick="insightsRenderNameSpace.scrollToTop()" title="' + esc(scrollTopLabel) + '">' +
      '<i class="fas fa-arrow-up" aria-hidden="true"></i><span class="ecl-u-sr-only">' + esc(scrollTopLabel) + '</span>' +
      '</button>';

    $("#insightsContent").html(
      '<div id="insightsView"><div id="insightsViewBody">' +
      '<h2 class="insights-title">' + titleLine + '</h2>' +
      '<div class="insights-panel" tabindex="-1">' + body + '</div>' +
      '</div>' + scrollTopBtn + '</div>'
    );

    if (typeof ECL !== "undefined" && typeof ECL.autoInit === "function") {
      try { ECL.autoInit(); } catch (e) { console.warn("[insights] ECL autoInit warning", e); }
    }
    if (typeof enableTooltips === "function") {
      try { enableTooltips(); } catch (e) {}
    }
  }

  function load() {
    const requestId = ++currentRequestId;
    renderLoading();

    insightsDataNameSpace.computeMonthlyInsights({ geo: insightsDataNameSpace.getGeo() })
      .then((data) => {
        if (requestId !== currentRequestId) return;
        render(data);
      })
      .catch((err) => {
        if (requestId !== currentRequestId) return;
        console.error("[insights] failed to compute insights", err);
        renderError();
      });
  }

  return { load, render, togglePopover, closePopover, highlightSource, unhighlightSource, scrollToTop, onFuelExplorerChange };
})();

function loadInsights() {
  insightsRenderNameSpace.load();
}
