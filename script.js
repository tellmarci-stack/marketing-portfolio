// Main portfolio interactions:
// - Mobile navigation toggle
// - Smooth scrolling for section links
// - Active nav state while scrolling
// - Subtle reveal animations
// - Portrait fallback if the image file is missing or removed

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const revealItems = document.querySelectorAll("[data-reveal]");
const portraitCard = document.querySelector(".portrait-card");
const portraitImage = document.querySelector(".portrait-image");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
}

function openMenu() {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "true");
  siteNav.classList.add("is-open");
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!siteNav || !navToggle) {
    return;
  }

  const clickedInsideNav = siteNav.contains(event.target);
  const clickedToggle = navToggle.contains(event.target);

  if (!clickedInsideNav && !clickedToggle) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    history.replaceState(null, "", targetId);
    closeMenu();
  });
});

function updateHeaderState() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const activeId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === activeId;
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0.01
  }
);

navLinks.forEach((link) => {
  const targetId = link.getAttribute("href");
  const section = targetId ? document.querySelector(targetId) : null;

  if (section) {
    sectionObserver.observe(section);
  }
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px"
  }
);

const initiallyVisibleItems = new Set();

revealItems.forEach((item) => {
  const isAboveFold = item.getBoundingClientRect().top < window.innerHeight * 0.9;

  if (prefersReducedMotion) {
    item.classList.add("is-visible");
    initiallyVisibleItems.add(item);
    return;
  }

  if (isAboveFold) {
    item.classList.add("is-visible");
    initiallyVisibleItems.add(item);
    return;
  }
});

if (!prefersReducedMotion) {
  document.body.classList.add("js-animate");
}

revealItems.forEach((item) => {
  if (prefersReducedMotion || initiallyVisibleItems.has(item)) {
    return;
  }

  revealObserver.observe(item);
});

function showPortraitFallback() {
  if (portraitCard) {
    portraitCard.classList.add("image-missing");
  }
}

if (portraitImage) {
  portraitImage.addEventListener("error", showPortraitFallback);

  if (portraitImage.complete && portraitImage.naturalWidth === 0) {
    showPortraitFallback();
  }
}
