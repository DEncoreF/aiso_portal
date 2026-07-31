/* ======================================================================
   AISO Portal — Quote UI
   Shared "Request a Quote" modal used by hardware / software / combo pages.
   Was duplicated inline in hardware.html and software.html; extracted here so
   the four call sites stay in sync.

   Public API:
     AISOQuoteUI.ensureStyles()
     AISOQuoteUI.escapeHtml(value)
     AISOQuoteUI.openModal({
       title, subtitle, summaryTitle,
       summaryBlocks: [{ label, html }],   // shown in the left panel
       messagePlaceholder,
       email,                              // mailto recipient
       subjectPrefix                       // mailto subject prefix
     })

   Submitting composes a mailto: with the form fields and the summary blocks —
   each page keeps its own recipient via config.email.
   ====================================================================== */
(function () {
  if (window.AISOQuoteUI) return;

  const STYLE_ID = "aiso-quote-ui-styles";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .software-card.is-selected,
      .product-card.is-selected {
        border-color: rgba(20, 46, 123, 0.26) !important;
        box-shadow: 0 18px 42px rgba(20, 46, 123, 0.18) !important;
        transform: translateY(-4px);
      }

      .action-secondary,
      .action-primary.selection-toggle,
      .product-cta.selection-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 18px;
        border-radius: 14px;
        font-size: 0.84rem;
        font-weight: 700;
        border: 1px solid transparent;
      }

      .action-secondary {
        background: rgba(20, 46, 123, 0.08);
        color: #1d2e7b;
        border-color: rgba(20, 46, 123, 0.12);
      }

      .action-secondary.is-muted {
        color: #6d7695;
      }

      .action-message {
        display: grid;
        gap: 8px;
      }

      .action-helper {
        margin: 0;
        color: #6d7695;
        font-size: 0.8rem;
        line-height: 1.5;
      }

      .action-primary.selection-toggle,
      .product-cta.selection-toggle {
        cursor: pointer;
      }

      .action-primary.selection-toggle.is-selected,
      .product-cta.selection-toggle.is-selected {
        background: linear-gradient(135deg, #23367f, #5160a9);
        box-shadow: 0 14px 28px rgba(20, 46, 123, 0.22);
      }

      .quote-summary-shell {
        width: min(1180px, calc(100vw - 48px));
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 130;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .quote-summary-card {
        width: 100%;
        padding: 20px 20px 18px;
        border-radius: 22px;
        background: rgba(44, 56, 112, 0.7);
        backdrop-filter: blur(20px) saturate(150%);
        -webkit-backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 22px 46px rgba(8, 15, 38, 0.28);
        color: #f4f6ff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0;
      }

      .quote-summary-eyebrow {
        color: rgba(236, 240, 255, 0.85);
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .quote-summary-blocks {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .quote-summary-block {
        padding: 12px 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.24);
      }

      .quote-summary-label {
        display: block;
        margin-bottom: 6px;
        color: rgba(236, 240, 255, 0.8);
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .quote-summary-value {
        display: block;
        color: #ffffff;
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1.55;
      }

      .quote-summary-empty {
        color: rgba(240, 243, 255, 0.78);
        font-weight: 600;
      }

      .quote-summary-note {
        margin: 0;
        color: rgba(240, 243, 255, 0.9);
        font-size: 0.8rem;
        line-height: 1.55;
      }

      .quote-summary-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .quote-summary-card > .quote-summary-eyebrow,
      .quote-summary-card > .quote-summary-blocks,
      .quote-summary-card > .quote-summary-footer {
        margin: 0;
      }

      .quote-summary-button,
      .quote-summary-mobile-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        border: 0;
        border-radius: 16px;
        background: linear-gradient(135deg, #0f173a, #1d2e7b);
        color: #ffffff;
        font-size: 0.94rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 16px 30px rgba(20, 46, 123, 0.24);
      }

      .quote-summary-button {
        width: auto;
        min-width: 214px;
        padding: 0 24px;
        flex-shrink: 0;
      }

      .quote-summary-button[disabled],
      .quote-summary-mobile-button[disabled] {
        background: rgba(255, 255, 255, 0.22);
        color: rgba(255, 255, 255, 0.62);
        box-shadow: none;
        cursor: not-allowed;
      }

      .quote-summary-mobilebar {
        display: none;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 140;
        width: 100vw;
        max-width: 100vw;
        box-sizing: border-box;
      }

      .quote-summary-mobilebar-inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 14px;
        align-items: center;
      }

      .quote-summary-mobile-copy strong {
        display: block;
        color: #ffffff;
        font-size: 0.92rem;
        font-weight: 800;
      }

      .quote-summary-mobile-copy span {
        display: block;
        margin-top: 2px;
        color: rgba(240, 243, 255, 0.85);
        font-size: 0.77rem;
        line-height: 1.45;
      }

      .quote-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 180;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(7, 11, 29, 0.72);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.24s ease;
      }

      .quote-modal-backdrop.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .quote-modal-panel {
        width: min(1200px, 100%);
        max-height: min(92vh, 980px);
        overflow: auto;
        scrollbar-width: none;
        border-radius: 30px;
        background: linear-gradient(180deg, #11182f 0%, #171d36 100%);
        border: 1px solid rgba(121, 141, 227, 0.18);
        box-shadow: 0 34px 80px rgba(6, 11, 28, 0.5);
        position: relative;
      }

      .quote-modal-close {
        position: absolute;
        top: 18px;
        right: 18px;
        width: 54px;
        height: 54px;
        border: 1px solid rgba(121, 141, 227, 0.24);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(237, 241, 255, 0.9);
        font-size: 1.9rem;
        line-height: 1;
        cursor: pointer;
      }

      .quote-modal-layout {
        display: grid;
        grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
      }

      .quote-modal-summary {
        padding: 56px 34px 34px;
        border-right: 1px solid rgba(121, 141, 227, 0.14);
        display: grid;
        align-content: start;
        gap: 16px;
      }

      .quote-modal-summary-title {
        color: rgba(167, 180, 235, 0.78);
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .quote-modal-summary .quote-summary-blocks {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .quote-modal-summary .quote-summary-block {
        background: rgba(255, 255, 255, 0.03);
      }

      .quote-modal-content {
        padding: 56px 54px 46px;
        color: #ffffff;
      }

      .quote-modal-title {
        font-size: clamp(2.25rem, 4vw, 4rem);
        font-weight: 900;
        line-height: 1.04;
        letter-spacing: -0.04em;
      }

      .quote-modal-subtitle {
        margin-top: 10px;
        color: rgba(196, 204, 236, 0.82);
        font-size: 1.1rem;
        line-height: 1.6;
      }

      .quote-modal-form {
        margin-top: 42px;
      }

      .quote-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 26px 24px;
      }

      .quote-field,
      .quote-field-full {
        display: grid;
        gap: 10px;
      }

      .quote-field-full {
        grid-column: 1 / -1;
      }

      .quote-field label,
      .quote-field-full label {
        color: #ffffff;
        font-size: 0.96rem;
        font-weight: 800;
      }

      .quote-field input,
      .quote-field select,
      .quote-field-full textarea {
        width: 100%;
        min-height: 60px;
        padding: 0 18px;
        border-radius: 18px;
        border: 1px solid rgba(121, 141, 227, 0.2);
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        font: inherit;
      }

      .quote-field-full textarea {
        min-height: 168px;
        padding-top: 16px;
        padding-bottom: 16px;
        resize: vertical;
      }

      .quote-field input::placeholder,
      .quote-field-full textarea::placeholder {
        color: rgba(196, 204, 236, 0.4);
      }

      .quote-modal-submit {
        margin-top: 36px;
        width: 100%;
        min-height: 66px;
        border: 0;
        border-radius: 22px;
        background: linear-gradient(135deg, #5665ab, #6a78bc);
        color: #ffffff;
        font-size: 1.06rem;
        font-weight: 800;
        cursor: pointer;
      }

      .quote-modal-success {
        margin-top: 42px;
        padding: 28px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(121, 141, 227, 0.16);
      }

      .quote-modal-success h3 {
        margin: 0 0 10px;
        font-size: 1.6rem;
        font-weight: 800;
      }

      .quote-modal-success p {
        margin: 0;
        color: rgba(196, 204, 236, 0.84);
        line-height: 1.65;
      }

      .quote-modal-success a {
        color: inherit;
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .quote-modal-success .quote-modal-submit {
        margin-top: 24px;
      }

      @media (max-width: 1200px) {
        .quote-summary-shell {
          width: min(1120px, calc(100vw - 32px));
        }

        .quote-summary-blocks {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .quote-summary-footer {
          flex-direction: column;
          align-items: stretch;
        }

        .quote-summary-button {
          width: 100%;
          min-width: 0;
        }

        body.quote-summary-active.quote-summary-expanded {
          padding-bottom: 280px !important;
        }
      }

      body.quote-summary-active {
        padding-bottom: 140px;
      }

      body.quote-summary-active .help-bubble {
        bottom: 110px;
      }

      @media (max-width: 900px) {
        .quote-summary-shell {
          width: calc(100% - 32px);
          left: 16px;
          right: 16px;
          transform: none;
          margin-top: 0;
        }

        .quote-summary-card {
          display: none;
        }

        .quote-summary-mobilebar {
          display: block;
          width: 100%;
          padding: 14px 16px;
          border-radius: 20px 20px 0 0;
          background: rgba(44, 56, 112, 0.76);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 22px 46px rgba(8, 15, 38, 0.34);
        }

        body.quote-summary-active .help-bubble {
          bottom: 108px;
        }

        .quote-summary-mobile-button {
          width: auto;
          min-width: 158px;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 14px;
        }

        .quote-modal-panel {
          border-radius: 24px;
        }

        .quote-modal-layout {
          grid-template-columns: 1fr;
        }

        .quote-modal-summary {
          border-right: 0;
          border-bottom: 1px solid rgba(121, 141, 227, 0.14);
          padding: 48px 24px 22px;
        }

        .quote-modal-content {
          padding: 32px 24px 28px;
        }

        .quote-modal-grid {
          grid-template-columns: 1fr;
        }

        body.quote-summary-active {
          padding-bottom: 120px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const DEFAULT_EMAIL = "contact@aisoportal.com";

  // Summary blocks carry HTML for the panel; the mail body needs plain text.
  // Parsing through a detached node decodes every entity (&times;, &amp;, …)
  // instead of hand-listing a few.
  function htmlToText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = String(html).replace(/<br\s*\/?>/gi, " / ");
    return (holder.textContent || "").replace(/\s+/g, " ").trim();
  }

  // A temporary anchor rather than window.location.href: handing the page over
  // to a mailto: can strand embedded/in-app browsers on a blank document.
  function openMailto(href) {
    const link = document.createElement("a");
    link.href = href;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(function () { link.remove(); }, 0);
  }

  function buildMailto(config, form) {
    const data = new FormData(form);
    const recipient = config.email || DEFAULT_EMAIL;
    const company = String(data.get("company") || "").trim();
    const subject = (config.subjectPrefix || "[AISO Quote]") + (company ? " — " + company : "");

    const lines = [
      "— Contact —",
      "Name: " + (data.get("name") || ""),
      "Email: " + (data.get("email") || ""),
      "Company: " + (company || "—"),
      "Industry: " + (data.get("industry") || ""),
      "Job Title: " + (String(data.get("jobTitle") || "").trim() || "—"),
      "Phone: " + (String(data.get("phone") || "").trim() || "—")
    ];

    const blocks = config.summaryBlocks || [];
    if (blocks.length) {
      lines.push("", "— " + (config.summaryTitle || "Configuration") + " —");
      blocks.forEach(function (block) {
        lines.push(htmlToText(block.label) + ": " + htmlToText(block.html));
      });
    }

    lines.push("", "— Additional Requirements —",
      String(data.get("message") || "").trim() || "(none provided)");

    return {
      recipient: recipient,
      href: "mailto:" + recipient +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"))
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSummaryBlocks(summaryBlocks) {
    return summaryBlocks.map(function (block) {
      return `
        <div class="quote-summary-block">
          <span class="quote-summary-label">${escapeHtml(block.label)}</span>
          <span class="quote-summary-value">${block.html}</span>
        </div>
      `;
    }).join("");
  }

  function openModal(config) {
    ensureStyles();

    const existing = document.querySelector(".quote-modal-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "quote-modal-backdrop";
    backdrop.innerHTML = `
      <div class="quote-modal-panel" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
        <button class="quote-modal-close" type="button" aria-label="Close quote form">&times;</button>
        <div class="quote-modal-layout">
          <aside class="quote-modal-summary">
            <div class="quote-modal-summary-title">${escapeHtml(config.summaryTitle || "Your Configuration")}</div>
            <div class="quote-summary-blocks">
              ${renderSummaryBlocks(config.summaryBlocks || [])}
            </div>
          </aside>
          <section class="quote-modal-content">
            <h2 class="quote-modal-title" id="quote-modal-title">${escapeHtml(config.title || "Request a Quote")}</h2>
            <p class="quote-modal-subtitle">${escapeHtml(config.subtitle || "We'll get back to you within 2-3 business days.")}</p>
            <form class="quote-modal-form" novalidate>
              <div class="quote-modal-grid">
                <div class="quote-field">
                  <label for="quote-name">Name *</label>
                  <input id="quote-name" name="name" type="text" placeholder="Your full name" required>
                </div>
                <div class="quote-field">
                  <label for="quote-email">Email *</label>
                  <input id="quote-email" name="email" type="email" placeholder="work@company.com" required>
                </div>
                <div class="quote-field">
                  <label for="quote-company">Company *</label>
                  <input id="quote-company" name="company" type="text" placeholder="Organisation name" required>
                </div>
                <div class="quote-field">
                  <label for="quote-industry">Industry *</label>
                  <select id="quote-industry" name="industry" required>
                    <option value="">Select your industry</option>
                    <option>Banking & Finance</option>
                    <option>Healthcare</option>
                    <option>Manufacturing</option>
                    <option>Retail & E-commerce</option>
                    <option>Government & Public Sector</option>
                    <option>IT & Telecommunications</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="quote-field">
                  <label for="quote-job-title">Job Title (optional)</label>
                  <input id="quote-job-title" name="jobTitle" type="text" placeholder="e.g. CTO, IT Manager">
                </div>
                <div class="quote-field">
                  <label for="quote-phone">Phone (optional)</label>
                  <input id="quote-phone" name="phone" type="tel" placeholder="+886 900 000 000">
                </div>
                <div class="quote-field-full">
                  <label for="quote-message">Additional Requirements</label>
                  <textarea id="quote-message" name="message" maxlength="500" placeholder="${escapeHtml(config.messagePlaceholder || "e.g. preferred brand, GPU model, VRAM, workload type, or deployment constraints.")}"></textarea>
                </div>
              </div>
              <button class="quote-modal-submit" type="submit">Send Enquiry &rarr;</button>
            </form>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(function () {
      backdrop.classList.add("is-open");
    });

    function closeModal() {
      backdrop.classList.remove("is-open");
      setTimeout(function () {
        backdrop.remove();
        document.removeEventListener("keydown", onKeyDown);
      }, 240);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") closeModal();
    }

    document.addEventListener("keydown", onKeyDown);

    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeModal();
    });

    backdrop.querySelector(".quote-modal-close").addEventListener("click", closeModal);

    const form = backdrop.querySelector(".quote-modal-form");
    const content = backdrop.querySelector(".quote-modal-content");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const mail = buildMailto(config, form);
      openMailto(mail.href);

      content.innerHTML = `
        <h2 class="quote-modal-title">Enquiry Ready to Send</h2>
        <p class="quote-modal-subtitle">Opening your email app with everything filled in.</p>
        <div class="quote-modal-success">
          <h3>Almost there</h3>
          <p>Your details and the selected configuration are in the draft — just hit send. If nothing opened, email us at <a href="mailto:${escapeHtml(mail.recipient)}">${escapeHtml(mail.recipient)}</a>.</p>
          <button class="quote-modal-submit" type="button" data-close-quote>Close</button>
        </div>
      `;
      content.querySelector("[data-close-quote]").addEventListener("click", closeModal);
    });
  }

  window.AISOQuoteUI = {
    ensureStyles: ensureStyles,
    escapeHtml: escapeHtml,
    openModal: openModal
  };
})();
