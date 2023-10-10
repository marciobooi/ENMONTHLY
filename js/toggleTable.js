function openVizTable() {
  $('#chart').hide();

  setTimeout(function() {
    const chart = $("#chart").highcharts();
    if (chart) {
      chart.viewData();

      // Change the text of table highcharts-data-table-0 header summary to "Data Table"
      $("table").removeAttr("summary");
    }
  }, 100);
}

function closeTable() {
  $("table").hide();
  $("#chart").show();
   
  $("table").parent().css('display', 'none')
}
