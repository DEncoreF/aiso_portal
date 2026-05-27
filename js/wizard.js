function resolveRecommendation(answers) {
  var data = window.AISO_V2_DATA || {};
  var tiers = data.tiers || [];
  var catalog = data.softwareCatalog || [];
  var rules = data.recommendationRules || {};
  var tierOrder = rules.tierOrder || [];

  // 1. Tier from scale answer only
  var scaleTier = rules.sizeToTier ? rules.sizeToTier[answers.scale] : 'personal';
  var baseIdx = tierOrder.indexOf(scaleTier);
  if (baseIdx < 0) baseIdx = 0;

  // 2. Software domain from goal
  var goalValue = Array.isArray(answers.goal) ? answers.goal[0] : answers.goal;
  var domain = rules.goalToDomain ? rules.goalToDomain[goalValue] : null;

  // 3. Bump tier if domain requires higher minimum
  var finalIdx = baseIdx;
  if (domain && rules.domainMinTier) {
    var domainFloor = tierOrder.indexOf(rules.domainMinTier[domain]);
    if (domainFloor > finalIdx) finalIdx = domainFloor;
  }

  var tierId = tierOrder[finalIdx];
  var tier = tiers.find(function(t) { return t.id === tierId; }) || tiers[0];

  // 4. Add-ons: filter by domain + minTier, then sort by industry rank
  var rankList = [];

  var eligible = domain
    ? catalog.filter(function(s) {
        return s.domain === domain &&
               !s.isBundled &&
               tierOrder.indexOf(s.minTier) <= finalIdx;
      })
    : [];

  eligible.sort(function(a, b) {
    var ai = rankList.indexOf(a.id);
    var bi = rankList.indexOf(b.id);
    if (ai === -1) ai = 999;
    if (bi === -1) bi = 999;
    return ai - bi;
  });

  var addOns = eligible.slice(0, 3);

  // 5. 'Why this fits' sentence (3 parts: scale + goal + industry)
  var fr = rules.fitReasons || {};
  var whyFits = 'This stack is ' +
    ((fr.scale && fr.scale[answers.scale]) || '') + ', ' +
    ((fr.goal  && fr.goal[answers.goal])   || '') + ' — ' +
    ((fr.pain  && fr.pain[answers.pain])   || '') + '.';

  // 6. Alternative = next tier up
  var altTier = finalIdx < tierOrder.length - 1
    ? tiers.find(function(t) { return t.id === tierOrder[finalIdx + 1]; }) || null
    : null;

  return { tier: tier, domain: domain, addOns: addOns, whyFits: whyFits, altTier: altTier, tierId: tierId, finalIdx: finalIdx };
}

