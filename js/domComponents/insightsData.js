/*
 * Insights calculation engine for the ENMONTHLY "Insights" view.
 * Reads the app's existing REF selection + codes.js tables, fetches whatever
 * Eurostat data each section needs, and returns a structured result for
 * insightsPage.js to render. Mirrors the architecture of ENPRICES's own
 * insightsData.js (async fetch + localStorage cache, IIFE namespace).
 *
 * Built against insights.md, structured around its own "RECOMMENDED
 * INFOGRAPHIC FLOW" (bottom of that file) rather than as 47 separate
 * micro-sections - most of the numbered items there are facets of the same
 * handful of UI sections. Implemented so far:
 *   1. Headline of the Month
 *   2. KPI Scorecard                 (md #2)
 *   3. Key Findings                  (md #3)
 *   4. Energy Transition             (md #4, #27)
 *   5. Electricity Mix               (md #5, #19, #20, #21)
 *   6. Historical Evolution          (md #24, #36, #37)
 *   7. Trend & Momentum              (md #6, #31, #32, #34, #38, #39, #43, #45, #46, #47)
 *  11. Electricity Trade             (md #8)
 *  13. EU Comparison                 (md #25, #26)
 *   8. Energy Security                (md #28, composite of gas/oil/electricity dependency)
 *   9. Gas Market                     (md #11 consumption, #12 storage)
 *  10. Oil Market                     (md #13-15 production/imports/exports/crude
 *                                       price/volume, #16 solid fossil fuels,
 *                                       #17-18 security of supply / stock alerts)
 *  14. Market Pressure                (md #29, momentum across oil price/gas
 *                                       imports/electricity imports/oil volume)
 *  14. Direction of Travel            (md #33, #44 - explicitly not a forecast)
 *  15. Final Key Takeaways            (synthesised in the render layer from
 *                                       data already computed here)
 * Key Findings (#3) also folds in cross-domain facts once energy security and
 * oil market data are ready (md #30 "Automatic Insight Feed"), rather than a
 * separate feed section duplicating the same idea.
 * All 15 items of insights.md's "RECOMMENDED INFOGRAPHIC FLOW" are now covered.
 *
 * Dataset code note: codesDataset (codes.js) is a UI-facing convenience
 * table, not always a literal mirror of the live API - cross-checked each
 * dataset against the real Eurostat API before using it here. Corrections
 * found: nrg_cb_gasm/nrg_cb_sffm have no "Net_imp" code (derived as
 * IMP-EXP); nrg_stk_oilm's dimension is actually named "stk_flow" (not
 * "nrg_bal") with different codes than listed, and its real unit is THS_T,
 * not GWH; nrg_cb_cosm has no "unit" dimension at all - those "unit" values
 * are actually "indic_nrg" codes, and the dataset mixes monthly/annual data
 * so freq=M must be pinned explicitly.
 */
