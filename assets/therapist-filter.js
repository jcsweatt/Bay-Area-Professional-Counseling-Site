(function () {
  var filter = document.querySelector('.therapist-filter');
  var grid = document.getElementById('therapist-grid');

  if (!filter || !grid) return;

  var buttons = Array.prototype.slice.call(filter.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.therapist-card'));
  var status = document.getElementById('therapist-filter-status');
  var transitionId = 0;
  var activeAnimations = [];

  function matchesFilter(card, selected) {
    var areas = (card.getAttribute('data-specialties') || '').split(' ');
    return selected === 'all' || areas.indexOf(selected) !== -1;
  }

  function updateStatus(selected, label, count) {
    if (selected === 'all') {
      status.textContent = 'Showing all ' + count + ' therapists.';
    } else {
      status.textContent = 'Showing ' + count + ' therapist' + (count === 1 ? '' : 's') + ' for ' + label + '.';
    }
  }

  function setActiveButton(selectedButton) {
    buttons.forEach(function (button) {
      var active = button === selectedButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function cancelActiveAnimations() {
    activeAnimations.forEach(function (animation) {
      animation.cancel();
    });
    activeAnimations = [];
  }

  function animateCard(card, frames, timing) {
    var animation = card.animate(frames, timing);
    activeAnimations.push(animation);
    return animation;
  }

  function updateImmediately(selectedButton) {
    var selected = selectedButton.getAttribute('data-filter');
    var label = selectedButton.textContent.trim();
    var count = 0;

    setActiveButton(selectedButton);
    cards.forEach(function (card) {
      var visible = matchesFilter(card, selected);

      card.hidden = !visible;
      if (visible) count += 1;
    });

    updateStatus(selected, label, count);
  }

  function updateResults(selectedButton) {
    var selected = selectedButton.getAttribute('data-filter');
    var label = selectedButton.textContent.trim();
    var motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAnimate = cards.length && typeof cards[0].animate === 'function';
    var currentTransition = transitionId + 1;
    var leaving = [];
    var positions = new Map();
    var count = 0;

    transitionId = currentTransition;
    cancelActiveAnimations();

    if (motionReduced || !canAnimate) {
      updateImmediately(selectedButton);
      return;
    }

    setActiveButton(selectedButton);

    cards.forEach(function (card) {
      if (!card.hidden) {
        positions.set(card, card.getBoundingClientRect());
        if (!matchesFilter(card, selected)) leaving.push(card);
      }
      if (matchesFilter(card, selected)) count += 1;
    });

    updateStatus(selected, label, count);

    Promise.all(leaving.map(function (card) {
      return animateCard(card, [
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(7px) scale(0.988)' }
      ], {
        duration: 155,
        easing: 'ease-out',
        fill: 'forwards'
      }).finished.catch(function () {});
    })).then(function () {
      if (currentTransition !== transitionId) return;

      cards.forEach(function (card) {
        var visible = matchesFilter(card, selected);
        var wasHidden = card.hidden;

        card.hidden = !visible;
        if (!visible) return;

        var next = card.getBoundingClientRect();
        var previous = positions.get(card);

        if (!wasHidden && previous) {
          var deltaX = previous.left - next.left;
          var deltaY = previous.top - next.top;

          if (deltaX || deltaY) {
            animateCard(card, [
              { transform: 'translate(' + deltaX + 'px, ' + deltaY + 'px)' },
              { transform: 'translate(0, 0)' }
            ], {
              duration: 400,
              easing: 'cubic-bezier(0.2, 0.72, 0.2, 1)'
            });
          }
        } else {
          animateCard(card, [
            { opacity: 0, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], {
            duration: 340,
            delay: 35,
            easing: 'cubic-bezier(0.2, 0.72, 0.2, 1)',
            fill: 'backwards'
          });
        }
      });
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      updateResults(button);
    });
  });
}());
