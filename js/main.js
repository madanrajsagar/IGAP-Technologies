document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initActivePage();
  initSmoothScroll();
  initStackShowcase();
  initPortfolioFilter();
  initTestimonialCarousel();
});

function initNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!header || !toggle || !nav) {
    return;
  }

  const closeNav = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    header.classList.toggle("is-open", !expanded);
    toggle.setAttribute("aria-expanded", String(!expanded));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initActivePage() {
  const current = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function initSmoothScroll() {
  const header = document.querySelector(".site-header");

  const scrollToHash = (hash) => {
    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    const offset = header ? header.offsetHeight + 12 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      const samePage =
        url.pathname === window.location.pathname &&
        url.origin === window.location.origin;

      if (!samePage || !url.hash) {
        return;
      }

      const target = document.querySelector(url.hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      window.history.replaceState({}, "", url.hash);
      scrollToHash(url.hash);
    });
  });

  if (window.location.hash) {
    window.setTimeout(() => {
      scrollToHash(window.location.hash);
    }, 120);
  }
}

function initStackShowcase() {
  const showcase = document.querySelector("[data-stack-showcase]");

  if (!showcase) {
    return;
  }

  const chips = Array.from(showcase.querySelectorAll(".stack-chip"));
  const titleTarget = showcase.querySelector('[data-stack-target="title"]');
  const textTarget = showcase.querySelector('[data-stack-target="text"]');

  const activateChip = (chip) => {
    chips.forEach((item) => item.classList.toggle("is-active", item === chip));

    if (titleTarget) {
      titleTarget.textContent = chip.dataset.stackTitle || chip.textContent.trim();
    }

    if (textTarget) {
      textTarget.textContent = chip.dataset.stackText || "";
    }
  };

  chips.forEach((chip) => {
    ["mouseenter", "focus", "click"].forEach((eventName) => {
      chip.addEventListener(eventName, () => activateChip(chip));
    });
  });

  if (chips[0]) {
    activateChip(chips.find((chip) => chip.classList.contains("is-active")) || chips[0]);
  }
}

function initPortfolioFilter() {
  const filterGroup = document.querySelector("[data-filter-group]");
  const cards = Array.from(document.querySelectorAll("[data-project-card]"));

  if (!filterGroup || !cards.length) {
    return;
  }

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) {
      return;
    }

    const filter = button.dataset.filter;
    filterGroup
      .querySelectorAll("[data-filter]")
      .forEach((item) => item.classList.toggle("is-active", item === button));

    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const visible = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !visible);
    });
  });
}

function initTestimonialCarousel() {
  const carousel = document.querySelector("[data-testimonial-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll(".testimonial-slide"));
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");

  if (!slides.length) {
    return;
  }

  let activeIndex = 0;
  let timerId = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.hidden = !isActive;
      slide.classList.toggle("is-active", isActive);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-selected", String(dotIndex === activeIndex));
    });
  };

  const start = () => {
    stop();
    timerId = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 6000);
  };

  const stop = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  prev?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
  });

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex);
    });
  });

  ["mouseenter", "focusin"].forEach((eventName) => {
    carousel.addEventListener(eventName, stop);
  });

  ["mouseleave", "focusout"].forEach((eventName) => {
    carousel.addEventListener(eventName, start);
  });

  showSlide(0);
  start();
}
