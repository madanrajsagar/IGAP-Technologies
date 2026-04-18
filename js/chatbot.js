document.addEventListener("DOMContentLoaded", () => {
  initChatbot();
});

function initChatbot() {
  if (document.querySelector("[data-chatbot-root]")) {
    return;
  }

  const root = document.createElement("div");
  root.className = "chatbot-shell";
  root.setAttribute("data-chatbot-root", "");
  root.innerHTML = `
    <button class="chatbot-toggle" type="button" aria-expanded="false" aria-controls="igap-chatbot-panel">
      <span class="chatbot-toggle-copy">
        <small>iGAP Assistant</small>
        <strong>Need project guidance?</strong>
      </span>
      <span class="chatbot-status-dot" aria-hidden="true"></span>
    </button>
    <section class="chatbot-panel" id="igap-chatbot-panel" aria-label="iGAP Assistant" aria-hidden="true">
      <header class="chatbot-head">
        <div class="chatbot-head-copy">
          <strong>iGAP Assistant</strong>
          <p>Ask about services, academy programs, industries, projects, or contact details.</p>
        </div>
        <button class="chatbot-close" type="button" aria-label="Close assistant">×</button>
      </header>
      <div class="chatbot-body">
        <div class="chatbot-messages" aria-live="polite" aria-label="Assistant conversation"></div>
        <div class="chatbot-suggestions" aria-label="Suggested prompts"></div>
      </div>
      <form class="chatbot-form">
        <input type="text" name="chat" placeholder="Ask a quick question..." autocomplete="off">
        <button class="btn btn-primary btn-small" type="submit">Send</button>
      </form>
    </section>
  `;

  document.body.appendChild(root);

  const toggle = root.querySelector(".chatbot-toggle");
  const closeButton = root.querySelector(".chatbot-close");
  const panel = root.querySelector(".chatbot-panel");
  const messages = root.querySelector(".chatbot-messages");
  const suggestions = root.querySelector(".chatbot-suggestions");
  const form = root.querySelector(".chatbot-form");
  const input = root.querySelector('input[name="chat"]');

  const suggestedPrompts = [
    "What services does iGAP provide?",
    "Tell me about iGAP Academy.",
    "Which industries does iGAP serve?",
    "How can I contact iGAP?"
  ];

  const knowledgeBase = [
    {
      test: /\b(hello|hi|hey)\b|\bgood (morning|evening)\b/,
      answer: {
        text: "Hello. I can help you quickly navigate iGAP Technologies. Ask about services, academy programs, industries, project experience, or contact details.",
        links: [
          { label: "Home", href: "index.html" },
          { label: "Services", href: "services.html" }
        ]
      }
    },
    {
      test: /\b(service|services|erp|software|machine learning|data science|web apps?|mobile apps?|e-?commerce)\b|\b(ai|ml)\b/,
      answer: {
        text: "iGAP's core service areas are Custom ERP, AI & Machine Learning, Data Science, Web Applications, Mobile Applications, and E-Commerce systems. The work is focused on operational clarity, reporting, and business-specific workflows rather than generic software builds.",
        links: [
          { label: "View services", href: "services.html" },
          { label: "Start a project", href: "contact.html" }
        ]
      }
    },
    {
      test: /\b(academy|course|courses|training|internship|internships|java|\.net|dot net|artificial intelligence)\b/,
      answer: {
        text: "iGAP Academy offers Java Full Stack, .NET Full Stack, Data Science, and Artificial Intelligence programs. The model is project-based and is designed to improve internship readiness through practical implementation and mentor feedback.",
        links: [
          { label: "Explore academy", href: "academy.html" },
          { label: "Ask about enrollment", href: "contact.html" }
        ]
      }
    },
    {
      test: /\b(portfolio|project|projects|case study|case studies|client|clients|delivery|deliveries|work done|experience)\b/,
      answer: {
        text: "iGAP has delivered software across healthcare, steel trading, FMCG, education, and commerce use cases. The portfolio includes hospital systems, trading ERPs, e-commerce ecosystems, and institutional platforms built around real operational needs.",
        links: [
          { label: "See portfolio", href: "portfolio.html" },
          { label: "Read testimonials", href: "testimonials.html" }
        ]
      }
    },
    {
      test: /\b(industries|industry|healthcare|steel|fmcg|education|edugov)\b/,
      answer: {
        text: "iGAP serves Healthcare, Steel Trading, FMCG, and EduGov or Education-focused organizations. Each solution is adjusted for industry-specific workflows like records, billing, dispatch, order flows, public access, or reporting.",
        links: [
          { label: "Industries page", href: "industries.html" },
          { label: "Project examples", href: "portfolio.html" }
        ]
      }
    },
    {
      test: /\b(about|company|team|mission|vision|years)\b/,
      answer: {
        text: "iGAP Technologies is a Kolhapur-based premium software company with 10+ years of experience and 50+ enterprise projects. The company combines enterprise delivery with academy-led talent development.",
        links: [
          { label: "About iGAP", href: "about.html" },
          { label: "Services", href: "services.html" }
        ]
      }
    },
    {
      test: /\b(contact|call|phone|email|address|location|reach)\b/,
      answer: {
        text: "You can contact iGAP at info@igaptechnologies.com or +91 9561320192. The office address is F-2, Shree Apartment, Rajarampuri 4th lane, Kolhapur - 416008.",
        links: [
          { label: "Contact page", href: "contact.html" },
          { label: "Email iGAP", href: "mailto:info@igaptechnologies.com" }
        ]
      }
    },
    {
      test: /\b(price|pricing|cost|budget|estimate|quotation|quote)\b/,
      answer: {
        text: "iGAP's pricing depends on scope, integrations, workflow complexity, and delivery timeline. The best next step is a short discovery conversation so the team can understand the requirement before estimating.",
        links: [
          { label: "Request a discussion", href: "contact.html" },
          { label: "Review services", href: "services.html" }
        ]
      }
    }
  ];

  const getDefaultAnswer = () => ({
    text: "I can help with services, academy programs, industries, projects, contact details, or the company overview. Try one of the quick prompts below if you want a faster route.",
    links: [
      { label: "Services", href: "services.html" },
      { label: "Academy", href: "academy.html" },
      { label: "Contact", href: "contact.html" }
    ]
  });

  const renderLinks = (links) => {
    if (!links || !links.length) {
      return "";
    }

    const linkMarkup = links
      .map((link) => `<a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a>`)
      .join("");

    return `<div class="chatbot-links">${linkMarkup}</div>`;
  };

  const addMessage = (role, text, links = []) => {
    const item = document.createElement("article");
    item.className = `chatbot-message chatbot-message--${role}`;
    item.innerHTML = `
      <div class="chatbot-bubble">
        <p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>
        ${role === "assistant" ? renderLinks(links) : ""}
      </div>
    `;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  };

  const showTyping = () => {
    const item = document.createElement("article");
    item.className = "chatbot-message chatbot-message--assistant chatbot-typing";
    item.setAttribute("data-chatbot-typing", "");
    item.innerHTML = `
      <div class="chatbot-bubble" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  };

  const hideTyping = () => {
    messages.querySelector("[data-chatbot-typing]")?.remove();
  };

  const renderSuggestions = () => {
    suggestions.innerHTML = suggestedPrompts
      .map(
        (prompt) => `
          <button class="chatbot-suggestion" type="button" data-chatbot-prompt="${escapeAttribute(prompt)}">
            ${escapeHtml(prompt)}
          </button>
        `
      )
      .join("");
  };

  const getAnswer = (question) => {
    const normalized = question.toLowerCase();
    const match = knowledgeBase.find((entry) => entry.test.test(normalized));
    return match ? match.answer : getDefaultAnswer();
  };

  const openChatbot = () => {
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    window.setTimeout(() => input.focus(), 120);
  };

  const closeChatbot = () => {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  const submitPrompt = (prompt) => {
    const cleaned = prompt.trim();
    if (!cleaned) {
      return;
    }

    openChatbot();
    addMessage("user", cleaned);
    input.value = "";
    showTyping();

    const answer = getAnswer(cleaned);
    window.setTimeout(() => {
      hideTyping();
      addMessage("assistant", answer.text, answer.links);
    }, 420);
  };

  toggle.addEventListener("click", () => {
    if (root.classList.contains("is-open")) {
      closeChatbot();
      return;
    }
    openChatbot();
  });

  closeButton.addEventListener("click", closeChatbot);

  document.addEventListener("click", (event) => {
    if (!root.classList.contains("is-open")) {
      return;
    }

    if (!root.contains(event.target)) {
      closeChatbot();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      closeChatbot();
    }
  });

  suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chatbot-prompt]");
    if (!button) {
      return;
    }
    submitPrompt(button.dataset.chatbotPrompt || "");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPrompt(input.value);
  });

  renderSuggestions();
  addMessage(
    "assistant",
    "Hello. I am the iGAP Assistant. Ask me about software services, academy programs, industry expertise, delivery experience, or how to get in touch.",
    [
      { label: "Services", href: "services.html" },
      { label: "Academy", href: "academy.html" }
    ]
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
