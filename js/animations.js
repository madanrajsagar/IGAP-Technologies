document.addEventListener("DOMContentLoaded", () => {
  const animated = document.querySelectorAll("[data-animate], [data-stagger]");

  if (!animated.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    animated.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 90}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  animated.forEach((element) => observer.observe(element));
});
