function openVizTable() {
  $('#chart').hide();

  setTimeout(function() {
    const chart = $("#chart").highcharts();
    if (chart) {
      chart.viewData();

      // Change the text of table highcharts-data-table-0 header summary to "Data Table"
      $(".highcharts-data-table > table").removeAttr("summary");
    }
  }, 100);
}

function closeTable() {
  $(".highcharts-data-table > table").hide();
  $("#chart").show();
   
  $(".highcharts-data-table > table").parent().css('display', 'none')
}
