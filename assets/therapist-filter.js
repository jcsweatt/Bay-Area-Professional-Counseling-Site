(function () {
  var filter = document.querySelector('.therapist-filter');
  var grid = document.getElementById('therapist-grid');

  if (!filter || !grid) return;

  var buttons = Array.prototype.slice.call(filter.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.therapist-card'));
  var status = document.getElementById('therapist-filter-status');

  function updateResults(selectedButton) {
    var selected = selectedButton.getAttribute('data-filter');
    var label = selectedButton.textContent.trim();
    var count = 0;

    buttons.forEach(function (button) {
      var active = button === selectedButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    cards.forEach(function (card) {
      var areas = (card.getAttribute('data-specialties') || '').split(' ');
      var visible = selected === 'all' || areas.indexOf(selected) !== -1;

      card.hidden = !visible;
      if (visible) count += 1;
    });

    if (selected === 'all') {
      status.textContent = 'Showing all ' + count + ' therapists.';
    } else {
      status.textContent = 'Showing ' + count + ' therapist' + (count === 1 ? '' : 's') + ' for ' + label + '.';
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      updateResults(button);
    });
  });
}());
