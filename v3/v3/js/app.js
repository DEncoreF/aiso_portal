/* ======================================================================
   AISO Portal — Shared JS
   Drives all interactive behavior across index / about / solutions pages.
   Detects available DOM per page and attaches only relevant handlers.
   ====================================================================== */

(function () {
  'use strict';

  // ── 1. Mobile menu ─────────────────────────────────────────────────
  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // ── 2. Year stamp ──────────────────────────────────────────────────
  function initYearStamp() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = year;
    });
  }

  // ── 3. Header scroll effect ────────────────────────────────────────
  function initHeaderScroll() {
    var header = document.querySelector('[data-site-header]');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 40) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── 4. Scroll reveal ───────────────────────────────────────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ── 5. Back to top ─────────────────────────────────────────────────
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function onScroll() {
      if (window.scrollY > 400) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  // ── 6. Modal helper ────────────────────────────────────────────────
  function openModal(backdrop) {
    backdrop.classList.add('is-open');
    document.body.classList.add('menu-open');
  }
  function closeModal(backdrop) {
    backdrop.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  function initModalDismissal() {
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closeModal(backdrop);
      });
      backdrop.querySelectorAll('[data-modal-close]').forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal(backdrop); });
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.is-open').forEach(closeModal);
      }
    });
  }

  // ── 7. INDEX — Feature card expand ─────────────────────────────────
  function initFeatureCards() {
    document.querySelectorAll('.feature-card').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('is-open');
      });
    });
  }

  // ── 8. INDEX — Workflow step activate ──────────────────────────────
  function initWorkflowSteps() {
    var steps = document.querySelectorAll('.workflow-steps .step');
    if (!steps.length) return;
    steps.forEach(function (step) {
      step.addEventListener('click', function () {
        var wasActive = step.classList.contains('is-active');
        steps.forEach(function (s) { s.classList.remove('is-active'); });
        if (!wasActive) step.classList.add('is-active');
      });
    });
  }

  // ── 9. ABOUT — Member modal ────────────────────────────────────────
  function initAboutMembers() {
    var cards = document.querySelectorAll('.about-card');
    var modal = document.getElementById('member-modal');
    if (!cards.length) return;

    if (!modal) return;
    var mLogo = modal.querySelector('[data-modal-logo]');
    var mTitle = modal.querySelector('[data-modal-title]');
    var mDesc = modal.querySelector('[data-modal-desc]');
    var mFocus = modal.querySelector('[data-modal-focus]');

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var img = card.querySelector('img');
        var desc = card.querySelector('p');
        if (mLogo && img) {
          mLogo.src = img.src;
          mLogo.alt = img.alt || '';
        }
        if (mTitle) mTitle.textContent = card.getAttribute('data-name') || (img ? img.alt : '');
        if (mDesc) mDesc.textContent = desc ? desc.textContent : '';
        if (mFocus) mFocus.textContent = card.getAttribute('data-focus') || '—';
        openModal(modal);
      });
    });
  }

  // ── 10. SOLUTIONS — Detail modal ───────────────────────────────────
  function initSolutions() {
    var grid = document.getElementById('solutions-grid');
    if (!grid) return;

    // Detail modal
    var modal = document.getElementById('sol-modal');
    var mEyebrow = modal && modal.querySelector('[data-modal-eyebrow]');
    var mTitle = modal && modal.querySelector('[data-modal-title]');
    var mDesc = modal && modal.querySelector('[data-modal-desc]');
    var mPlat = modal && modal.querySelector('[data-modal-platforms]');
    var mAud = modal && modal.querySelector('[data-modal-audience]');
    var mUse = modal && modal.querySelector('[data-modal-use]');
    var mBundle = modal && modal.querySelector('[data-modal-bundle]');

    function openDetailModal(s) {
      if (!modal) return;
      if (mEyebrow) mEyebrow.textContent = s.tier + ' · ' + s.formFactor;
      if (mTitle) mTitle.textContent = s.tagline;
      if (mDesc) mDesc.textContent = s.description;
      if (mPlat) mPlat.innerHTML = s.platforms.map(function (p) {
        return '<li>' + p + '</li>';
      }).join('');
      if (mAud) mAud.textContent = s.audience;
      if (mUse) mUse.innerHTML = s.scenarios.map(function (x) {
        return '<li>' + x + '</li>';
      }).join('');
      if (mBundle) mBundle.innerHTML = getBundledSoftware(s).map(function (b) {
        return '<span class="sol-bundle-tag">' + b + '</span>';
      }).join('');
      openModal(modal);
    }

    function getBundledSoftware(s) {
      var bundle = Array.isArray(s.bundledSoftware) ? s.bundledSoftware.slice() : [];
      if (bundle.indexOf('Otterscale') === -1) bundle.push('Otterscale');
      return bundle;
    }

    // Build cards
    var solutions = (window.AISO_V2_DATA && window.AISO_V2_DATA.tiers) || (window.AISO_DATA && window.AISO_DATA.tiers) || window.AISO_SOLUTIONS || [];
    solutions.forEach(function (s) {
      var bundledSoftware = getBundledSoftware(s);
      var card = document.createElement('article');
      card.className = 'sol-card reveal';
      card.dataset.tier = s.id;
      card.innerHTML =
        '<div class="sol-accent"></div>' +
        '<div class="sol-body">' +
          '<div class="sol-head">' +
            '<span class="sol-tier">' + s.tier + '</span>' +
            '<span class="sol-head-sep"></span>' +
            '<span class="sol-form">' + s.formFactor + '</span>' +
          '</div>' +
          '<h3 class="sol-tagline">' + s.tagline + '</h3>' +
          '<p class="sol-desc">' + s.description + '</p>' +
          '<p class="sol-label">Platform</p>' +
          '<ul class="sol-list">' + s.platforms.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
          '<p class="sol-label">Ideal For</p>' +
          '<p class="sol-audience">' + s.audience + '</p>' +
          '<p class="sol-label">Use Cases</p>' +
          '<ul class="sol-list">' + s.scenarios.map(function (sc) { return '<li>' + sc + '</li>'; }).join('') + '</ul>' +
          '<p class="sol-label">Bundled Software</p>' +
          '<div class="sol-bundle">' +
            bundledSoftware.map(function (n) { return '<span class="sol-bundle-tag">' + n + '</span>'; }).join('') +
          '</div>' +
          '<p class="sol-caption">driven by aiDAPTIV</p>' +
        '</div>' +
        '<div class="sol-cta">' +
          '<button type="button" class="sol-btn" data-sol-quote>' +
            '<span>Request for Quote</span>' +
            '<svg viewBox="0 0 20 20" fill="none"><path d="M4 10H15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10.222 3.778L15.516 9.072a1.498 1.498 0 010 2.856L10.222 16.222" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>';

      var quoteBtn = card.querySelector('[data-sol-quote]');
      if (quoteBtn) {
        quoteBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (window.AISO_openQuote) window.AISO_openQuote(s);
        });
      }

      card.addEventListener('click', function () {
        openDetailModal(s);
      });
      grid.appendChild(card);
    });

    // Re-run scroll reveal for newly injected cards
    initScrollReveal();
  }

  // ── 11. QUOTE — inject request-quote modal ─────────────────────────
  var COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
  var INDUSTRIES = [
    'Financial Services', 'Healthcare & Life Sciences', 'Manufacturing',
    'Government / Public Sector', 'Education & Research',
    'Technology / Software', 'Retail & E-commerce',
    'Energy & Utilities', 'Telecommunications', 'Other'
  ];

  function buildQuoteModal() {
    if (document.getElementById('quote-modal')) return document.getElementById('quote-modal');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.id = 'quote-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'quote-modal-title');

    var sizeOpts = COMPANY_SIZES.map(function (s) {
      return '<option value="' + s + '">' + s + '</option>';
    }).join('');
    var industryOpts = INDUSTRIES.map(function (i) {
      return '<option value="' + i + '">' + i + '</option>';
    }).join('');

    wrap.innerHTML =
      '<div class="modal contact-modal quote-modal modal-wrap">' +
        '<div class="contact-modal-header">' +
          '<button class="modal-close" data-modal-close aria-label="Close">' +
            '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
              '<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '</svg>' +
          '</button>' +
          '<span class="contact-modal-eyebrow">Get a Quote</span>' +
          '<h3 class="contact-modal-title" id="quote-modal-title">Request a Quote</h3>' +
        '</div>' +
        '<form class="contact-form" id="quote-form" novalidate>' +
          // 1. Company
          '<div class="quote-section">' +
            '<div class="quote-section-head">' +
              '<span class="quote-step-num">1</span>' +
              '<span class="quote-section-title">Company Information</span>' +
            '</div>' +
            '<div class="contact-grid">' +
              '<div class="contact-field full">' +
                '<label for="qf-company">Company Name<span class="req">*</span></label>' +
                '<input class="contact-input" id="qf-company" name="company" type="text" required placeholder="Your company" autocomplete="organization" />' +
              '</div>' +
              '<div class="contact-field">' +
                '<label for="qf-size">Company Size<span class="req">*</span></label>' +
                '<select class="contact-select" id="qf-size" name="size" required>' +
                  '<option value="" disabled selected>Please select</option>' +
                  sizeOpts +
                '</select>' +
              '</div>' +
              '<div class="contact-field">' +
                '<label for="qf-industry">Industry<span class="req">*</span></label>' +
                '<select class="contact-select" id="qf-industry" name="industry" required>' +
                  '<option value="" disabled selected>Please select</option>' +
                  industryOpts +
                '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
          // 2. Contact
          '<div class="quote-section">' +
            '<div class="quote-section-head">' +
              '<span class="quote-step-num">2</span>' +
              '<span class="quote-section-title">Contact Information</span>' +
            '</div>' +
            '<div class="contact-grid">' +
              '<div class="contact-field">' +
                '<label for="qf-name">Contact Name<span class="req">*</span></label>' +
                '<input class="contact-input" id="qf-name" name="name" type="text" required placeholder="Your name" autocomplete="name" />' +
              '</div>' +
              '<div class="contact-field">' +
                '<label for="qf-title">Job Title</label>' +
                '<input class="contact-input" id="qf-title" name="title" type="text" placeholder="e.g. CTO" autocomplete="organization-title" />' +
              '</div>' +
              '<div class="contact-field">' +
                '<label for="qf-email">Business Email<span class="req">*</span></label>' +
                '<input class="contact-input" id="qf-email" name="email" type="email" required placeholder="you@company.com" autocomplete="email" />' +
              '</div>' +
              '<div class="contact-field">' +
                '<label for="qf-phone">Phone Number<span class="req">*</span></label>' +
                '<input class="contact-input" id="qf-phone" name="phone" type="tel" required placeholder="+886 …" autocomplete="tel" />' +
              '</div>' +
            '</div>' +
          '</div>' +
          // 3. Solution (display)
          '<div class="quote-section">' +
            '<div class="quote-section-head">' +
              '<span class="quote-step-num">3</span>' +
              '<span class="quote-section-title">Solution</span>' +
            '</div>' +
            '<div class="quote-selected" data-quote-selected>' +
              '<span class="quote-selected-eyebrow" data-quote-tier>—</span>' +
              '<div class="quote-selected-body">' +
                '<div class="quote-selected-title" data-quote-title>—</div>' +
                '<div class="quote-selected-meta" data-quote-meta>—</div>' +
              '</div>' +
            '</div>' +
            '<input type="hidden" name="solution" data-quote-hidden />' +
          '</div>' +
          // 4. Requirement
          '<div class="quote-section">' +
            '<div class="quote-section-head">' +
              '<span class="quote-step-num">4</span>' +
              '<span class="quote-section-title">Requirement</span>' +
            '</div>' +
            '<div class="contact-field full">' +
              '<label for="qf-requirement" class="sr-only" style="display:none">Requirement</label>' +
              '<textarea class="contact-textarea" id="qf-requirement" name="requirement" placeholder="Tell us about your use case, timeline, expected workloads, integration needs…"></textarea>' +
            '</div>' +
          '</div>' +
          '<button type="submit" class="contact-submit">' +
            '<span>Submit Quote Request</span>' +
            '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style="width:18px;height:18px">' +
              '<path d="M4 10h12M10.5 4.5L16 10l-5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</button>' +
          '<p class="contact-footnote">Our team will get back to you within 1–2 business days.</p>' +
          '<div class="contact-status" id="quote-status" role="status"></div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function openQuoteModal(solution) {
    var modal = buildQuoteModal();
    if (!modal) return;
    var tierEl = modal.querySelector('[data-quote-tier]');
    var titleEl = modal.querySelector('[data-quote-title]');
    var metaEl = modal.querySelector('[data-quote-meta]');
    var hidden = modal.querySelector('[data-quote-hidden]');

    if (solution) {
      if (tierEl) tierEl.textContent = solution.tier;
      if (titleEl) titleEl.textContent = solution.tagline;
      if (metaEl) metaEl.textContent = solution.formFactor + ' · ' + solution.platforms.join(', ');
      if (hidden) hidden.value = solution.tier + ' — ' + solution.tagline;
    } else {
      if (tierEl) tierEl.textContent = 'Not selected';
      if (titleEl) titleEl.textContent = 'Please choose a solution on the Solutions page.';
      if (metaEl) metaEl.textContent = '';
      if (hidden) hidden.value = '';
    }
    openModal(modal);
    var nameInput = modal.querySelector('#qf-name');
    if (nameInput) setTimeout(function () { nameInput.focus(); }, 50);
  }

  function initQuoteModal() {
    var modal = buildQuoteModal();
    if (!modal) return;

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(modal); });
    });

    var form = modal.querySelector('#quote-form');
    var status = modal.querySelector('#quote-status');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var subject = '[AISO Quote] ' + (data.get('solution') || 'General') +
        ' — ' + (data.get('company') || '');
      var bodyLines = [
        '— Company —',
        'Company: ' + (data.get('company') || ''),
        'Size: ' + (data.get('size') || ''),
        'Industry: ' + (data.get('industry') || ''),
        '',
        '— Contact —',
        'Name: ' + (data.get('name') || ''),
        'Job Title: ' + (data.get('title') || '—'),
        'Email: ' + (data.get('email') || ''),
        'Phone: ' + (data.get('phone') || ''),
        '',
        '— Solution —',
        data.get('solution') || '(not specified)',
        '',
        '— Requirement —',
        data.get('requirement') || '(none provided)'
      ];
      var href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = href;

      if (status) {
        status.textContent = 'Opening your email app… If nothing happens, please email ' + CONTACT_EMAIL + ' directly.';
        status.className = 'contact-status is-visible is-success';
      }
      setTimeout(function () {
        closeModal(modal);
        form.reset();
        if (status) status.className = 'contact-status';
      }, 2600);
    });

    // Expose so sol-card buttons / detail modal can trigger
    window.AISO_openQuote = openQuoteModal;
  }

  // ── 12. CONTACT — inject modal + intercept triggers ────────────────
  var CONTACT_EMAIL = 'contact@aisoportal.com';
  var INQUIRY_TYPES = [
    'General inquiry',
    'Solution quote',
    'Partnership',
    'Technical support',
    'Media / press',
    'Other'
  ];

  function buildContactModal() {
    if (document.getElementById('contact-modal')) return;
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.id = 'contact-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'contact-modal-title');

    var options = INQUIRY_TYPES.map(function (t) {
      return '<option value="' + t + '">' + t + '</option>';
    }).join('');

    wrap.innerHTML =
      '<div class="modal contact-modal modal-wrap">' +
        '<div class="contact-modal-header">' +
          '<button class="modal-close" data-modal-close aria-label="Close">' +
            '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
              '<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '</svg>' +
          '</button>' +
          '<span class="contact-modal-eyebrow">Get in Touch</span>' +
          '<h3 class="contact-modal-title" id="contact-modal-title">Contact AISO</h3>' +
        '</div>' +
        '<form class="contact-form" id="contact-form" novalidate>' +
          '<div class="contact-grid">' +
            '<div class="contact-field">' +
              '<label for="cf-name">Name<span class="req">*</span></label>' +
              '<input class="contact-input" id="cf-name" name="name" type="text" required placeholder="Your name" autocomplete="name" />' +
            '</div>' +
            '<div class="contact-field">' +
              '<label for="cf-email">Email<span class="req">*</span></label>' +
              '<input class="contact-input" id="cf-email" name="email" type="email" required placeholder="you@company.com" autocomplete="email" />' +
            '</div>' +
            '<div class="contact-field">' +
              '<label for="cf-company">Company</label>' +
              '<input class="contact-input" id="cf-company" name="company" type="text" placeholder="Organization" autocomplete="organization" />' +
            '</div>' +
            '<div class="contact-field">' +
              '<label for="cf-type">Inquiry Type<span class="req">*</span></label>' +
              '<select class="contact-select" id="cf-type" name="inquiry" required>' +
                '<option value="" disabled selected>Please select</option>' +
                options +
              '</select>' +
            '</div>' +
            '<div class="contact-field full">' +
              '<label for="cf-message">Message<span class="req">*</span></label>' +
              '<textarea class="contact-textarea" id="cf-message" name="message" required placeholder="Tell us about your needs…"></textarea>' +
            '</div>' +
          '</div>' +
          '<button type="submit" class="contact-submit">' +
            '<span>Send Message</span>' +
            '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style="width:18px;height:18px">' +
              '<path d="M4 10h12M10.5 4.5L16 10l-5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</button>' +
          '<p class="contact-footnote">Our team will get back to you within 1–2 business days.</p>' +
          '<div class="contact-status" id="contact-status" role="status"></div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function initContactModal() {
    var modal = buildContactModal();
    if (!modal) modal = document.getElementById('contact-modal');
    if (!modal) return;

    // Wire up dismissal (backdrop click + close button + ESC already handled
    // globally, but the global init ran before this modal existed).
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(modal); });
    });

    // Intercept any Contact AISO trigger: explicit [data-open-contact]
    // or any link pointing at the contact email.
    var selectors = [
      '[data-open-contact]',
      'a[href^="mailto:' + CONTACT_EMAIL + '"]',
      'a[href="mailto:' + CONTACT_EMAIL + '"]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        // Close mobile menu if it's open
        var mMenu = document.querySelector('[data-mobile-menu]');
        if (mMenu) {
          mMenu.classList.remove('open');
          document.body.classList.remove('menu-open');
        }
        openModal(modal);
        var nameInput = modal.querySelector('#cf-name');
        if (nameInput) setTimeout(function () { nameInput.focus(); }, 50);
      });
    });

    // Form submission → open user's mail client with a pre-filled message.
    var form = modal.querySelector('#contact-form');
    var status = modal.querySelector('#contact-status');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var subject = '[AISO] ' + (data.get('inquiry') || 'Inquiry') +
        ' — ' + (data.get('name') || '');
      var bodyLines = [
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Company: ' + (data.get('company') || '—'),
        'Inquiry Type: ' + (data.get('inquiry') || ''),
        '',
        'Message:',
        data.get('message') || ''
      ];
      var href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = href;

      if (status) {
        status.textContent = 'Opening your email app… If nothing happens, please email ' + CONTACT_EMAIL + ' directly.';
        status.className = 'contact-status is-visible is-success';
      }
      setTimeout(function () {
        closeModal(modal);
        form.reset();
        if (status) status.className = 'contact-status';
      }, 2400);
    });
  }

  // ── 13. ARCHITECTURE — Sticky side rail ───────────────────────────
  function initArchitectureRail() {
    var layers = document.querySelectorAll('.arch-layer[id]');
    var railLinks = document.querySelectorAll('[data-arch-rail]');
    if (!layers.length || !railLinks.length) return;
    var header = document.querySelector('[data-site-header]');
    var pendingId = null;

    function setActive(id) {
      railLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('data-arch-rail') === id);
      });
    }

    function getScrollTarget(layer) {
      var headerOffset = header ? header.offsetHeight : 0;
      var extraOffset = window.innerWidth <= 839 ? 16 : 24;
      return Math.max(0, window.scrollY + layer.getBoundingClientRect().top - headerOffset - extraOffset);
    }

    railLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('data-arch-rail');
        var target = document.getElementById(id);
        if (!target) return;

        event.preventDefault();
        pendingId = id;
        setActive(id);
        window.scrollTo({
          top: getScrollTarget(target),
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + id);
        }
      });
    });

    if (!('IntersectionObserver' in window)) {
      setActive(layers[0].id);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

      if (visible.length) {
        var nextId = visible[0].target.id;
        if (!pendingId || pendingId === nextId) {
          pendingId = null;
          setActive(nextId);
        }
      }
    }, {
      threshold: [0.2, 0.35, 0.5, 0.7, 0.9],
      rootMargin: '-18% 0px -45% 0px'
    });

    layers.forEach(function (layer) { io.observe(layer); });
    var initialId = (window.location.hash || '#' + layers[0].id).replace('#', '');
    setActive(document.getElementById(initialId) ? initialId : layers[0].id);
  }

  // ── Architecture tier grid — sync with data.js ────────────────────
  function initArchTierGrid() {
    var grid = document.querySelector('.arch-tier-grid');
    if (!grid) return;

    var tiers = (window.AISO_V2_DATA && window.AISO_V2_DATA.tiers) || [];
    if (!tiers.length) return;

    var arrowSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
      '<path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    grid.innerHTML = tiers.map(function (t) {
      var platformShort = t.platforms.slice(0, 2).join(' · ');
      if (t.platforms.length > 2) platformShort += ' · …';
      return [
        '<a class="arch-tier-card" href="solutions.html#' + t.id + '" data-tier="' + t.id + '">',
          '<div class="arch-tier-card-head">',
            '<span class="arch-tier-badge">' + t.tier + '</span>',
            '<span class="arch-tier-form">' + t.formFactor + '</span>',
          '</div>',
          '<p class="arch-tier-platform">' + platformShort + '</p>',
          '<p class="arch-tier-desc">' + t.audience + '</p>',
          '<span class="arch-tier-cta">View Solution ' + arrowSvg + '</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  // ── Bootstrap ─────────────────────────────────────────────────────
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initMobileMenu();
    initYearStamp();
    initHeaderScroll();
    initModalDismissal();
    initFeatureCards();
    initWorkflowSteps();
    initAboutMembers();
    initQuoteModal();
    initSolutions();
    initContactModal();
    initScrollReveal();
    initBackToTop();
    initArchitectureRail();
    initArchTierGrid();
  });
})();

// Architecture page tabs
(function () {
  const tabBtns = document.querySelectorAll('.arch-tab-btn');
  if (!tabBtns.length) return;

  function activateTab(tab) {
    document.body.dataset.archTab = tab;
    tabBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
    document.querySelectorAll('.arch-tab-panel').forEach(p =>
      p.classList.toggle('is-active', p.dataset.panel === tab)
    );
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));

  // Set default
  activateTab('hardware');
})();
