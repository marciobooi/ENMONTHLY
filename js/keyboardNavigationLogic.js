function trapTab() {
  // Scope selectors to subnavbar container
  const containerSel = '#subnavbar-container #chartOptionsMenu';
  const menuSel = '#subnavbar-container #menu';
  const closeBtnSel = containerSel + ' #closeChartMenuBtn';

  // Clean previous handlers (namespaced) to avoid duplicates
  $(containerSel).off('.trap');
  $(document).off('.trap');
  $(menuSel).off('.trap');

  // Focus on the close button first when opening (better accessibility)
  const closeButton = $(closeBtnSel);
  if (closeButton.length > 0) {
    closeButton.focus();
  } else {
    // fallback to first focusable element
    const firstFallback = $(containerSel).find('select, button').first();
    if (firstFallback.length) firstFallback.focus();
  }

  // Keydown handler (namespaced)
  $(containerSel).on('keydown.trap', function handleKeydown(event) {
    // Handle ESC key to close menu
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      const container = $(containerSel);
      const menuButton = $(menuSel);

      container.addClass('toggleMenu');
      menuButton.removeClass('menuOpen');
      menuButton.focus();

      // Remove helper classes that may have been added
      $('body').find('.important-styles').removeClass('important-styles');
      $('body').find('.menuOpen').removeClass('menuOpen');

      return;
    }

    if (event.key.toLowerCase() !== 'tab') {
      return;
    }

    // Include close button in focusable elements
    const closeBtn = $(closeBtnSel);
    const selects = $(containerSel + ' select');
    const btns = $(containerSel + ' button');
    const focusableElements = closeBtn.add(selects).add(btns);

    // If nothing focusable, do nothing
    if (!focusableElements || focusableElements.length === 0) return;

    const target = $(event.target);
    const firstElement = focusableElements.first();
    const lastElement = focusableElements.last();

    if (event.shiftKey) {
      if (target.is(firstElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (target.is(lastElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Click outside to close (namespaced)
  $(document).on('mouseup.trap', function (e) {
    const container = $(containerSel);
    const menuButton = $(menuSel);

    if (!container.is(e.target) && container.has(e.target).length === 0 && !menuButton.is(e.target)) {
      container.addClass('toggleMenu');
    }
  });

  // Handle click on the menu button (namespaced)
  $(menuSel).on('click.trap', function() {
    const container = $(containerSel);
    container.toggleClass('toggleMenu');
  });
}
