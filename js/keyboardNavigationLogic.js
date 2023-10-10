function trapTab() {

  var capture = $("#chartOptionsMenu").attr("tabindex", "-1").focus();

  capture.keydown(function handleKeydown(event) {
    if (event.key.toLowerCase() !== "tab") {
      return;
    }

    var tabbable = $().add(capture.find("button"));
    var target = $(event.target);

    if (event.shiftKey) {
      if (target.is(capture) || target.is(tabbable.first())) {
        event.preventDefault();
        tabbable.last().focus();
      }
    } else {
      if (target.is(tabbable.last())) {
        event.preventDefault();
        tabbable.first().focus();
      }
    }
  });


  // $(document).mouseup(function (e) {
  //   e.stopPropagation()
  //   e.preventDefault()
  //   var container = $("#chartOptionsMenu");
  // log('here')
  //   // Check if the click is outside the container or on the menu button
  //   if (!container.is(e.target) && container.has(e.target).length === 0) {
  //     container.addClass('toggleMenu');      
  //     $( "#menu i" ).removeClass( 'fa-times' ).addClass( 'fa-bars' );    
  //   }
  // });
  
  // // Handle click on the menu button
  // $("#menu").click(function() {
  //   var container = $("#chartOptionsMenu");
  //   container.toggleClass('toggleMenu');
  // });
  

  // let popup = document.querySelector('#chartOptionsMenu');
  

  // window.onclick = e => {
  //   if (e.target !== popup ) {
  //     log(true)
  //     // popup.classList.add('toggleMenu')
  //     if(!$(e.target).hasClass( "toggleMenu" )) {
  //       log(true)
  //         $("#chartOptionsMenu").toggleClass( 'toggleMenu' )
  //     } else {
  //       return
  //     }
  //   }
  // }






}