var insightsDataNameSpace = (function () {

  const CACHE_PREFIX = "enmonthly_insights_cache::";
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1h - avoids refetching on every open within a session

  // ---------------------------------------------------------------------
  // Cache (localStorage) + fetch
  // ---------------------------------------------------------------------

  function readCache(key) {
    try {
      const raw = window.localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || (Date.now() - entry.t) > CACHE_TTL_MS) return null;
      return entry.d;
    } catch (e) {
      return null;
    }
  }

  function writeCache(key, data) {
    try {
      window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) {
      // Storage full/unavailable (private browsing, quota): degrade to no cache.
    }
  }

  async function fetchDataset(url) {
    const cached = readCache(url);
    if (cached) return JSONstat(cached).Dataset(0);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Insights request failed: " + response.status);
    }
    const raw = await response.json();
    if (raw && raw.error) {
      throw new Error("Insights request returned an error payload");
    }
    writeCache(url, raw);
    return JSONstat(raw).Dataset(0);
  }

  // ---------------------------------------------------------------------
  // Generic helpers
  // ---------------------------------------------------------------------

  function isValid(v) {
    return v !== null && v !== undefined && !isNaN(v);
  }

  function percentChange(a, b) {
    if (!isValid(a) || !isValid(b) || a === 0) return null;
    return ((b - a) / Math.abs(a)) * 100;
  }

  function absoluteChange(a, b) {
    if (!isValid(a) || !isValid(b)) return null;
    return b - a;
  }

  function getGeo() {
    const geo = REF.geos;
    if (Array.isArray(geo)) return geo[0] || "EU27_2020";
    if (typeof geo === "string" && geo.indexOf(",") !== -1) return geo.split(",")[0];
    return geo || "EU27_2020";
  }

  function baseUrl(dataset) {
    return "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/" + dataset +
      "?format=JSON&lang=" + (REF.language || "EN");
  }

  // ---------------------------------------------------------------------
  // Electricity mix (nrg_cb_pem) - shared foundation most other sections
  // will build on. No nrg_bal dimension on this dataset - only siec/geo/time/unit.
  // ---------------------------------------------------------------------

  // TOTAL/CF/X9900 (matching the app's own #selectFuel dropdown) ride along
  // on the same fetch for the Fuel Explorer card - they're captured into
  // each row's bySiec below, but deliberately excluded from the data-quality
  // gate (see FUEL_EXPLORER_EXTRA_SIECS below), so they can't shrink the
  // "clean" history the renewable/fossil-share calculations rely on.
  const FUEL_EXPLORER_EXTRA_SIECS = ["TOTAL", "CF", "X9900"];

  function buildElectricityMixUrl(geo) {
    let url = baseUrl("nrg_cb_pem") + "&geo=" + geo + "&unit=GWH";
    Nrw.forEach((siec) => { url += "&siec=" + siec; });
    rw.forEach((siec) => { url += "&siec=" + siec; });
    FUEL_EXPLORER_EXTRA_SIECS.forEach((siec) => { url += "&siec=" + siec; });
    return url;
  }

  // One row per month with usable data:
  // { month, renewables, fossil, other, total, renewableShare, fossilShare, bySiec }
  // "fossil" excludes N9000 (nuclear, tracked separately as "other") to match
  // the Fossil Share formula in insights.md section 2; "other" + "fossil"
  // together make up "non-renewables" for the Energy Transition donut (section 4).
  function buildElectricityMixSeries(dataset) {
    if (!dataset || !dataset.value) return [];

    const time = dataset.Dimension("time").id;
    const siecs = dataset.Dimension("siec").id;
    const value = dataset.value;

    // Some months in the raw dataset report only a handful of fuel codes -
    // a temporary Eurostat publication gap, not a real drop to zero (e.g.
    // Germany's 2016-12 is missing coal/gas/oil entirely, making that month
    // look almost 100% renewable). A code counts as "expected" once it's
    // reported for the majority of months, which tells that apart from a
    // country that legitimately never reports a given fuel (no nuclear, no
    // geothermal, ...).
    const coverage = {};
    siecs.forEach((siec, sIdx) => {
      let count = 0;
      for (let tIdx = 0; tIdx < time.length; tIdx++) {
        if (typeof value[sIdx * time.length + tIdx] === "number") count++;
      }
      coverage[siec] = count;
    });
    // Scoped to the original 9 renewable/fossil codes only - TOTAL/CF/X9900
    // are along for the ride (see FUEL_EXPLORER_EXTRA_SIECS) and must not
    // tighten this gate.
    const expectedSiecs = siecs.filter((siec) => FUEL_EXPLORER_EXTRA_SIECS.indexOf(siec) === -1 && coverage[siec] > time.length * 0.5);

    const rows = [];

    time.forEach((month, tIdx) => {
      let renewables = 0, fossil = 0, other = 0;
      const bySiec = {};
      let reportedExpected = 0;

      siecs.forEach((siec, sIdx) => {
        const v = value[sIdx * time.length + tIdx];
        if (typeof v !== "number") return;
        bySiec[siec] = v;
        if (expectedSiecs.indexOf(siec) !== -1) reportedExpected++;
        if (rw.indexOf(siec) !== -1) renewables += v;
        else if (siec === "N9000") other += v;
        else if (Nrw.indexOf(siec) !== -1) fossil += v;
      });

      const total = renewables + fossil + other;
      // Mirrors the data-quality gate the main chart already uses for this
      // dataset (js/enmonthly.js chartData(): `if (sumNrw > 1)`), plus the
      // fuel-coverage check above.
      if (total <= 1 || reportedExpected < expectedSiecs.length) return;

      rows.push({
        month,
        renewables, fossil, other, total,
        renewableShare: (renewables / total) * 100,
        fossilShare: (fossil / total) * 100,
        bySiec,
      });
    });

    return rows;
  }

  function computeRecords(series) {
    let maxRow = series[0], minRow = series[0];
    series.forEach((row) => {
      if (row.renewableShare > maxRow.renewableShare) maxRow = row;
      if (row.renewableShare < minRow.renewableShare) minRow = row;
    });
    return { max: maxRow, min: minRow };
  }

  // ---------------------------------------------------------------------
  // Section 1: Headline of the Month
  //
  // Picks the single most newsworthy storyline out of the electricity-mix
  // series: a renewables/fossil crossover, a new all-time record, or
  // (fallback) the plain "renewables made up X% this month" statement.
  // Later sections (trade record, gas-dependency record, ...) can register
  // more candidates here once they're built.
  // ---------------------------------------------------------------------

  function buildHeadlineCandidates(mix) {
    const { latest, previousMonth, records } = mix;
    const candidates = [];

    if (latest.month === records.max.month) {
      candidates.push({ type: "record_high", priority: 3, value: latest.renewableShare, month: latest.month });
    }
    if (latest.month === records.min.month) {
      candidates.push({ type: "record_low", priority: 3, value: latest.renewableShare, month: latest.month });
    }

    if (previousMonth) {
      const crossedUp = previousMonth.renewableShare <= previousMonth.fossilShare && latest.renewableShare > latest.fossilShare;
      const crossedDown = previousMonth.renewableShare >= previousMonth.fossilShare && latest.renewableShare < latest.fossilShare;
      if (crossedUp) candidates.push({ type: "crossover_renewables_up", priority: 4, value: latest.renewableShare, month: latest.month });
      if (crossedDown) candidates.push({ type: "crossover_fossil_up", priority: 4, value: latest.fossilShare, month: latest.month });
    }

    candidates.push({ type: "default", priority: 0, value: latest.renewableShare, month: latest.month });

    candidates.sort((a, b) => b.priority - a.priority);
    return candidates;
  }

  function pickHeadline(mix) {
    return buildHeadlineCandidates(mix)[0];
  }

  // ---------------------------------------------------------------------
  // Section 2: KPI Scorecard
  //
  // Renewable Share and Fossil Share come straight from the electricity-mix
  // series already built for the headline. Electricity Trade Balance and Gas
  // Import Dependency need two more datasets, fetched concurrently below.
  // ---------------------------------------------------------------------

  // nrg_cb_em: electricity imports/exports. EXP - IMP = trade balance.
  function buildElectricityTradeUrl(geo) {
    return baseUrl("nrg_cb_em") + "&geo=" + geo + "&unit=GWH&siec=E7000&nrg_bal=IMP&nrg_bal=EXP";
  }

  function buildElectricityTradeSeries(dataset) {
    if (!dataset || !dataset.value) return [];
    const time = dataset.Dimension("time").id;
    const balances = dataset.Dimension("nrg_bal").id;
    const impIdx = balances.indexOf("IMP");
    const expIdx = balances.indexOf("EXP");
    if (impIdx === -1 || expIdx === -1) return [];

    const rows = [];
    time.forEach((month, tIdx) => {
      const imp = dataset.value[impIdx * time.length + tIdx];
      const exp = dataset.value[expIdx * time.length + tIdx];
      if (typeof imp !== "number" || typeof exp !== "number") return;
      rows.push({ month, imp, exp, balance: exp - imp });
    });
    return rows;
  }

  function getLatestTradeBalance(tradeSeries) {
    return (tradeSeries && tradeSeries.length) ? tradeSeries[tradeSeries.length - 1] : null;
  }

  // Lowest/highest/average trade balance across the full recorded history -
  // shown alongside this month's figure in the Electricity Trade section.
  function computeTradeBalanceStats(tradeSeries) {
    if (!tradeSeries || !tradeSeries.length) return null;
    const maxRow = tradeSeries.reduce((a, b) => (b.balance > a.balance ? b : a));
    const minRow = tradeSeries.reduce((a, b) => (b.balance < a.balance ? b : a));
    return {
      max: { value: maxRow.balance, month: maxRow.month },
      min: { value: minRow.balance, month: minRow.month },
      avg: average(tradeSeries.map((r) => r.balance)),
    };
  }

  // Latest row of the gas series (built by buildGasSeries, Section 9 below)
  // that has a usable dependency figure - shared by the KPI card and the
  // full Gas Market section so nrg_cb_gasm only needs fetching once.
  function getLatestGasDependency(gasSeries) {
    const valid = (gasSeries || []).filter((r) => r.dependency !== null);
    return valid.length ? valid[valid.length - 1] : null;
  }

  function buildKpiScorecard({ latest, previousMonth }, tradeSeries, gasSeries) {
    return {
      renewableShare: {
        value: latest.renewableShare,
        deltaMoM: previousMonth ? absoluteChange(previousMonth.renewableShare, latest.renewableShare) : null,
      },
      fossilShare: {
        value: latest.fossilShare,
        deltaMoM: previousMonth ? absoluteChange(previousMonth.fossilShare, latest.fossilShare) : null,
      },
      tradeBalance: getLatestTradeBalance(tradeSeries),
      tradeStats: computeTradeBalanceStats(tradeSeries),
      gasDependency: getLatestGasDependency(gasSeries),
    };
  }

  // ---------------------------------------------------------------------
  // Date / series helpers shared by everything below
  // ---------------------------------------------------------------------

  function findRowByMonth(series, month) {
    return series.find((r) => r.month === month) || null;
  }

  // "YYYY-MM" n months before monthCode.
  function monthsBefore(monthCode, n) {
    const parts = monthCode.split("-");
    const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    const total = y * 12 + (m - 1) - n;
    const ny = Math.floor(total / 12);
    const nm = (total % 12) + 1;
    return ny + "-" + String(nm).padStart(2, "0");
  }

  function sameMonthYearsAgo(monthCode, years) {
    const parts = monthCode.split("-");
    return (parseInt(parts[0], 10) - years) + "-" + parts[1];
  }

  function average(values) {
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // ---------------------------------------------------------------------
  // Section 3: Key Findings
  //
  // "Largest increase"/"largest decrease" here means the single biggest
  // month-on-month swing ever recorded (a "did you know" fact), distinct
  // from the KPI cards' this-month-vs-last-month deltas. "Largest EU
  // deviation" needs the EU comparator built below; "largest share change"
  // looks at which individual fuel moved the most between the last two months.
  // ---------------------------------------------------------------------

  function findLargestMoMSwing(series, direction) {
    let best = null;
    for (let i = 1; i < series.length; i++) {
      const delta = series[i].renewableShare - series[i - 1].renewableShare;
      const matchesDirection = direction === "up" ? delta > 0 : delta < 0;
      if (matchesDirection && (!best || Math.abs(delta) > Math.abs(best.delta))) {
        best = { month: series[i].month, previousMonth: series[i - 1].month, delta };
      }
    }
    return best;
  }

  function findLargestSiecShareChange(series) {
    if (series.length < 2) return null;
    const latest = series[series.length - 1];
    const previous = series[series.length - 2];
    let best = null;

    Object.keys(latest.bySiec).forEach((siec) => {
      if (FUEL_EXPLORER_EXTRA_SIECS.indexOf(siec) !== -1) return;
      if (previous.bySiec[siec] === undefined) return;
      const delta = latest.bySiec[siec] - previous.bySiec[siec];
      if (!best || Math.abs(delta) > Math.abs(best.delta)) {
        best = { siec, delta, latestValue: latest.bySiec[siec], previousValue: previous.bySiec[siec], month: latest.month };
      }
    });

    return best;
  }

  function buildKeyFindings(mix, euComparison) {
    const { series, latest, records } = mix;
    const findings = [];

    const biggestUp = findLargestMoMSwing(series, "up");
    if (biggestUp) findings.push(Object.assign({ type: "largest_increase" }, biggestUp));

    const biggestDown = findLargestMoMSwing(series, "down");
    if (biggestDown) findings.push(Object.assign({ type: "largest_decrease" }, biggestDown));

    if (latest.month === records.max.month) {
      findings.push({ type: "new_record_high", value: latest.renewableShare, month: latest.month });
    } else if (latest.month === records.min.month) {
      findings.push({ type: "new_record_low", value: latest.renewableShare, month: latest.month });
    }

    if (euComparison) {
      findings.push({ type: "eu_deviation", gapPp: euComparison.gapPp, month: latest.month });
    }

    const shareChange = findLargestSiecShareChange(series);
    if (shareChange) findings.push(Object.assign({ type: "largest_share_change" }, shareChange));

    return findings;
  }

  // ---------------------------------------------------------------------
  // Section 4/5: Energy Transition + Electricity Mix
  //
  // Ranks individual fuel sources by latest-month output, and finds the
  // fastest-growing / fastest-declining source year-on-year.
  // ---------------------------------------------------------------------

  // Only the 9 individual fuel codes - bySiec also carries TOTAL/CF/X9900
  // (for the Fuel Explorer card), which are aggregates/residuals, not
  // sources, and would double-count if included in the mix breakdown.
  function rankSources(row) {
    if (!row || !row.bySiec) return [];
    return Object.keys(row.bySiec)
      .filter((siec) => FUEL_EXPLORER_EXTRA_SIECS.indexOf(siec) === -1)
      .map((siec) => ({ siec, value: row.bySiec[siec] }))
      .sort((a, b) => b.value - a.value);
  }

  function computeSourceGrowth(series) {
    const latest = series[series.length - 1];
    const yoyRow = findRowByMonth(series, sameMonthYearsAgo(latest.month, 1));
    if (!yoyRow) return { fastestGrowing: null, largestDecline: null, yoyMonth: null };

    const changes = Object.keys(latest.bySiec)
      .filter((siec) => FUEL_EXPLORER_EXTRA_SIECS.indexOf(siec) === -1)
      .map((siec) => {
        const current = latest.bySiec[siec];
        const previous = yoyRow.bySiec[siec];
        if (!isValid(previous) || previous === 0) return null;
        return { siec, current, previous, pctChange: ((current - previous) / Math.abs(previous)) * 100 };
      }).filter(Boolean);

    if (!changes.length) return { fastestGrowing: null, largestDecline: null, yoyMonth: yoyRow.month };

    const fastestGrowing = changes.reduce((a, b) => (b.pctChange > a.pctChange ? b : a));
    const largestDecline = changes.reduce((a, b) => (b.pctChange < a.pctChange ? b : a));
    return { fastestGrowing, largestDecline, yoyMonth: yoyRow.month };
  }

  // Renewable vs Non-Renewable (Fossil) vs Non-Renewable (Nuclear) - the
  // same 3-way split used by Eurostat's own headline "renewables vs
  // non-renewables" framing. Uses the *official* TOTAL siec code as the
  // denominator where available (more accurate than the app's own summed
  // total: some countries, e.g. Germany, don't disclose "RA500_5160 Other
  // renewables" in this dataset even though it's folded into the official
  // TOTAL, so the summed total can undercount by several percent).
  const FUEL_CATEGORY_CODES = {
    renewable: ["RA100", "RA200", "RA300", "RA400", "RA500_5160"],
    fossil: ["C0000", "G3000", "O4000XBIO"],
    nuclear: ["N9000"],
  };

  function officialOrComputedTotal(row) {
    return (row.bySiec && isValid(row.bySiec.TOTAL)) ? row.bySiec.TOTAL : row.total;
  }

  function computeRenewableVsNonRenewable(latest, euRow) {
    const officialTotal = officialOrComputedTotal(latest);

    const buildCategories = (row, total) => Object.keys(FUEL_CATEGORY_CODES).map((key) => {
      const value = key === "renewable" ? row.renewables : key === "fossil" ? row.fossil : row.other;
      return { key, codes: FUEL_CATEGORY_CODES[key], value, sharePct: total ? (value / total) * 100 : null };
    });

    return {
      officialTotal,
      computedTotal: latest.total,
      categories: buildCategories(latest, officialTotal),
      euCategories: euRow ? buildCategories(euRow, officialOrComputedTotal(euRow)) : null,
    };
  }

  // ---------------------------------------------------------------------
  // Section 6: Historical Evolution (records, first occurrence, ranking)
  // ---------------------------------------------------------------------

  function computeHistoricalPercentile(series, latest) {
    const values = series.map((r) => r.renewableShare);
    const below = values.filter((v) => v < latest.renewableShare).length;
    const equal = values.filter((v) => v === latest.renewableShare).length;
    return (100 * (below + 0.5 * equal)) / values.length;
  }

  // insights.md #24 "first occurrence": how far back the recorded history
  // actually goes, giving context for how much the other historical stats
  // are drawing on.
  function computeDataCoverage(series) {
    return {
      firstMonth: series[0].month,
      lastMonth: series[series.length - 1].month,
      monthCount: series.length,
      years: Math.round((series.length / 12) * 10) / 10,
    };
  }

  // insights.md #24 "longest streak": longest unbroken run of month-on-month
  // increases, and the longest unbroken run of decreases.
  function computeLongestStreaks(series) {
    let bestUp = { length: 0 }, bestDown = { length: 0 };
    let curUp = { length: 0, startIdx: null }, curDown = { length: 0, startIdx: null };

    for (let i = 1; i < series.length; i++) {
      const delta = series[i].renewableShare - series[i - 1].renewableShare;

      if (delta > 0) {
        curUp = { length: curUp.length + 1, startIdx: curUp.length === 0 ? i - 1 : curUp.startIdx };
        curDown = { length: 0, startIdx: null };
      } else if (delta < 0) {
        curDown = { length: curDown.length + 1, startIdx: curDown.length === 0 ? i - 1 : curDown.startIdx };
        curUp = { length: 0, startIdx: null };
      } else {
        curUp = { length: 0, startIdx: null };
        curDown = { length: 0, startIdx: null };
      }

      if (curUp.length > bestUp.length) bestUp = { length: curUp.length, startIdx: curUp.startIdx, endIdx: i };
      if (curDown.length > bestDown.length) bestDown = { length: curDown.length, startIdx: curDown.startIdx, endIdx: i };
    }

    const toResult = (streak) => (streak.length > 0 ? {
      months: streak.length,
      startMonth: series[streak.startIdx].month,
      endMonth: series[streak.endIdx].month,
    } : null);

    return { longestIncrease: toResult(bestUp), longestDecrease: toResult(bestDown) };
  }

  // Best/worst calendar year on record, by average renewable share - a
  // different lens than the single best/worst MONTH already in `records`.
  const YEARLY_EXTREME_MIN_MONTHS = 6; // skip partial years (e.g. the series' first/last calendar year)

  function computeYearlyExtremes(series) {
    const byYear = {};
    series.forEach((row) => {
      const year = row.month.slice(0, 4);
      (byYear[year] = byYear[year] || []).push(row.renewableShare);
    });

    const yearly = Object.keys(byYear)
      .filter((year) => byYear[year].length >= YEARLY_EXTREME_MIN_MONTHS)
      .map((year) => ({ year, avg: average(byYear[year]), monthCount: byYear[year].length }));

    if (!yearly.length) return null;

    return {
      best: yearly.reduce((a, b) => (b.avg > a.avg ? b : a)),
      worst: yearly.reduce((a, b) => (b.avg < a.avg ? b : a)),
      yearCount: yearly.length,
    };
  }

  // First month the renewable share crossed each round-number milestone -
  // only the thresholds actually reached are returned.
  function computeMilestoneCrossings(series, thresholds) {
    return thresholds
      .map((threshold) => {
        const row = series.find((r) => r.renewableShare >= threshold);
        return row ? { threshold, month: row.month } : null;
      })
      .filter(Boolean);
  }

  // insights.md #37 "Record Detection": not just today's record, but how
  // many all-time highs have been set across the whole series - a read on
  // how dynamic the transition has been, not just where it stands today.
  function computeRecordBreakCount(series) {
    let count = 0, runningMax = -Infinity;
    series.forEach((row) => {
      if (row.renewableShare > runningMax) {
        runningMax = row.renewableShare;
        count++;
      }
    });
    return count;
  }

  // ---------------------------------------------------------------------
  // Section 7: Trend & Momentum
  // ---------------------------------------------------------------------

  // Long-term trend / transition speed / five-year evolution (md #31/#34/#38)
  // - same calculation, different names in insights.md - implemented once.
  function computeTrendOverYears(series, latest, years) {
    const baseRow = findRowByMonth(series, sameMonthYearsAgo(latest.month, years));
    if (!baseRow) return null;
    return {
      years,
      baseMonth: baseRow.month, baseValue: baseRow.renewableShare,
      latestMonth: latest.month, latestValue: latest.renewableShare,
      deltaPp: latest.renewableShare - baseRow.renewableShare,
    };
  }

  // Momentum indicator (md #32): 3-month average vs 12-month average.
  function computeMomentumIndicator(series) {
    if (series.length < 12) return null;
    const avg3 = average(series.slice(-3).map((r) => r.renewableShare));
    const avg12 = average(series.slice(-12).map((r) => r.renewableShare));
    return { avg3, avg12, deltaPp: avg3 - avg12 };
  }

  // Structural change detector (md #43): 12-month average vs 5-year average.
  function computeStructuralChange(series) {
    const last60 = series.slice(-60).map((r) => r.renewableShare);
    if (last60.length < 24) return null; // need a meaningfully long window
    const avg12 = average(series.slice(-12).map((r) => r.renewableShare));
    const avg60 = average(last60);
    return { avg12, avg60, windowMonths: last60.length, deltaPp: avg12 - avg60 };
  }

  // Volatility indicator (md #45): stdev of month-to-month pp changes.
  function computeVolatility(series, windowSize) {
    const win = series.slice(-windowSize);
    if (win.length < 4) return null;
    const diffs = [];
    for (let i = 1; i < win.length; i++) diffs.push(win[i].renewableShare - win[i - 1].renewableShare);
    const mean = average(diffs);
    const variance = diffs.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / (diffs.length - 1);
    return { volatility: Math.sqrt(variance), n: diffs.length };
  }

  // Recovery tracker (md #46): current value vs a baseline year (2019 by default).
  function computeRecoveryTracker(series, latest, baselineYear) {
    const baseRow = findRowByMonth(series, baselineYear + "-" + latest.month.slice(5, 7));
    if (!baseRow) return null;
    return {
      baselineMonth: baseRow.month, baselineValue: baseRow.renewableShare,
      latestValue: latest.renewableShare, deltaPp: latest.renewableShare - baseRow.renewableShare,
    };
  }

  // Displacement analysis (md #39): renewable increase vs fossil decrease
  // over the same window as the long-term trend.
  function computeDisplacement(series, latest, years) {
    const baseRow = findRowByMonth(series, sameMonthYearsAgo(latest.month, years));
    if (!baseRow) return null;
    return {
      years,
      renewableDeltaPp: latest.renewableShare - baseRow.renewableShare,
      fossilDeltaPp: latest.fossilShare - baseRow.fossilShare,
    };
  }

  // Decarbonisation journey (md #47): renewable share at benchmark years
  // through to today. Milestone years are chosen dynamically to span
  // whatever history is actually available (5-year steps normally, 10-year
  // steps once the span gets long), rather than hardcoded years that may
  // predate this country's clean data - each leg is also annotated with the
  // pp change from the previous checkpoint, so the "journey" shows pace,
  // not just snapshots.
  function computeDecarbonisationJourney(series, latest) {
    const firstYear = parseInt(series[0].month.slice(0, 4), 10);
    const latestYear = parseInt(latest.month.slice(0, 4), 10);
    const monthSuffix = latest.month.slice(5, 7);
    const step = (latestYear - firstYear) > 25 ? 10 : 5;

    const years = [];
    for (let y = Math.ceil(firstYear / step) * step; y < latestYear; y += step) {
      years.push(y);
    }

    const points = years
      .map((y) => findRowByMonth(series, y + "-" + monthSuffix))
      .filter(Boolean)
      .map((row) => ({ year: row.month.slice(0, 4), month: row.month, value: row.renewableShare }));
    points.push({ year: null, month: latest.month, value: latest.renewableShare, isLatest: true });

    for (let i = 1; i < points.length; i++) {
      points[i].deltaPp = points[i].value - points[i - 1].value;
    }

    return points;
  }

  // ---------------------------------------------------------------------
  // Section 13: EU Comparison (md #25, #26)
  //
  // EU27_2020 is itself a fetchable "geo" aggregate in Eurostat's API, so
  // comparing against it is just a second, lighter fetch of the same
  // electricity-mix dataset rather than a full 27-country panel.
  // ---------------------------------------------------------------------

  function computeEuComparison(focusGeo, focusSeries, euSeries) {
    if (focusGeo === "EU27_2020" || !euSeries || !euSeries.length) return null;
    const latest = focusSeries[focusSeries.length - 1];
    const euRow = findRowByMonth(euSeries, latest.month) || euSeries[euSeries.length - 1];
    if (!euRow) return null;

    // "Who's decarbonising fastest" (inspired by Eurostat's own country
    // rankings) without needing a full 27-country panel: the EU27_2020
    // aggregate is already fetched in full for the snapshot comparison
    // above, so its own 5-year trend is effectively free to compute too.
    const focusFiveYear = computeTrendOverYears(focusSeries, latest, 5);
    const euLatestRow = euSeries[euSeries.length - 1];
    const euFiveYear = computeTrendOverYears(euSeries, euLatestRow, 5);
    const paceComparison = (focusFiveYear && euFiveYear) ? {
      years: focusFiveYear.years,
      focusDeltaPp: focusFiveYear.deltaPp,
      euDeltaPp: euFiveYear.deltaPp,
      fasterThanEu: focusFiveYear.deltaPp > euFiveYear.deltaPp,
    } : null;

    return {
      euMonth: euRow.month,
      euRenewableShare: euRow.renewableShare,
      euFossilShare: euRow.fossilShare,
      gapPp: latest.renewableShare - euRow.renewableShare,
      fossilGapPp: latest.fossilShare - euRow.fossilShare,
      sameMonth: euRow.month === latest.month,
      paceComparison,
    };
  }

  // ---------------------------------------------------------------------
  // Section 9: Gas Market detail (md #11 Gas Consumption, #12 Storage
  // Contribution) - reuses the same nrg_cb_gasm dataset as the KPI card's
  // gas dependency, but needs the full time series plus two more codes:
  // IC_CAL_MG (inland consumption) and STK_CHG_MG (stock change).
  // ---------------------------------------------------------------------

  function buildGasDetailUrl(geo) {
    return baseUrl("nrg_cb_gasm") + "&geo=" + geo + "&unit=TJ_GCV&siec=G3000" +
      "&nrg_bal=IPRD&nrg_bal=IMP&nrg_bal=EXP&nrg_bal=IC_CAL_MG&nrg_bal=STK_CHG_MG";
  }

  function buildGasSeries(dataset) {
    if (!dataset || !dataset.value) return [];
    const time = dataset.Dimension("time").id;
    const balances = dataset.Dimension("nrg_bal").id;
    const idx = {};
    balances.forEach((b, i) => { idx[b] = i; });

    const rows = [];
    time.forEach((month, tIdx) => {
      const get = (code) => {
        if (idx[code] === undefined) return null;
        const v = dataset.value[idx[code] * time.length + tIdx];
        return typeof v === "number" ? v : null;
      };
      const iprd = get("IPRD"), imp = get("IMP"), exp = get("EXP");
      const consumption = get("IC_CAL_MG"), stockChange = get("STK_CHG_MG");
      if (iprd === null && imp === null && exp === null && consumption === null && stockChange === null) return;

      const netImp = (imp !== null && exp !== null) ? imp - exp : null;
      const denom = (netImp !== null && iprd !== null) ? iprd + netImp : null;
      rows.push({
        month, iprd, imp, exp, netImp, consumption, stockChange,
        dependency: (denom !== null && denom !== 0) ? (netImp / denom) * 100 : null,
      });
    });

    return rows;
  }

  // insights.md #11: compare gas consumption vs previous month, previous
  // year, and a historical average. Consumption is highly seasonal, so
  // "historical average" is the average of the SAME calendar month across
  // all prior years, not a flat all-months average.
  function computeGasConsumptionComparison(series) {
    const valid = series.filter((r) => r.consumption !== null);
    if (!valid.length) return null;

    const latest = valid[valid.length - 1];
    const previousMonth = valid.length > 1 ? valid[valid.length - 2] : null;
    const monthCode = latest.month.slice(5, 7);
    const sameCalendarMonth = valid.filter((r) => r.month.slice(5, 7) === monthCode);
    const yoyRow = sameCalendarMonth.length > 1 ? sameCalendarMonth[sameCalendarMonth.length - 2] : null;
    const historicalAvg = average(sameCalendarMonth.map((r) => r.consumption));

    return {
      latest,
      deltaMoM: previousMonth ? absoluteChange(previousMonth.consumption, latest.consumption) : null,
      deltaMoMPct: previousMonth ? percentChange(previousMonth.consumption, latest.consumption) : null,
      yoyMonth: yoyRow ? yoyRow.month : null,
      deltaYoYPct: yoyRow ? percentChange(yoyRow.consumption, latest.consumption) : null,
      historicalAvg,
      sampleYears: sameCalendarMonth.length,
      deltaVsAvgPct: percentChange(historicalAvg, latest.consumption),
    };
  }

  // insights.md #12: role of storage in supporting supply - a negative
  // stock change means gas was drawn from storage into the market.
  function computeStorageContribution(series) {
    const valid = series.filter((r) => r.stockChange !== null);
    if (!valid.length) return null;
    const latest = valid[valid.length - 1];
    return { month: latest.month, stockChange: latest.stockChange, isDrawdown: latest.stockChange < 0 };
  }

  // ---------------------------------------------------------------------
  // Section 10: Oil Market (md #13 production/imports/exports, #14 crude
  // oil prices, #15 import volumes, #16 solid fossil fuels, #17 security of
  // supply, #18 stock alerts)
  // ---------------------------------------------------------------------

  const OILM_SIECS = ["O4640", "O4652", "O4661", "O4671", "O4630", "O4680"];

  function buildOilMarketUrl(geo) {
    let url = baseUrl("nrg_cb_oilm") + "&geo=" + geo + "&unit=THS_T&nrg_bal=TO_RPI_RO&nrg_bal=IMP&nrg_bal=EXP";
    OILM_SIECS.forEach((siec) => { url += "&siec=" + siec; });
    return url;
  }

  // Sums across every tracked petroleum product, since insights.md frames
  // this as a whole-market view ("petroleum production, imports and
  // exports") rather than a single-product breakdown.
  function buildOilMarketSeries(dataset) {
    if (!dataset || !dataset.value) return [];
    const time = dataset.Dimension("time").id;
    const balances = dataset.Dimension("nrg_bal").id;
    const siecs = dataset.Dimension("siec").id;
    const balIdx = {};
    balances.forEach((b, i) => { balIdx[b] = i; });

    const sumFor = (balCode, tIdx) => {
      const bIdx = balIdx[balCode];
      if (bIdx === undefined) return null;
      let sum = 0, seen = false;
      siecs.forEach((siec, sIdx) => {
        const v = dataset.value[(bIdx * siecs.length + sIdx) * time.length + tIdx];
        if (typeof v === "number") { sum += v; seen = true; }
      });
      return seen ? sum : null;
    };

    const rows = [];
    time.forEach((month, tIdx) => {
      const production = sumFor("TO_RPI_RO", tIdx);
      const imports = sumFor("IMP", tIdx);
      const exports = sumFor("EXP", tIdx);
      if (production === null && imports === null && exports === null) return;
      rows.push({ month, production, imports, exports });
    });

    return rows;
  }

  // nrg_cb_cosm: crude oil price (USD/barrel) and import volume (thousand
  // barrels). No "unit" dimension on this dataset - those values are
  // actually "indic_nrg" codes; it also mixes monthly/annual frequencies,
  // so freq=M must be pinned.
  function buildCrudeOilUrl(geo) {
    return baseUrl("nrg_cb_cosm") + "&freq=M&geo=" + geo + "&nrg_bal=IMP&indic_nrg=AVGPRC_USD_BBL&indic_nrg=VOL_THS_BBL";
  }

  function buildCrudeOilSeries(dataset) {
    if (!dataset || !dataset.value) return [];
    const time = dataset.Dimension("time").id;
    const indics = dataset.Dimension("indic_nrg").id;
    const priceIdx = indics.indexOf("AVGPRC_USD_BBL");
    const volIdx = indics.indexOf("VOL_THS_BBL");

    const rows = [];
    time.forEach((month, tIdx) => {
      const price = priceIdx !== -1 ? dataset.value[priceIdx * time.length + tIdx] : null;
      const volume = volIdx !== -1 ? dataset.value[volIdx * time.length + tIdx] : null;
      if (typeof price !== "number" && typeof volume !== "number") return;
      rows.push({
        month,
        price: typeof price === "number" ? price : null,
        volume: typeof volume === "number" ? volume : null,
      });
    });

    return rows;
  }

  // nrg_stk_oilm: oil stock levels. Its dimension is named "stk_flow" (not
  // "nrg_bal" as codesDataset lists it), with different codes; real unit is
  // THS_T, not GWH.
  function buildSecurityOfSupplyUrl(geo) {
    return baseUrl("nrg_stk_oilm") + "&geo=" + geo + "&unit=THS_T&siec=O4000&stk_flow=STKCL_EUE&stk_flow=STKCL_NAT";
  }

  function buildSecurityOfSupplySeries(dataset) {
    if (!dataset || !dataset.value) return [];
    const time = dataset.Dimension("time").id;
    const flows = dataset.Dimension("stk_flow").id;
    const euIdx = flows.indexOf("STKCL_EUE");
    const natIdx = flows.indexOf("STKCL_NAT");

    const rows = [];
    time.forEach((month, tIdx) => {
      const eue = euIdx !== -1 ? dataset.value[euIdx * time.length + tIdx] : null;
      const nat = natIdx !== -1 ? dataset.value[natIdx * time.length + tIdx] : null;
      if (typeof eue !== "number" && typeof nat !== "number") return;
      rows.push({
        month,
        stockEue: typeof eue === "number" ? eue : null,
        stockNat: typeof nat === "number" ? nat : null,
      });
    });

    return rows;
  }

  // insights.md #18: "Stock Alerts" - detect major build-ups/drawdowns.
  // There's no "STK_FLOW" code on the real API; derived here as the
  // month-on-month change in nationally-defined closing stocks.
  const STOCK_ALERT_THRESHOLD_PERCENT = 10;

  function computeStockAlert(series) {
    const valid = series.filter((r) => r.stockNat !== null);
    if (valid.length < 2) return null;
    const latest = valid[valid.length - 1];
    const previous = valid[valid.length - 2];
    const deltaThsT = latest.stockNat - previous.stockNat;
    const deltaPct = percentChange(previous.stockNat, latest.stockNat);
    return {
      month: latest.month, stockNat: latest.stockNat, deltaThsT, deltaPct,
      isMajorMove: isValid(deltaPct) && Math.abs(deltaPct) >= STOCK_ALERT_THRESHOLD_PERCENT,
    };
  }

  // ---------------------------------------------------------------------
  // Section 8: Energy Security (md #28) - a simple, transparent points-based
  // composite (each risk factor contributes 0-2 points; thresholds are a
  // documented heuristic, not an official Eurostat methodology - insights.md
  // only specifies inputs and a traffic-light output, not exact cutoffs).
  // ---------------------------------------------------------------------

  function scoreDependency(pct) {
    if (!isValid(pct)) return null;
    return pct >= 80 ? 2 : pct >= 50 ? 1 : 0;
  }

  function computeEnergySecurityIndicator({ gasDependency, oilDependency, electricityImportSharePct }) {
    const factors = [];
    let score = 0, countedFactors = 0;

    [
      ["gas", gasDependency],
      ["oil", oilDependency],
      ["electricity", electricityImportSharePct],
    ].forEach(([key, value]) => {
      const points = scoreDependency(value);
      if (points === null) return;
      score += points;
      countedFactors++;
      factors.push({ key, value, points });
    });

    if (!countedFactors) return null;

    const maxScore = countedFactors * 2;
    const level = score >= maxScore * 0.66 ? "red" : score >= maxScore * 0.33 ? "yellow" : "green";
    return { score, maxScore, level, factors };
  }

  // ---------------------------------------------------------------------
  // Section 29: Market Pressure Indicator - combines near-term momentum
  // (not levels, unlike Energy Security above) across oil price, gas
  // imports, electricity imports and oil import volume.
  // ---------------------------------------------------------------------

  const MARKET_PRESSURE_THRESHOLD_PERCENT = 2;

  function momOfLastTwo(series, field) {
    const valid = series.filter((r) => isValid(r[field]));
    if (valid.length < 2) return null;
    return percentChange(valid[valid.length - 2][field], valid[valid.length - 1][field]);
  }

  function computeMarketPressureIndicator({ crudeOilSeries, gasSeries, tradeSeries }) {
    const factors = [
      { key: "oilPrice", delta: momOfLastTwo(crudeOilSeries, "price") },
      { key: "gasImports", delta: momOfLastTwo(gasSeries, "imp") },
      { key: "electricityImports", delta: momOfLastTwo(tradeSeries, "imp") },
      { key: "oilImportVolume", delta: momOfLastTwo(crudeOilSeries, "volume") },
    ].filter((f) => isValid(f.delta));

    if (!factors.length) return null;

    const risingCount = factors.filter((f) => f.delta > MARKET_PRESSURE_THRESHOLD_PERCENT).length;
    const fallingCount = factors.filter((f) => f.delta < -MARKET_PRESSURE_THRESHOLD_PERCENT).length;
    const majority = Math.ceil(factors.length / 2);

    let level = "mixed";
    if (risingCount > fallingCount && risingCount >= majority) level = "rising";
    else if (fallingCount > risingCount && fallingCount >= majority) level = "easing";

    return { factors, level, risingCount, fallingCount, total: factors.length };
  }

  // ---------------------------------------------------------------------
  // Section 33/44: Direction of Travel / Future Outlook - a simple,
  // explicitly-labelled trend read (NOT a forecast, per insights.md #44),
  // based on the annualised pace of the last 3 years.
  // ---------------------------------------------------------------------

  const DIRECTION_FLAT_THRESHOLD_PP_PER_YEAR = 0.5;

  function computeDirectionOfTravel(trend) {
    const t3 = trend.threeYear;
    if (!t3) return null;
    const annualizedPp = t3.deltaPp / t3.years;
    const direction = annualizedPp > DIRECTION_FLAT_THRESHOLD_PP_PER_YEAR ? "up"
      : annualizedPp < -DIRECTION_FLAT_THRESHOLD_PP_PER_YEAR ? "down" : "flat";
    return { annualizedPp, direction, years: t3.years };
  }

  // ---------------------------------------------------------------------
  // Section 30: cross-domain findings - extends Key Findings (which only
  // looks at the electricity mix) with facts from the other datasets, once
  // they're available. Kept separate from buildKeyFindings so that function
  // doesn't need to know about gas/oil/security internals.
  // ---------------------------------------------------------------------

  const OIL_PRICE_MOVE_THRESHOLD_PERCENT = 10;

  function buildCrossDomainFindings({ energySecurity, oilMarket, latest }) {
    const findings = [];

    if (energySecurity && energySecurity.level !== "green") {
      const topFactor = energySecurity.factors.slice().sort((a, b) => b.points - a.points)[0];
      if (topFactor) {
        findings.push({
          type: "energy_security", level: energySecurity.level,
          factorKey: topFactor.key, factorValue: topFactor.value, month: latest.month,
        });
      }
    }

    if (oilMarket && oilMarket.crude && isValid(oilMarket.crudeDeltaPct) && Math.abs(oilMarket.crudeDeltaPct) >= OIL_PRICE_MOVE_THRESHOLD_PERCENT) {
      findings.push({
        type: "oil_price_move", deltaPct: oilMarket.crudeDeltaPct,
        price: oilMarket.crude.price, month: oilMarket.crude.month,
      });
    }

    return findings;
  }

  // ---------------------------------------------------------------------
  // Orchestration
  // ---------------------------------------------------------------------

  async function computeMonthlyInsights(options) {
    const geo = (options && options.geo) || getGeo();
    const isEuFocus = geo === "EU27_2020";

    // The electricity mix is required - if it fails, there's nothing to
    // show. Everything else is supplementary: fetched concurrently, and
    // allowed to fail independently without breaking the whole view.
    const [mixDataset, tradeDataset, gasDataset, euMixDataset, oilMarketDataset, crudeOilDataset, stockDataset] = await Promise.all([
      fetchDataset(buildElectricityMixUrl(geo)),
      fetchDataset(buildElectricityTradeUrl(geo)).catch((e) => { console.warn("[insights] trade fetch failed", e); return null; }),
      fetchDataset(buildGasDetailUrl(geo)).catch((e) => { console.warn("[insights] gas fetch failed", e); return null; }),
      isEuFocus ? Promise.resolve(null) : fetchDataset(buildElectricityMixUrl("EU27_2020")).catch((e) => { console.warn("[insights] EU comparator fetch failed", e); return null; }),
      fetchDataset(buildOilMarketUrl(geo)).catch((e) => { console.warn("[insights] oil market fetch failed", e); return null; }),
      fetchDataset(buildCrudeOilUrl(geo)).catch((e) => { console.warn("[insights] crude oil fetch failed", e); return null; }),
      fetchDataset(buildSecurityOfSupplyUrl(geo)).catch((e) => { console.warn("[insights] oil stocks fetch failed", e); return null; }),
    ]);

    const series = buildElectricityMixSeries(mixDataset);

    if (!series.length) {
      return { geo, hasData: false };
    }

    const latest = series[series.length - 1];
    const previousMonth = series.length > 1 ? series[series.length - 2] : null;
    const records = computeRecords(series);

    const gasSeries = buildGasSeries(gasDataset);
    const tradeSeries = buildElectricityTradeSeries(tradeDataset);

    const mix = { geo, series, latest, previousMonth, records };
    const headline = pickHeadline(mix);
    const kpi = buildKpiScorecard(mix, tradeSeries, gasSeries);

    const euSeries = euMixDataset ? buildElectricityMixSeries(euMixDataset) : [];
    const euComparison = computeEuComparison(geo, series, euSeries);
    const euRowForLatest = euSeries.length ? (findRowByMonth(euSeries, latest.month) || euSeries[euSeries.length - 1]) : null;
    const renewableVsNonRenewable = computeRenewableVsNonRenewable(latest, isEuFocus ? null : euRowForLatest);

    const sourceRanking = rankSources(latest);
    const sourceGrowth = computeSourceGrowth(series);

    const historicalPercentile = computeHistoricalPercentile(series, latest);

    const historicalEvolution = {
      dataCoverage: computeDataCoverage(series),
      longestStreaks: computeLongestStreaks(series),
      yearlyExtremes: computeYearlyExtremes(series),
      milestoneCrossings: computeMilestoneCrossings(series, [25, 50, 75]),
      recordBreakCount: computeRecordBreakCount(series),
    };

    const trend = {
      threeYear: computeTrendOverYears(series, latest, 3),
      fiveYear: computeTrendOverYears(series, latest, 5),
      tenYear: computeTrendOverYears(series, latest, 10),
      momentum: computeMomentumIndicator(series),
      structuralChange: computeStructuralChange(series),
      volatility: computeVolatility(series, 24),
      recovery2019: computeRecoveryTracker(series, latest, 2019),
      displacement5Year: computeDisplacement(series, latest, 5),
      decarbonisationJourney: computeDecarbonisationJourney(series, latest),
    };

    const gasMarket = {
      series: gasSeries,
      consumption: computeGasConsumptionComparison(gasSeries),
      storage: computeStorageContribution(gasSeries),
    };

    const oilMarketSeries = buildOilMarketSeries(oilMarketDataset);
    const oilLatest = oilMarketSeries.length ? oilMarketSeries[oilMarketSeries.length - 1] : null;
    const oilDependency = (oilLatest && isValid(oilLatest.imports) && isValid(oilLatest.production) && (oilLatest.production + oilLatest.imports) !== 0)
      ? (oilLatest.imports / (oilLatest.production + oilLatest.imports)) * 100
      : null;

    const crudeOilSeries = buildCrudeOilSeries(crudeOilDataset);
    const stockSeries = buildSecurityOfSupplySeries(stockDataset);
    const latestCrude = crudeOilSeries.length ? crudeOilSeries[crudeOilSeries.length - 1] : null;

    const oilMarket = {
      latest: oilLatest,
      dependency: oilDependency,
      crude: latestCrude,
      crudeSeries: crudeOilSeries,
      crudeDeltaPct: momOfLastTwo(crudeOilSeries, "price"),
      stocks: stockSeries.length ? stockSeries[stockSeries.length - 1] : null,
      stockAlert: computeStockAlert(stockSeries),
    };

    const electricityImportSharePct = (kpi.tradeBalance && kpi.tradeBalance.imp > 0)
      ? (kpi.tradeBalance.imp / (latest.total + kpi.tradeBalance.imp)) * 100
      : (kpi.tradeBalance ? 0 : null);

    const energySecurity = computeEnergySecurityIndicator({
      gasDependency: kpi.gasDependency ? kpi.gasDependency.dependency : null,
      oilDependency,
      electricityImportSharePct,
    });

    const marketPressure = computeMarketPressureIndicator({ crudeOilSeries, gasSeries, tradeSeries });
    const directionOfTravel = computeDirectionOfTravel(trend);

    const findings = buildKeyFindings(mix, euComparison)
      .concat(buildCrossDomainFindings({ energySecurity, oilMarket, latest }));

    return Object.assign({
      hasData: true,
      headline,
      kpi,
      euComparison,
      renewableVsNonRenewable,
      findings,
      sourceRanking,
      sourceGrowth,
      historicalPercentile,
      historicalEvolution,
      trend,
      gasMarket,
      oilMarket,
      energySecurity,
      marketPressure,
      directionOfTravel,
    }, mix);
  }

  return {
    computeMonthlyInsights,
    getGeo,
    isValid,
    percentChange,
    absoluteChange,
    buildElectricityMixSeries,
    computeRecords,
    pickHeadline,
    getLatestTradeBalance,
    getLatestGasDependency,
  };
})();
