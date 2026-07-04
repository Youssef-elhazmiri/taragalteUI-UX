/**
 * taragalte festival - Main JavaScript
 * Handles: header scroll, mobile menu, day filter, carousel, marquee, lazy images, scroll-to-top
 */

// ============================================================
// HEADER SCROLL EFFECT
// ============================================================
(function () {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ============================================================
// NAV BUTTON ARROW HOVER EFFECT
// ============================================================
(function () {
  document.querySelectorAll('.main-nav .btn').forEach(btn => {
    const def = btn.querySelector('.nav-arrow-default');
    const hov = btn.querySelector('.nav-arrow-hover');
    if (!def || !hov) return;

    btn.addEventListener('mouseenter', () => {
      def.style.display = 'none';
      hov.style.display = 'inline';
    });
    btn.addEventListener('mouseleave', () => {
      def.style.display = 'inline';
      hov.style.display = 'none';
    });
  });
})();


// ============================================================
// MOBILE MENU
// ============================================================
function openMobileMenu() {
  const overlay = document.getElementById('mobileMenu');
  const toggle  = document.getElementById('menuToggle');
  if (!overlay) return;
  overlay.classList.add('open');
  toggle && toggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const overlay = document.getElementById('mobileMenu');
  const toggle  = document.getElementById('menuToggle');
  if (!overlay) return;
  overlay.classList.remove('open');
  toggle && toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

(function () {
  const toggle = document.getElementById('menuToggle');
  const close  = document.getElementById('menuClose');
  const overlay = document.getElementById('mobileMenu');

  toggle && toggle.addEventListener('click', openMobileMenu);
  close  && close.addEventListener('click', closeMobileMenu);

  // Close on backdrop click
  overlay && overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMobileMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
})();


// ============================================================
// PROGRAM / ARTIST FILTER (Day filter)
// ============================================================
(function () {
  const filterDropdown = document.getElementById('filterDay');
  const filterBtn      = document.getElementById('filterDayBtn');
  const dropdown       = document.getElementById('dayDropdown');
  const artistGrid     = document.getElementById('artistGrid');
  const noArtistsMsg   = document.getElementById('noArtistsMsg');
  const badge          = document.getElementById('dayBadge');

  if (!filterDropdown || !filterBtn || !dropdown) return;

  // Track selected day IDs (pending vs applied)
  let pendingDays  = new Set();
  let appliedDays  = new Set();

  // ---- Toggle dropdown ----
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = filterDropdown.classList.toggle('open');
    filterBtn.setAttribute('aria-expanded', String(isOpen));

    // Sync pending to applied when opening
    if (isOpen) {
      pendingDays = new Set(appliedDays);
      syncCheckmarks();
    }

    // Toggle plus/cross icons
    const plus  = filterBtn.querySelector('.icon-plus');
    const cross = filterBtn.querySelector('.icon-cross');
    if (plus)  plus.style.display  = isOpen ? 'none'  : 'flex';
    if (cross) cross.style.display = isOpen ? 'flex'  : 'none';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!filterDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  function closeDropdown() {
    filterDropdown.classList.remove('open');
    filterBtn.setAttribute('aria-expanded', 'false');
    const plus  = filterBtn.querySelector('.icon-plus');
    const cross = filterBtn.querySelector('.icon-cross');
    if (plus)  plus.style.display  = 'flex';
    if (cross) cross.style.display = 'none';
  }

  // ---- Dropdown items ----
  dropdown.querySelectorAll('.dropdown-item[data-filter-id]').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.filterId;
      if (pendingDays.has(id)) {
        pendingDays.delete(id);
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      } else {
        pendingDays.add(id);
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      }
    });
  });

  // ---- Clear button ----
  const clearBtn = dropdown.querySelector('[data-filter-clear]');
  clearBtn && clearBtn.addEventListener('click', () => {
    pendingDays.clear();
    syncCheckmarks();
  });

  // ---- Apply button ----
  const applyBtn = dropdown.querySelector('[data-filter-apply]');
  applyBtn && applyBtn.addEventListener('click', () => {
    appliedDays = new Set(pendingDays);
    applyFilter();
    closeDropdown();
  });

  function syncCheckmarks() {
    dropdown.querySelectorAll('.dropdown-item[data-filter-id]').forEach(item => {
      const selected = pendingDays.has(item.dataset.filterId);
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', String(selected));
    });
  }

  function applyFilter() {
    const wrappers = artistGrid ? artistGrid.querySelectorAll('.artist-teaser-wrapper') : [];
    let visibleCount = 0;

    wrappers.forEach(wrapper => {
      if (appliedDays.size === 0) {
        wrapper.classList.remove('hidden-by-filter');
        visibleCount++;
        return;
      }

      // Parse day IDs from data attribute e.g. "[515]" or "[146,515]"
      const rawDays = wrapper.dataset.dayIds || '[]';
      let dayIds = [];
      try {
        dayIds = JSON.parse(rawDays).map(String);
      } catch (_) {}

      const match = dayIds.some(d => appliedDays.has(d));
      wrapper.classList.toggle('hidden-by-filter', !match);
      if (match) visibleCount++;
    });

    // Badge
    if (badge) {
      if (appliedDays.size > 0) {
        badge.textContent = appliedDays.size;
        badge.removeAttribute('hidden');
        badge.classList.add('visible');
        // Update label text
        const label = filterBtn.querySelector('.filter-label');
        if (label) {
          // Get labels of applied items
          const labels = [];
          dropdown.querySelectorAll('.dropdown-item[data-filter-id]').forEach(item => {
            if (appliedDays.has(item.dataset.filterId)) {
              labels.push(item.dataset.filterLabel || item.querySelector('span').textContent);
            }
          });
          label.textContent = appliedDays.size === 1 ? labels[0] : 'Day';
        }
      } else {
        badge.setAttribute('hidden', '');
        badge.classList.remove('visible');
        const label = filterBtn.querySelector('.filter-label');
        if (label) label.textContent = 'Day';
      }
    }

    // No results message
    if (noArtistsMsg) {
      noArtistsMsg.classList.toggle('visible', visibleCount === 0);
    }
  }
})();


