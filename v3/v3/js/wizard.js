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
  var domain = rules.goalToDomain ? rules.goalToDomain[answers.goal] : null;

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
      goal: null,
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
          newDomain = (data.recommendationRules.goalToDomain || {})[state.answers.goal] || null;
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
        goal: null,
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
  }

  function handleAnswerSelection(questionId, value) {
    if (state.isTransitioning || !questionId || !value) return;

    state.answers[questionId] = value;

    if (questionId === 'scale') {
      transitionTo(1, 'forward');
      return;
    }

    if (questionId === 'goal') {
      transitionTo(2, 'forward');
      return;
    }

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
    var tiers = window.AISO_V2_DATA.tiers;
    var cards = tiers.map(function (tier) {
      return [
        '<div class="sol-tier-card">',
        '  <div class="sol-tier-card-header">',
        '    <span class="sol-tier-name">' + escapeHtml(tier.tier) + '</span>',
        '    <span class="sol-tier-form">' + escapeHtml(tier.formFactor) + '</span>',
        '  </div>',
        '  <p class="sol-tier-tagline">' + escapeHtml(tier.tagline) + '</p>',
        '  <p class="sol-tier-desc">' + escapeHtml(tier.description) + '</p>',
        '  <p class="sol-tier-audience">' + escapeHtml(tier.audience) + '</p>',
        '  <ul class="sol-tier-scenarios">',
        tier.scenarios.slice(0, 3).map(function(s) { return '<li>' + escapeHtml(s) + '</li>'; }).join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }).join('');

    return [
      '<section class="wizard-screen wiz-browse">',
      '  <div class="wizard-screen-inner wizard-screen-shell-wide wiz-browse-inner">',
      '    <p class="wizard-kicker">Sovereign AI for Every Scale</p>',
      '    <h1 class="wizard-title wiz-browse-title">Find Your On-Premise AI Stack</h1>',
      '    <p class="wizard-copy-block wiz-browse-copy">Four tiers — from a solo workstation to a full data-centre rack. Every configuration runs entirely on-premise, zero cloud dependency.</p>',
      '    <div class="sol-tier-grid">' + cards + '</div>',
      '    <div class="wiz-browse-cta">',
      '      <p class="wiz-browse-hint">Answer 3 questions. Get a stack matched to your scale, use case, and deployment priorities.</p>',
      '      <button class="wizard-primary-button" data-action="start">Get My Recommendation →</button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function getQuestionMarkup(question) {
    var selectedValue = state.answers[question.id];
    var cardGridClasses = ['wizard-card-grid'];
    var currentStep = state.screen + 1;

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

  function getResultMarkup() {
    var recommendation = state.recommendation || resolveRecommendation(state.answers);
    var tiers = data.tiers || [];
    var tierOrder = (data.recommendationRules && data.recommendationRules.tierOrder) || ['personal', 'studio', 'sme', 'enterprise'];
    var activeTier;
    var activeFinalIdx;
    var bundleProducts;
    var eligibleAddOns;
    var groupedAddOns;
    var profileLabels = getProfileLabels();

    if (!recommendation || !recommendation.tier) {
      return getErrorMarkup('A recommendation could not be generated from the current answers.');
    }

    state.recommendation = recommendation;
    if (state.activeTierId === null) state.activeTierId = recommendation.tierId;

    activeTier = tiers.find(function (t) {
      return t.id === state.activeTierId;
    }) || recommendation.tier;
    activeFinalIdx = tierOrder.indexOf(state.activeTierId);
    if (activeFinalIdx < 0) activeFinalIdx = recommendation.finalIdx;

    bundleProducts = getBundledProductsForTier(activeFinalIdx);
    eligibleAddOns = (data.softwareCatalog || []).filter(function (s) {
      return !s.isBundled && tierOrder.indexOf(s.minTier) <= activeFinalIdx;
    });
    groupedAddOns = groupAddOnsByDomain(eligibleAddOns);
    ensureSelectedAddOns(recommendation, activeFinalIdx);

    return [
      '<section class="wizard-screen wizard-screen-result">',
        '<div class="wizard-screen-inner wizard-screen-shell wizard-screen-shell-wide">',
          '<div class="wizard-toolbar wizard-toolbar-result">',
            '<button type="button" class="wizard-back-button" data-action="back">',
              getBackIconMarkup(),
              '<span>Back</span>',
            '</button>',
            '<button type="button" class="wizard-reset-button" data-action="restart">Start Over</button>',
          '</div>',
          '<div class="wiz-result-column">',
            '<div class="wiz-tier-tabs">',
              tierOrder.map(function (tierId) {
                var tabTier = tiers.find(function (tierItem) {
                  return tierItem.id === tierId;
                });

                if (!tabTier) return '';

                return [
                  '<button type="button" class="wiz-tier-tab',
                    tabTier.id === state.activeTierId ? ' is-active' : '',
                    tabTier.id === recommendation.tierId ? ' is-recommended' : '',
                    '" data-action="switch-tier" data-tier-id="', escapeAttr(tabTier.id), '">',
                    '<span class="wiz-tier-tab-label">', escapeHtml(tabTier.tier), '</span>',
                    '<span class="wiz-tier-tab-form">', escapeHtml(tabTier.formFactor), '</span>',
                    tabTier.id === recommendation.tierId
                      ? '<span class="wiz-tier-recommended-badge">Recommended</span>'
                      : '',
                  '</button>'
                ].join('');
              }).join(''),
            '</div>',
            '<div class="wiz-reveal">',
              '<span class="wizard-panel-label">Your Recommended Stack</span>',
              '<h1 class="wiz-reveal-title">' + escapeHtml(activeTier.tier) + '<span class="wiz-reveal-title-form">' + escapeHtml(activeTier.formFactor) + '</span></h1>',
              '<p class="wiz-reveal-tagline">', escapeHtml(activeTier.tagline), '</p>',
              '<div class="wiz-context-chips">',
                profileLabels.map(function (label) {
                  return '<span class="wiz-context-chip">' + escapeHtml(label) + '</span>';
                }).join(''),
              '</div>',
            '</div>',
            '<div class="wiz-hw-bundle-row">',
              '<div class="wiz-info-card">',
                '<h2 class="wiz-info-title">Hardware</h2>',
                '<div class="wizard-pill-row">',
                  activeTier.platforms.map(function (platform) {
                    return '<span class="wizard-pill">' + escapeHtml(platform) + '</span>';
                  }).join(''),
                '</div>',
                '<p class="wiz-info-sub">', escapeHtml(activeTier.formFactor), '</p>',
              '</div>',
              '<div class="wiz-info-card">',
                '<h2 class="wiz-info-title">Bundled Core</h2>',
                '<p class="wiz-info-subtitle">Included with every hardware tier</p>',
                '<div class="wiz-bundle-list">',
                  bundleProducts.map(function (item) {
                    return [
                      '<div class="wiz-bundle-item">',
                        '<span class="wiz-bundle-check" aria-hidden="true">&#10003;</span>',
                        '<span>', escapeHtml(item.name), '</span>',
                      '</div>'
                    ].join('');
                  }).join(''),
                '</div>',
              '</div>',
            '</div>',
            '<section class="wiz-addon-section">',
              '<div class="wiz-section-head">',
                '<h2 class="wiz-section-title">Optional Add-ons</h2>',
                '<p class="wiz-section-sub">Select what interests you &#8212; we will include your choices in the enquiry.</p>',
              '</div>',
              groupedAddOns.length
                ? groupedAddOns.map(function (group) {
                    return [
                      '<div class="wiz-addon-group">',
                        '<div class="wiz-addon-group-label">', escapeHtml(group.label), '</div>',
                        '<div class="wiz-addon-grid-toggle">',
                          group.items.map(getAddOnToggleMarkup).join(''),
                        '</div>',
                      '</div>'
                    ].join('');
                  }).join('')
                : '<p class="wizard-empty-state">No optional add-ons are unlocked for this configuration yet.</p>',
            '</section>',
            '<div class="wiz-why-block">',
              '<h2 class="wiz-section-title">Why this fits</h2>',
              '<p>', escapeHtml(state.activeTierId === recommendation.tierId ? recommendation.whyFits : activeTier.description), '</p>',
            '</div>',
            '<div class="wiz-cta-row">',
              '<button type="button" class="wizard-primary-button" data-action="quote" data-tier-id="', escapeAttr(state.activeTierId), '">Request a Quote &rarr;</button>',
              '<a class="wizard-ghost-button" href="test.html#pipeline">Explore aiDAPTIV Architecture</a>',
            '</div>',
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
      getSelectedLabel('goal', state.answers.goal),
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
      '<label class="wizard-quote-field">',
        '<span>Name *</span>',
        '<input type="text" name="name" autocomplete="name" required placeholder="Your full name" />',
      '</label>',
      '<label class="wizard-quote-field">',
        '<span>Email *</span>',
        '<input type="email" name="email" autocomplete="email" required placeholder="work@company.com" />',
      '</label>',
      '<label class="wizard-quote-field">',
        '<span>Company *</span>',
        '<input type="text" name="company" autocomplete="organization" required placeholder="Organisation name" />',
      '</label>',
      '<label class="wizard-quote-field">',
        '<span>Industry *</span>',
        '<select name="industry" required>',
          '<option value="" disabled selected>Select your industry</option>',
          '<option value="finance">Finance &amp; Banking</option>',
          '<option value="healthcare">Healthcare &amp; Life Sciences</option>',
          '<option value="manufacturing">Manufacturing &amp; Energy</option>',
          '<option value="government">Government &amp; Public Sector</option>',
          '<option value="technology">Technology &amp; SaaS</option>',
          '<option value="retail">Retail &amp; E-Commerce</option>',
        '</select>',
      '</label>',
      '<label class="wizard-quote-field">',
        '<span>Job Title (optional)</span>',
        '<input type="text" name="title" autocomplete="organization-title" placeholder="e.g. CTO, IT Manager" />',
      '</label>',
      '<label class="wizard-quote-field">',
        '<span>Phone (optional)</span>',
        '<input type="tel" name="phone" autocomplete="tel" placeholder="+1 234 567 8900" />',
      '</label>',
      '<label class="wizard-quote-field wizard-quote-field-full">',
        '<span>Message</span>',
        '<textarea name="message" rows="3" placeholder="Deployment constraints, workloads, integration needs, or anything else we should know."></textarea>',
      '</label>',
      '<button type="submit" class="wizard-primary-button wizard-primary-button-full">',
        'Send Enquiry →',
      '</button>',
      '<p class="wizard-quote-status" data-quote-status role="status"></p>'
    ].join('');
  }

  function openQuoteModal() {
    var recommendation = state.recommendation || resolveRecommendation(state.answers);
    var tiers = data.tiers || [];
    var tierOrder = (data.recommendationRules && data.recommendationRules.tierOrder) || ['personal', 'studio', 'sme', 'enterprise'];
    var activeTier;
    var activeFinalIdx;
    var hardwareTier;
    var scaleLabel;
    var scaleSubtext;
    var goalLabel;
    var summaryRows;
    var summaryMarkup;
    var firstInput;

    if (!quoteModal || !quoteForm || !recommendation || !recommendation.tier) return;

    state.recommendation = recommendation;
    if (state.activeTierId === null) state.activeTierId = recommendation.tierId;
    activeTier = tiers.find(function (tier) {
      return tier.id === state.activeTierId;
    }) || recommendation.tier;
    activeFinalIdx = tierOrder.indexOf(state.activeTierId);
    if (activeFinalIdx < 0) activeFinalIdx = recommendation.finalIdx;

    ensureSelectedAddOns(recommendation, activeFinalIdx);
    hardwareTier = activeTier.tier + ' \u2014 ' + activeTier.formFactor;
    scaleLabel = getSelectedLabel('scale', state.answers.scale);
    scaleSubtext = getSelectedSubtext('scale', state.answers.scale);
    goalLabel = getSelectedLabel('goal', state.answers.goal);
    summaryRows = [
      { label: 'Hardware Tier', value: hardwareTier },
      { label: 'Organisation Scale', value: scaleLabel },
      { label: 'Planned Users', value: scaleSubtext || 'Not specified' },
      { label: 'AI Objective', value: goalLabel },
      { label: 'AI Priority', value: getPainLabel(state.answers.pain) },
      { label: 'Platforms', value: activeTier.platforms.join(' / ') },
      { label: 'Bundled Software', value: 'Orient AI + Otterscale' },
      { label: 'Selected Add-ons', value: getSelectedAddOnNames('None selected'), full: true }
    ];

    if (state.activeTierId !== recommendation.tierId) {
      summaryRows.push({
        note: 'Note: Recommended tier was ' + recommendation.tier.tier + ' \u2014 ' + recommendation.tier.formFactor,
        full: true
      });
    }

    summaryMarkup = summaryRows.map(function (row) {
      if (row.note) {
        return [
          '<div class="wizard-quote-summary-row wizard-quote-summary-row-full">',
          '<strong>', escapeHtml(row.note), '</strong>',
          '</div>'
        ].join('');
      }

      return [
        '<div class="wizard-quote-summary-row', row.full ? ' wizard-quote-summary-row-full' : '', '">',
        '<span>', escapeHtml(row.label), '</span>',
        '<strong>', escapeHtml(row.value), '</strong>',
        '</div>'
      ].join('');
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
    var recommendation = state.recommendation || resolveRecommendation(state.answers);
    var tiers = data.tiers || [];
    var tierOrder = (data.recommendationRules && data.recommendationRules.tierOrder) || ['personal', 'studio', 'sme', 'enterprise'];
    var activeTier;
    var activeFinalIdx;
    var subject;
    var bodyLines;
    var addOnNames;
    var scaleLabel;
    var scaleSubtext;
    var goalLabel;
    var href;

    event.preventDefault();

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    if (!recommendation || !recommendation.tier) return;

    if (state.activeTierId === null) state.activeTierId = recommendation.tierId;
    activeTier = tiers.find(function (tier) {
      return tier.id === state.activeTierId;
    }) || recommendation.tier;
    activeFinalIdx = tierOrder.indexOf(state.activeTierId);
    if (activeFinalIdx < 0) activeFinalIdx = recommendation.finalIdx;

    ensureSelectedAddOns(recommendation, activeFinalIdx);
    formData = new FormData(quoteForm);
    addOnNames = getSelectedAddOnNames('None');
    scaleLabel = getSelectedLabel('scale', state.answers.scale);
    scaleSubtext = getSelectedSubtext('scale', state.answers.scale);
    goalLabel = getSelectedLabel('goal', state.answers.goal);
    subject = 'AISO Stack Enquiry \u2014 ' + activeTier.tier;

    bodyLines = [
      '=== Configuration ===',
      'Hardware Tier: ' + activeTier.tier + ' \u2014 ' + activeTier.formFactor,
      'Organisation Scale: ' + scaleLabel,
      'Planned Users: ' + (scaleSubtext || 'Not specified'),
      'AI Objective: ' + goalLabel,
      'AI Priority: ' + getPainLabel(state.answers.pain),
      'Industry: ' + (formData.get('industry') || '—'),
      'Platforms: ' + activeTier.platforms.join(' / '),
      'Bundled Software: Orient AI + Otterscale',
      'Selected Add-ons: ' + addOnNames
    ];

    if (state.activeTierId !== recommendation.tierId) {
      bodyLines.push(
        'Note: Recommended tier was ' + recommendation.tier.tier + ' \u2014 ' + recommendation.tier.formFactor
      );
    }

    bodyLines = bodyLines.concat([
      '',
      '=== Contact ===',
      'Name: ' + (formData.get('name') || ''),
      'Company: ' + (formData.get('company') || ''),
      'Email: ' + (formData.get('email') || ''),
      'Job Title: ' + (formData.get('title') || '\u2014'),
      'Phone: ' + (formData.get('phone') || '\u2014'),
      'Message: ' + (formData.get('message') || '\u2014')
    ]);

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
