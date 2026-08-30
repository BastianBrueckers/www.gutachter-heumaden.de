document.documentElement.classList.add('js-enabled');

function setMenuState(isOpen) {
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.menu-toggle');

  if (!nav) return;

  nav.classList.toggle('open', isOpen);
  if (toggle) {
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  }
}

function toggleMenu() {
  var nav = document.getElementById('nav');
  setMenuState(Boolean(nav && !nav.classList.contains('open')));
}

function closeMenu() {
  setMenuState(false);
}

function initHeaderShadow() {
  var header = document.querySelector('.header');
  if (!header) return;

  function updateHeaderShadow() {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 20px rgba(0,0,0,0.15)'
      : 'none';
  }

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();
}

function initFaqAccordion() {
  var accordions = document.querySelectorAll('[data-faq-accordion]');
  if (!accordions.length) return;

  function setItemState(item, isOpen) {
    var button = item.querySelector('.faq-trigger');
    var panel = item.querySelector('.faq-panel');
    var symbol = item.querySelector('.faq-symbol');

    if (!button || !panel) return;

    item.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
    panel.style.opacity = isOpen ? '1' : '0';
    if (symbol) symbol.textContent = isOpen ? '−' : '+';
  }

  accordions.forEach(function (accordion, accordionIndex) {
    var items = Array.prototype.slice.call(accordion.querySelectorAll('.faq-item'));

    items.forEach(function (item, itemIndex) {
      var button = item.querySelector('.faq-trigger');
      var panel = item.querySelector('.faq-panel');
      if (!button || !panel) return;

      var baseId = 'local-faq-' + (accordionIndex + 1) + '-' + (itemIndex + 1);
      if (!button.id) button.id = baseId + '-button';
      if (!panel.id) panel.id = baseId + '-panel';
      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', button.id);
      panel.hidden = false;
      setItemState(item, false);

      button.addEventListener('click', function () {
        var shouldOpen = !item.classList.contains('is-open');

        items.forEach(function (otherItem) {
          setItemState(otherItem, shouldOpen && otherItem === item);
        });
      });
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('[data-faq-accordion] .faq-item.is-open .faq-panel').forEach(function (panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });
}

function initProcessSlider() {
  var slider = document.querySelector('[data-process-slider]');
  if (!slider) return;

  var track = slider.querySelector('[data-process-track]');
  var cards = track
    ? Array.prototype.slice.call(track.querySelectorAll('[data-process-card]'))
    : [];
  var prevButton = slider.querySelector('[data-process-prev]');
  var nextButton = slider.querySelector('[data-process-next]');
  var dotsContainer = slider.parentElement.querySelector('[data-process-dots]');
  var currentIndex = 0;
  var resizeFrame = null;

  if (!track || !cards.length || !dotsContainer) return;

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function getCardCenter(card) {
    var trackRect = track.getBoundingClientRect();
    var cardRect = card.getBoundingClientRect();
    return cardRect.left - trackRect.left + track.scrollLeft + cardRect.width / 2;
  }

  function getIndex() {
    var trackCenter = track.scrollLeft + track.clientWidth / 2;
    var closestIndex = 0;
    var closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach(function (card, index) {
      var cardCenter = getCardCenter(card);
      var distance = Math.abs(cardCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function updateControls(index) {
    currentIndex = Math.max(0, Math.min(cards.length - 1, index));

    cards.forEach(function (card, cardIndex) {
      var isActive = cardIndex === currentIndex;
      card.classList.toggle('is-active', isActive);
      if (isActive) {
        card.setAttribute('aria-current', 'step');
      } else {
        card.removeAttribute('aria-current');
      }
    });

    Array.prototype.forEach.call(dotsContainer.children, function (dot, dotIndex) {
      var isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    if (prevButton) prevButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.disabled = currentIndex === cards.length - 1;
  }

  function scrollToIndex(index, behavior) {
    var boundedIndex = Math.max(0, Math.min(cards.length - 1, index));
    var card = cards[boundedIndex];
    var rawTarget = getCardCenter(card) - track.clientWidth / 2;
    var target = Math.min(Math.max(0, rawTarget), getMaxScroll());

    updateControls(boundedIndex);
    track.scrollTo({ left: target, behavior: behavior || 'smooth' });
  }

  function renderDots() {
    dotsContainer.innerHTML = '';
    cards.forEach(function (_card, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'process-dot';
      dot.setAttribute('aria-label', 'Schritt ' + (index + 1) + ' anzeigen');
      dot.addEventListener('click', function () {
        scrollToIndex(index);
      });
      dotsContainer.appendChild(dot);
    });
    updateControls(currentIndex);
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      scrollToIndex(currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      scrollToIndex(currentIndex + 1);
    });
  }

  track.addEventListener('scroll', function () {
    updateControls(getIndex());
  }, { passive: true });

  function handleResize() {
    if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = null;
      scrollToIndex(currentIndex, 'auto');
    });
  }

  window.addEventListener('resize', handleResize);
  renderDots();
  window.requestAnimationFrame(function () {
    scrollToIndex(0, 'auto');
  });
}

function initContactForms() {
  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    var email = form.querySelector('input[name="email"]');
    var phone = form.querySelector('input[name="phone"]');
    var error = form.querySelector('[data-contact-error]');

    function hasContactValue() {
      return Boolean(
        (email && email.value.trim()) ||
        (phone && phone.value.trim())
      );
    }

    function updateContactValidity() {
      var message = hasContactValue() ? '' : 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.';
      if (email) email.setCustomValidity(message);
      if (phone) phone.setCustomValidity('');
      if (error) error.hidden = !message;
      return !message;
    }

    if (email) email.addEventListener('input', updateContactValidity);
    if (phone) phone.addEventListener('input', updateContactValidity);
    form.addEventListener('submit', function (event) {
      if (!updateContactValidity()) {
        event.preventDefault();
        if (email) email.focus();
      }
    });
  });
}

function initPageFeatures() {
  initHeaderShadow();
  initFaqAccordion();
  initProcessSlider();
  initContactForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageFeatures);
} else {
  initPageFeatures();
}