(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  var data = window.AISO_V2_DATA || {};
  var root = document.getElementById('solutions-wizard');
  var stage = document.getElementById('wizard-stage');
  var quoteModal = document.getElementById('wizard-quote-modal');
  var quoteForm = document.getElementById('wizard-quote-form');
  var quoteSummary = quoteModal && quoteModal.querySelector('[data-quote-summary]');
  var quoteSummaryMobile = quoteModal && quoteModal.querySelector('[data-quote-summary-mobile]');
  var quoteStatus = quoteModal && quoteModal.querySelector('[data-quote-status]');
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var TRANSITION_MS = 220;
  var state = {
    screen: -1,
    answers: {
      scale: null,
      goal: [],
      pain: null
    },
    recommendation: null,
    activeTierId: null,
    selectedAddOns: [],
    selectedAddOnsKey: null,
    isTransitioning: false
  };

  if (!root || !stage) return;

  if (!isDataReady()) {
    renderFatal('The Solutions Wizard data is unavailable on this page.');
    return;
  }

  syncQuoteFormMarkup();
  bindEvents();
  renderStage();

  function isDataReady() {
    return Array.isArray(data.tiers) &&
      Array.isArray(data.softwareCatalog) &&
      Array.isArray(data.wizardQuestions) &&
      data.wizardQuestions.length >= 3 &&
      data.recommendationRules;
  }

  function bindEvents() {
    stage.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === 1
        ? event.target
        : event.target.parentElement;
      var answerButton;
      var actionButton;

      if (!target || !target.closest) return;

      answerButton = target.closest('[data-answer-value]');
      actionButton = target.closest('[data-action]');

      if (actionButton) {
        var action = actionButton.getAttribute('data-action');
        var productNode;
        var pid;
        var idx;
        var tierButton;
        var newTierId;
        var newFinalIdx;
        var newDomain;
        var firstEligible;
        var tierOrder;

        if (action === 'switch-tier') {
          if (state.isTransitioning) return;

          tierButton = target.closest('[data-tier-id]');
          newTierId = tierButton && tierButton.dataset ? tierButton.dataset.tierId : null;
          if (!newTierId || newTierId === state.activeTierId) return;

          tierOrder = (data.recommendationRules && data.recommendationRules.tierOrder) || [];
          state.activeTierId = newTierId;
          newFinalIdx = tierOrder.indexOf(newTierId);
          var activeGoal = Array.isArray(state.answers.goal) ? state.answers.goal[0] : state.answers.goal;
          newDomain = (data.recommendationRules.goalToDomain || {})[activeGoal] || null;
          firstEligible = newDomain
            ? (data.softwareCatalog || []).filter(function (s) {
                return s.domain === newDomain && !s.isBundled &&
                  tierOrder.indexOf(s.minTier) <= newFinalIdx;
              })[0]
            : null;
          state.selectedAddOns = firstEligible ? [firstEligible.id] : [];
          navigateTo(3);
          return;
        }

        if (action === 'toggle-addon') {
          if (state.isTransitioning) return;

          productNode = target.closest('[data-product-id]');
          pid = actionButton.dataset.productId || (productNode && productNode.dataset.productId);
          if (!pid) return;

          idx = state.selectedAddOns.indexOf(pid);
          if (idx === -1) {
            state.selectedAddOns = [pid];
          } else {
            state.selectedAddOns = [];
          }

          navigateTo(3);
          return;
        }

        handleAction(action);
        return;
      }

      if (answerButton) {
        handleAnswerSelection(
          answerButton.getAttribute('data-question-id'),
          answerButton.getAttribute('data-answer-value')
        );
      }
    });

    if (quoteModal) {
      quoteModal.addEventListener('click', function (event) {
        if (event.target === quoteModal) closeQuoteModal();
      });

      Array.prototype.slice.call(
        quoteModal.querySelectorAll('[data-modal-close]')
      ).forEach(function (button) {
        button.addEventListener('click', closeQuoteModal);
      });
    }

    if (quoteForm) {
      quoteForm.addEventListener('submit', handleQuoteSubmit);
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && quoteModal && quoteModal.classList.contains('is-open')) {
        closeQuoteModal();
      }
    });
  }

  function handleAction(action) {
    if (state.isTransitioning) return;

    if (action === 'start') {
      transitionTo(0, 'forward');
      return;
    }

    if (action === 'back') {
      transitionTo(Math.max(-1, state.screen - 1), 'back');
      return;
    }

    if (action === 'restart') {
      state.answers = {
        scale: null,
        goal: [],
        pain: null
      };
      state.recommendation = null;
      state.activeTierId = null;
      state.selectedAddOns = [];
      state.selectedAddOnsKey = null;
      closeQuoteModal();
      transitionTo(-1, 'back');
      return;
    }

    if (action === 'quote') {
      openQuoteModal();
    }

    if (action === 'next-goal') {
      if (Array.isArray(state.answers.goal) && state.answers.goal.length > 0) {
        transitionTo(2, 'forward');
      }
      return;
    }
  }

  function handleAnswerSelection(questionId, value) {
    if (state.isTransitioning || !questionId || !value) return;
    var question = getQuestionById(questionId);
    if (question && question.multiSelect) {
      var arr = Array.isArray(state.answers[questionId]) ? state.answers[questionId].slice() : [];
      var idx = arr.indexOf(value);
      if (idx === -1) { arr.push(value); } else { arr.splice(idx, 1); }
      state.answers[questionId] = arr;
      renderStage();
      return;
    }
    state.answers[questionId] = value;
    if (questionId === 'scale') { transitionTo(1, 'forward'); return; }
    if (questionId === 'goal') { transitionTo(2, 'forward'); return; }
    if (questionId === 'pain') {
      state.recommendation = resolveRecommendation(state.answers);
      transitionTo(3, 'forward');
    }
  }

  function transitionTo(nextScreen, direction) {
    if (nextScreen === state.screen) {
      renderStage();
      return;
    }

    state.isTransitioning = true;
    scrollToTop();

    if (prefersReducedMotion()) {
      state.screen = nextScreen;
      renderStage();
      state.isTransitioning = false;
      return;
    }

    stage.classList.toggle('is-backward', direction === 'back');
    stage.classList.add('is-transitioning-out');

    window.setTimeout(function () {
      state.screen = nextScreen;
      renderStage();
      stage.classList.remove('is-transitioning-out');
      stage.classList.add('is-transitioning-in');

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          stage.classList.remove('is-transitioning-in');
          state.isTransitioning = false;
        });
      });
    }, TRANSITION_MS);
  }

  function navigateTo(nextScreen) {
    var recommendation;

    if (nextScreen === -1) {
      state.screen = nextScreen;
      renderStage();
      return;
    }

    if (nextScreen === 3) {
      recommendation = state.recommendation || resolveRecommendation(state.answers);
      state.recommendation = recommendation;
      if (state.activeTierId === null) state.activeTierId = recommendation.tierId;
    }

    state.screen = nextScreen;
    renderStage();
  }

  function renderStage() {
    if (state.screen === 3 && !state.recommendation) {
      state.recommendation = resolveRecommendation(state.answers);
    }

    if (state.screen === 3 && state.activeTierId === null && state.recommendation) {
      state.activeTierId = state.recommendation.tierId;
    }

    stage.setAttribute('data-screen', String(state.screen));
    stage.innerHTML = getScreenMarkup();
  }

  function getScreenMarkup() {
    if (state.screen === -1) return renderBrowse();
    if (state.screen >= 0 && state.screen <= 2) return getQuestionMarkup(data.wizardQuestions[state.screen]);
    if (state.screen === 3) return getResultMarkup();
    return getErrorMarkup('The requested step is not available.');
  }

  function renderBrowse() {
    return [
      '<section class="wizard-screen wiz-browse">',
      '  <div class="wiz-hero-layout">',
      '    <div class="wiz-hero-inner">',
      '      <div class="wiz-hero-kicker-pill">',
      '        <span class="wiz-hero-kicker-dot" aria-hidden="true"></span>',
      '        Sovereign AI &nbsp;&middot;&nbsp; On-premise &nbsp;&middot;&nbsp; No cloud',
      '      </div>',
      '      <h1 class="wizard-title wiz-hero-title">Your AI. Your Data.</h1>',
      '      <div class="wiz-hero-accent-wrap">',
      '        <h1 class="wizard-title wiz-hero-title wiz-hero-title-accent">Your Rules.</h1>',
      '        <div class="wiz-hero-accent-line" aria-hidden="true"></div>',
      '      </div>',
      '      <p class="wiz-hero-copy">A complete AI stack running entirely on your infrastructure. Full ownership. Absolute control.</p>',
      '      <div class="wiz-hero-cta">',
      '        <button class="wiz-hero-primary-btn" data-action="start">Find My Solution →</button>',
      '        <div class="wiz-hero-hint-block">',
      '          <p class="wiz-hero-hint-strong">3 questions</p>',
      '          <p class="wiz-hero-hint-sub">under a minute &nbsp;&middot;&nbsp; no signup</p>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="wiz-hero-visual" aria-hidden="true">',
      '      <div class="wiz-hero-glyph">',
      '        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '          <circle cx="160" cy="160" r="120" stroke="rgba(129,140,248,0.12)" stroke-width="1"/>',
      '          <circle cx="160" cy="160" r="80" stroke="rgba(129,140,248,0.18)" stroke-width="1"/>',
      '          <circle cx="160" cy="160" r="40" stroke="rgba(129,140,248,0.28)" stroke-width="1"/>',
      '          <circle cx="160" cy="160" r="8" fill="rgba(129,140,248,0.6)"/>',
      '          <line x1="160" y1="40" x2="160" y2="280" stroke="rgba(129,140,248,0.08)" stroke-width="1"/>',
      '          <line x1="40" y1="160" x2="280" y2="160" stroke="rgba(129,140,248,0.08)" stroke-width="1"/>',
      '          <circle cx="160" cy="40" r="4" fill="rgba(129,140,248,0.5)"/>',
      '          <circle cx="280" cy="160" r="4" fill="rgba(129,140,248,0.35)"/>',
      '          <circle cx="160" cy="280" r="4" fill="rgba(129,140,248,0.25)"/>',
      '          <circle cx="40" cy="160" r="4" fill="rgba(129,140,248,0.2)"/>',
      '          <path d="M160 40 A120 120 0 0 1 280 160" stroke="rgba(129,140,248,0.4)" stroke-width="1.5" stroke-linecap="round"/>',
      '          <path d="M160 80 A80 80 0 0 0 80 160" stroke="rgba(129,140,248,0.25)" stroke-width="1" stroke-linecap="round"/>',
      '        </svg>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function getQuestionMarkup(question) {
    var currentStep = state.screen + 1;
    if (question.multiSelect) {
      var selectedValues = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
      var hasSelection = selectedValues.length > 0;
      var optionsHtml = question.options.map(function (option) {
        var isSelected = selectedValues.indexOf(option.value) !== -1;
        return [
          '<button',
            ' type="button"',
            ' class="wizard-answer-card wizard-answer-card-check' + (isSelected ? ' is-selected' : '') + '"',
            ' data-question-id="', escapeAttr(question.id), '"',
            ' data-answer-value="', escapeAttr(option.value), '"',
          '>',
            '<span class="wizard-check-box" aria-hidden="true">',
              isSelected ? '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '',
            '</span>',
            '<span class="wizard-answer-label">', escapeHtml(option.label), '</span>',
            '<span class="wizard-answer-sub">', escapeHtml(option.sub), '</span>',
          '</button>'
        ].join('');
      }).join('');
      return [
        '<section class="wizard-screen wizard-screen-question">',
          '<div class="wizard-screen-inner wizard-screen-shell wizard-screen-shell-medium">',
            '<div class="wizard-toolbar">',
              '<button type="button" class="wizard-back-button" data-action="back">',
                getBackIconMarkup(),
                '<span>Back</span>',
              '</button>',
              '<div class="wiz-step-bar" aria-label="Step ' + currentStep + ' of ' + data.wizardQuestions.length + '">',
                data.wizardQuestions.map(function (_, i) {
                  return '<span class="wiz-step-dot' + (i === state.screen ? ' is-active' : (i < state.screen ? ' is-done' : '')) + '"></span>';
                }).join('<span class="wiz-step-line"></span>'),
              '</div>',
            '</div>',
            '<div class="wizard-copy-block">',
              '<span class="wizard-copy-kicker">Question ', escapeHtml(String(currentStep)), '</span>',
              '<h1 class="wizard-title wizard-title-question">', escapeHtml(question.question), '</h1>',
              '<p class="wizard-subtitle wizard-subtitle-question">', escapeHtml(question.subtext), '</p>',
            '</div>',
            '<div class="wizard-card-grid wizard-card-grid-multiselect">',
              optionsHtml,
            '</div>',
            '<div class="wizard-multiselect-footer">',
              '<button type="button" class="wizard-continue-btn' + (hasSelection ? '' : ' is-disabled') + '" data-action="next-goal"' + (hasSelection ? '' : ' disabled') + '>',
                'Continue',
                '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              '</button>',
            '</div>',
          '</div>',
        '</section>'
      ].join('');
    }
    var selectedValue = state.answers[question.id];
    var cardGridClasses = ['wizard-card-grid'];
    if (question.options.length === 4) cardGridClasses.push('wizard-card-grid-four');
    if (question.options.length === 5 && question.layout === '3-2') {
      cardGridClasses.push('wizard-card-grid-five-3-2');
    } else if (question.options.length === 5) {
      cardGridClasses.push('wizard-card-grid-five');
    }
    if (question.options.length === 6) cardGridClasses.push('wizard-card-grid-six');
    if (question.options.length % 2 === 1) cardGridClasses.push('wizard-card-grid-odd');

    return [
      '<section class="wizard-screen wizard-screen-question">',
        '<div class="wizard-screen-inner wizard-screen-shell wizard-screen-shell-medium">',
          '<div class="wizard-toolbar">',
            '<button type="button" class="wizard-back-button" data-action="back">',
              getBackIconMarkup(),
              '<span>Back</span>',
            '</button>',
            '<div class="wiz-step-bar" aria-label="Step ' + currentStep + ' of ' + data.wizardQuestions.length + '">',
              data.wizardQuestions.map(function (_, i) {
                return '<span class="wiz-step-dot' + (i === state.screen ? ' is-active' : (i < state.screen ? ' is-done' : '')) + '"></span>';
              }).join('<span class="wiz-step-line"></span>'),
            '</div>',
          '</div>',
          '<div class="wizard-copy-block">',
            '<span class="wizard-copy-kicker">Question ', escapeHtml(String(currentStep)), '</span>',
            '<h1 class="wizard-title wizard-title-question">', escapeHtml(question.question), '</h1>',
            '<p class="wizard-subtitle wizard-subtitle-question">', escapeHtml(question.subtext), '</p>',
          '</div>',
          '<div class="', cardGridClasses.join(' '), '">',
            question.options.map(function (option) {
              return getAnswerCardMarkup(question.id, option, selectedValue === option.value);
            }).join(''),
          '</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function getSolutionNarrative() {
    var narratives = (data.solutionNarratives) || {};
    var goal = state.answers.goal || '';
    var pain = state.answers.pain || '';
    var key = goal + '|' + pain;
    return narratives[key] || narratives[goal] || narratives['default'] || {
      role: 'On-Premise AI for Your Organisation',
      headline: 'A sovereign AI deployment tailored to your scale and objectives.',
      points: ['Runs entirely on your own infrastructure — zero cloud dependency', 'Covers your AI use case from day one with a pre-configured stack', 'Full control over your models, data, and deployment — permanently']
    };
  }

  function getResultMarkup() {
    var recommendation = state.recommendation || resolveRecommendation(state.answers);
    var narrative;
    var scaleLabel = getSelectedLabel('scale', state.answers.scale);
    var goalLabel = Array.isArray(state.answers.goal) ? state.answers.goal.map(function(v){ return getSelectedLabel('goal', v); }).join(', ') : getSelectedLabel('goal', state.answers.goal);
    var painLabel  = getPainLabel(state.answers.pain);

    if (!recommendation || !recommendation.tier) {
      return getErrorMarkup('A recommendation could not be generated from the current answers.');
    }

    state.recommendation = recommendation;
    if (state.activeTierId === null) state.activeTierId = recommendation.tierId;

    narrative = getSolutionNarrative();

    var headlineParts = narrative.headline.split('.');
    var firstPart = headlineParts[0] ? escapeHtml(headlineParts[0].trim()) + '.' : '';
    var restPart  = headlineParts.slice(1).join('.').trim();
    var headlineHtml = restPart
      ? firstPart + ' <span class="wiz-result-headline-accent">' + escapeHtml(restPart) + '</span>'
      : firstPart;

    var checkItems = [
      'Sovereign AI stack sized for your team',
      'Configuration matched to your ' + escapeHtml(goalLabel || 'objective'),
      'Deployment scope sized for a ' + escapeHtml(painLabel || 'your budget') + ' investment',
      'Response within 2-3 business days'
    ];

    var checklistHtml = checkItems.map(function (item) {
      return [
        '<li class="wiz-result-check-item">',
          '<span class="wiz-result-check-icon" aria-hidden="true">',
            '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          '</span>',
          '<span>' + item + '</span>',
        '</li>'
      ].join('');
    }).join('');

    return [
      '<section class="wizard-screen wizard-screen-result">',
        '<div class="wizard-screen-inner wizard-screen-shell wizard-screen-shell-narrow">',
          '<div class="wizard-toolbar wizard-toolbar-result">',
            '<button type="button" class="wizard-back-button" data-action="back">',
              getBackIconMarkup(),
              '<span>Back</span>',
            '</button>',
            '<button type="button" class="wizard-reset-button" data-action="restart">Start Over</button>',
          '</div>',
          '<div class="wiz-result-card">',

            '<div class="wiz-result-captured-pill">',
              '<svg class="wiz-result-check-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              'Requirements captured',
            '</div>',

            '<h1 class="wiz-result-headline">', headlineHtml, '</h1>',

            '<p class="wiz-result-sub">Our solutions team will review your requirements and respond with a configuration built around your answers — not a generic bundle.</p>',

            '<div class="wiz-result-checklist">',
              '<p class="wiz-result-checklist-label">Your proposal will include</p>',
              '<ul class="wiz-result-check-list">', checklistHtml, '</ul>',
            '</div>',

            '<button type="button" class="wiz-result-cta-btn" data-action="quote">',
              '<span>Get a Tailored Quote</span>',
              '<span class="wiz-result-cta-arrow" aria-hidden="true">',
                '<svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              '</span>',
            '</button>',

          '</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function getErrorMarkup(message) {
    return [
      '<section class="wizard-screen wizard-screen-error">',
        '<div class="wizard-screen-inner wizard-screen-shell wizard-screen-shell-narrow wizard-center-copy">',
          '<span class="wizard-eyebrow">Solutions Wizard</span>',
          '<h1 class="wizard-title wizard-title-error">Unable to load the wizard</h1>',
          '<p class="wizard-subtitle">', escapeHtml(message), '</p>',
          '<a class="wizard-primary-button wizard-primary-link" href="mailto:contact@aisoportal.com">Contact AISO</a>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderFatal(message) {
    stage.innerHTML = getErrorMarkup(message);
  }

  function getAnswerCardMarkup(questionId, option, isSelected) {
    return [
      '<button',
        ' type="button"',
        ' class="wizard-answer-card', isSelected ? ' is-selected' : '', '"',
        ' data-question-id="', escapeAttr(questionId), '"',
        ' data-answer-value="', escapeAttr(option.value), '"',
      '>',
        '<span class="wizard-answer-label">', escapeHtml(option.label), '</span>',
        '<span class="wizard-answer-sub">', escapeHtml(option.sub), '</span>',
      '</button>'
    ].join('');
  }

  function getAddOnCardMarkup(item) {
    var actionLinks = [];

    if (item.videoUrl) {
      actionLinks.push(getActionLinkMarkup(item.videoUrl, 'Watch Video'));
    }
    if (item.websiteUrl) {
      actionLinks.push(getActionLinkMarkup(item.websiteUrl, 'View Website'));
    }
    if (item.detailUrl) {
      actionLinks.push(getActionLinkMarkup(item.detailUrl, 'View Detail'));
    }

    return [
      '<article class="wizard-addon-card">',
        '<div class="wizard-addon-meta">',
          '<span class="wizard-addon-vendor">', escapeHtml(item.vendor), '</span>',
          '<span class="wizard-addon-tier">', escapeHtml(item.minTier), '+</span>',
        '</div>',
        '<h4>', escapeHtml(item.name), '</h4>',
        '<p>', escapeHtml(item.positioning), '</p>',
        actionLinks.length
          ? '<div class="wizard-addon-actions">' + actionLinks.join('') + '</div>'
          : '',
      '</article>'
    ].join('');
  }

  function getActionLinkMarkup(url, label) {
    return [
      '<a class="wizard-addon-link" href="', escapeAttr(url), '" target="_blank" rel="noreferrer noopener">',
        escapeHtml(label),
      '</a>'
    ].join('');
  }

  function getBundledProductsForTier(finalIdx) {
    return data.softwareCatalog.filter(function (item) {
      return item.isBundled === true && data.recommendationRules.tierOrder.indexOf(item.minTier) <= finalIdx;
    });
  }

  function getEligibleOptionalAddOns(finalIdx) {
    return data.softwareCatalog.filter(function (item) {
      return item.isBundled === false && data.recommendationRules.tierOrder.indexOf(item.minTier) <= finalIdx;
    });
  }

  function groupAddOnsByDomain(items) {
    var domainOrder = ['doc', 'workflow', 'security', 'industry'];

    return domainOrder.map(function (domainId) {
      var groupItems = items.filter(function (item) {
        return item.domain === domainId;
      });

      if (!groupItems.length) return null;

      return {
        id: domainId,
        label: getDomainLabel(domainId),
        items: groupItems
      };
    }).filter(Boolean);
  }

  function getAddOnToggleMarkup(item) {
    var isSelected = state.selectedAddOns.indexOf(item.id) !== -1;

    return [
      '<button',
        ' type="button"',
        ' class="wiz-addon-toggle', isSelected ? ' is-selected' : '', '"',
        ' data-action="toggle-addon"',
        ' data-product-id="', escapeAttr(item.id), '"',
        ' aria-pressed="', isSelected ? 'true' : 'false', '"',
      '>',
        '<span class="wiz-addon-check-icon" aria-hidden="true">', isSelected ? '&#10003;' : '+', '</span>',
        '<strong class="wiz-addon-title">', escapeHtml(item.name), '</strong>',
        '<span class="wiz-addon-vendor">', escapeHtml(item.vendor), '</span>',
        '<p>', escapeHtml(item.positioning), '</p>',
      '</button>'
    ].join('');
  }

  function getDomainLabel(domainId) {
    var match = data.domains.filter(function (item) {
      return item.id === domainId;
    })[0];
    return match ? match.label : domainId;
  }

  function getQuestionById(questionId) {
    return data.wizardQuestions.filter(function (question) {
      return question.id === questionId;
    })[0] || null;
  }

  function getSelectedLabel(questionId, value) {
    var option = getSelectedOption(questionId, value);

    return option ? option.label : (value || 'None');
  }

  function getSelectedSubtext(questionId, value) {
    var option = getSelectedOption(questionId, value);

    return option ? option.sub : '';
  }

  function getSelectedOption(questionId, value) {
    var question = getQuestionById(questionId);

    if (!question || !Array.isArray(question.options)) return null;

    return question.options.filter(function (item) {
      return item.value === value;
    })[0] || null;
  }

  function getPainLabel(value) {
    var question = Array.isArray(data.wizardQuestions) ? data.wizardQuestions[2] : null;
    var option;
    if (!question || !Array.isArray(question.options)) return value || 'None';
    option = question.options.filter(function(item) { return item.value === value; })[0];
    return option ? option.label : (value || 'None');
  }

  function getProfileLabels() {
    return [
      getSelectedLabel('scale', state.answers.scale),
      (Array.isArray(state.answers.goal) ? state.answers.goal.map(function(v){ return getSelectedLabel('goal', v); }).join(', ') : getSelectedLabel('goal', state.answers.goal)),
      getPainLabel(state.answers.pain)
    ];
  }

  function getSelectionKey() {
    return [
      state.answers.scale || '',
      state.answers.goal || '',
      state.answers.pain || ''
    ].join('|');
  }

  function getDefaultSelectedAddOnIds(recommendation, activeFinalIdx) {
    var effectiveFinalIdx;

    if (!recommendation || !recommendation.domain) return [];

    effectiveFinalIdx = typeof activeFinalIdx === 'number' && activeFinalIdx >= 0
      ? activeFinalIdx
      : recommendation.finalIdx;

    var first = getEligibleOptionalAddOns(effectiveFinalIdx).filter(function (item) {
      return item.domain === recommendation.domain;
    })[0];
    return first ? [first.id] : [];
  }

  function ensureSelectedAddOns(recommendation, activeFinalIdx) {
    var selectionKey = getSelectionKey();

    if (state.selectedAddOnsKey === selectionKey) return;

    state.selectedAddOns = getDefaultSelectedAddOnIds(recommendation, activeFinalIdx);
    state.selectedAddOnsKey = selectionKey;
  }

  function getCatalogItemById(itemId) {
    return data.softwareCatalog.filter(function (item) {
      return item.id === itemId;
    })[0] || null;
  }

  function getSelectedAddOnItems() {
    return state.selectedAddOns.map(function (itemId) {
      return getCatalogItemById(itemId);
    }).filter(Boolean);
  }

  function getSelectedAddOnNames(emptyLabel) {
    var items = getSelectedAddOnItems();

    return items.length
      ? items.map(function (item) { return item.name; }).join(', ')
      : (emptyLabel || 'None');
  }

  function getBundledSoftwareSummary() {
    var bundleNames = getBundledProductsForTier(0).map(function (item) {
      return item.name;
    });

    return bundleNames.join(' + ');
  }

  function syncQuoteFormMarkup() {
    if (!quoteForm) return;

    quoteForm.innerHTML = getQuoteFormMarkup();
    quoteStatus = quoteModal && quoteModal.querySelector('[data-quote-status]');
  }

  function getQuoteFormMarkup() {
    return [
      '<div class="wiz-quote-row">',
        '<label class="wizard-quote-field">',
          '<span>Name *</span>',
          '<input type="text" name="name" autocomplete="name" required placeholder="Your full name" />',
        '</label>',
        '<label class="wizard-quote-field">',
          '<span>Work Email *</span>',
          '<input type="email" name="email" autocomplete="email" required placeholder="you@company.com" />',
        '</label>',
      '</div>',
      '<div class="wiz-quote-row">',
        '<label class="wizard-quote-field">',
          '<span>Company *</span>',
          '<input type="text" name="company" autocomplete="organization" required placeholder="Organisation name" />',
        '</label>',
        '<label class="wizard-quote-field">',
          '<span>Industry *</span>',
          '<select name="industry" required>',
            '<option value="" disabled selected>Select industry</option>',
            '<option value="finance">Finance &amp; Banking</option>',
            '<option value="healthcare">Healthcare &amp; Life Sciences</option>',
            '<option value="manufacturing">Manufacturing &amp; Energy</option>',
            '<option value="government">Government &amp; Public Sector</option>',
            '<option value="technology">Technology &amp; SaaS</option>',
            '<option value="retail">Retail &amp; E-Commerce</option>',
          '</select>',
        '</label>',
      '</div>',
      '<label class="wizard-quote-field">',
        '<span>Additional Requirements</span>',
        '<textarea name="message" rows="2" maxlength="500" placeholder="e.g. preferred brand, GPU model, VRAM, workload type, or deployment constraints."></textarea>',
      '</label>',
      '<input type="hidden" name="title" value="" />',
      '<input type="hidden" name="phone" value="" />',
      '<button type="submit" class="wizard-primary-button wiz-quote-submit">',
        'Send Enquiry →',
      '</button>',
      '<p class="wizard-quote-status" data-quote-status role="status"></p>'
    ].join('');
  }

  function openQuoteModal() {
    var scaleLabel;
    var goalLabel;
    var painLabel;
    var summaryRows;
    var summaryMarkup;
    var firstInput;

    if (!quoteModal || !quoteForm) return;

    scaleLabel = getSelectedLabel('scale', state.answers.scale);
    goalLabel = Array.isArray(state.answers.goal) ? state.answers.goal.map(function(v){ return getSelectedLabel('goal', v); }).join(', ') : getSelectedLabel('goal', state.answers.goal);
    painLabel  = getPainLabel(state.answers.pain);

    var summaryItems = [];
    if (scaleLabel) summaryItems.push(scaleLabel);
    if (Array.isArray(state.answers.goal) && state.answers.goal.length) {
      state.answers.goal.forEach(function (v) {
        var lbl = getSelectedLabel('goal', v);
        if (lbl) summaryItems.push(lbl);
      });
    } else if (goalLabel) {
      summaryItems.push(goalLabel);
    }
    if (painLabel) summaryItems.push(painLabel);
    summaryMarkup = summaryItems.map(function (val) {
      return '<span class="wiz-quote-tag">' + escapeHtml(val) + '</span>';
    }).join('');

    if (quoteSummary) quoteSummary.innerHTML = summaryMarkup;
    if (quoteSummaryMobile) quoteSummaryMobile.innerHTML = summaryMarkup;

    if (quoteStatus) {
      quoteStatus.textContent = '';
      quoteStatus.className = 'wizard-quote-status';
    }

    quoteModal.classList.add('is-open');
    document.body.classList.add('menu-open');
    document.body.classList.add('quote-modal-open');

    firstInput = quoteForm.querySelector('input[name="name"]');
    if (firstInput) {
      window.setTimeout(function () {
        firstInput.focus();
      }, 40);
    }
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    document.body.classList.remove('quote-modal-open');
  }

  function handleQuoteSubmit(event) {
    var formData;
    var subject;
    var bodyLines;
    var href;

    event.preventDefault();

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    formData = new FormData(quoteForm);
    subject = 'AISO Solution Enquiry';

    bodyLines = [
      '=== Requirements ===',
      'Organisation Scale: '   + (getSelectedLabel('scale', state.answers.scale) || 'Not specified'),
      'AI Objectives: ' + (Array.isArray(state.answers.goal) && state.answers.goal.length ? state.answers.goal.map(function(v){ return getSelectedLabel('goal', v); }).join(', ') : 'Not specified'),
      'Budget Range: '         + (getPainLabel(state.answers.pain)                || 'Not specified'),
      'Industry: '             + (formData.get('industry') || '—'),
      '',
      '=== Contact ===',
      'Name: '      + (formData.get('name')    || ''),
      'Company: '   + (formData.get('company') || ''),
      'Email: '     + (formData.get('email')   || ''),
      'Job Title: ' + (formData.get('title')   || '—'),
      'Phone: '     + (formData.get('phone')   || '—'),
      'Message: '   + (formData.get('message') || '—')
    ];

    href = 'mailto:contact@aisoportal.com?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(bodyLines.join('\n'));

    window.location.href = href;

    if (quoteStatus) {
      quoteStatus.textContent = 'Opening your email app… If nothing happens, email contact@aisoportal.com directly.';
      quoteStatus.className = 'wizard-quote-status is-visible';
    }

    window.setTimeout(closeQuoteModal, 2200);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function prefersReducedMotion() {
    return !!(motionQuery && motionQuery.matches);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function getBackIconMarkup() {
    return [
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">',
        '<path d="M16 10H4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
        '<path d="M9.6 4.7L4.3 10l5.3 5.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>'
    ].join('');
  }

  function getArrowIconMarkup() {
    return [
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">',
        '<path d="M4 10h11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
        '<path d="M10.2 3.8l5.3 5.3a1.5 1.5 0 010 1.9l-5.3 5.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>'
    ].join('');
  }
})();