// ============================================================
// CTA CARD — hover colour effect (applied via CSS but
// also JS for inline-style cards in two-col section)
// ============================================================
(function () {
  document.querySelectorAll('.cta-card').forEach(card => {
    const color = getComputedStyle(card).getPropertyValue('--card-color').trim()
               || card.style.getPropertyValue('--card-color')
               || '#932EED';

    card.addEventListener('mouseenter', () => {
      card.style.backgroundColor = color;
      card.style.color = shouldUseDarkText(color) ? '#000' : '#fff';
    });

    card.addEventListener('mouseleave', () => {
      card.style.backgroundColor = '';
      card.style.color = '';
    });
  });

  // Determine if text should be dark based on background luminance
  function shouldUseDarkText(hex) {
    const c = hex.replace('#', '');
    if (c.length < 6) return false;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // Luminance formula
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55;
  }
})();


// ============================================================
// NAV RECO CAROUSEL
// ============================================================
(function () {
  const carousel = document.getElementById('navreco-carousel');
  const prevBtn  = document.getElementById('navrecoPrev');
  const nextBtn  = document.getElementById('navreco-next');

  if (!carousel) return;

  const SCROLL_AMOUNT = 353 + 12; // card width + gap

  function updateButtons() {
    const atStart = carousel.scrollLeft <= 4;
    const atEnd   = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
    if (prevBtn) prevBtn.disabled = atStart;
    if (nextBtn) nextBtn.disabled = atEnd;
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  });

  nextBtn && nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  });

  carousel.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();
})();


// ============================================================
// MARQUEE — pause on hover, respect reduced-motion
// ============================================================
(function () {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    track.style.animationPlayState = 'paused';
    return;
  }

  track.parentElement.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.parentElement.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
})();


// ============================================================
// LAZY IMAGE — fade in on load
// ============================================================
(function () {
  if (!('IntersectionObserver' in window)) return;

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      if (img.complete) img.classList.add('loaded');
      lazyObserver.unobserve(img);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    lazyObserver.observe(img);
  });
})();


// ============================================================
// SCROLL TO TOP BUTTON
// ============================================================
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();


// ============================================================
// LANGUAGE SWITCHER (cosmetic demo)
// ============================================================
function setLang(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === lang);
  });
}


// ============================================================
// HERO VIDEO — autoplay with fallback
// ============================================================
(function () {
  const video = document.querySelector('.hero-media video');
  if (!video) return;

  video.play().catch(() => {
    // If autoplay blocked, show poster or do nothing
    video.setAttribute('controls', '');
  });
})();


// ============================================================
// ANIMATE SECTIONS ON SCROLL (Intersection Observer)
// ============================================================
(function () {
  if (!('IntersectionObserver' in window)) return;

  const blocks = document.querySelectorAll('.container-block, .two-col-grid > .container-block');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -40px 0px'
  });

  blocks.forEach((block, i) => {
    block.style.opacity = '0';
    block.style.transform = 'translateY(28px)';
    block.style.transition = `opacity 0.55s ease ${i * 0.04}s, transform 0.55s ease ${i * 0.04}s`;
    observer.observe(block);
  });
})();
