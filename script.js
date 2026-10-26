document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Initialize icons
  if (window.lucide) window.lucide.createIcons();

  // Navbar scroll effect
  const navbar = $("#navbar");

  const updateNavbar = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 12);
  };

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  // Light and dark theme
  const themeToggle = $("#themeToggle");
  const storedTheme = localStorage.getItem("smk-portfolio-theme");

  if (storedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  const refreshThemeIcon = () => {
    if (!themeToggle || !window.lucide) return;

    themeToggle.innerHTML = document.body.classList.contains("light-mode")
      ? '<i data-lucide="moon"></i>'
      : '<i data-lucide="sun"></i>';

    window.lucide.createIcons();
  };

  refreshThemeIcon();

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    localStorage.setItem(
      "smk-portfolio-theme",
      document.body.classList.contains("light-mode") ? "light" : "dark"
    );

    refreshThemeIcon();
    pulse(themeToggle);
  });

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");

  const closeMenu = () => {
    mobileNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");

    if (menuToggle) {
      menuToggle.setAttribute("aria-label", "Open navigation");
    }

    if (menuToggle && window.lucide) {
      menuToggle.innerHTML = '<i data-lucide="menu"></i>';
      window.lucide.createIcons();
    }
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = mobileNav?.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );

    menuToggle.innerHTML = isOpen
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';

    if (window.lucide) window.lucide.createIcons();

    pulse(menuToggle);
  });

  $$("#mobileNav a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  // Subtle light that follows the mouse
  const glow = $(".pointer-glow");

  if (glow && window.matchMedia("(pointer:fine)").matches) {
    document.body.classList.add("pointer-active");

    window.addEventListener("pointermove", event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Mouse-follow lighting on buttons
  $$(".button, .nav-resume").forEach(el => {
    el.addEventListener("pointermove", event => {
      const rect = el.getBoundingClientRect();

      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });

    el.addEventListener("click", () => pulse(el));
  });

  // Re-playable click feedback
  function pulse(el) {
    if (!el) return;

    el.classList.remove("clicked");

    // Reflow lets the animation replay on consecutive clicks.
    void el.offsetWidth;

    el.classList.add("clicked");

    window.setTimeout(() => {
      el.classList.remove("clicked");
    }, 450);
  }

  // Restrained 3D movement for the photo card
  // and other elements marked tilt-card.
  const canTilt =
    window.matchMedia("(pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canTilt) {
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        const strength = card.classList.contains("portrait-frame") ? 5 : 3;

        card.style.transform =
          `perspective(1000px)
           rotateX(${-y * strength}deg)
           rotateY(${x * strength}deg)
           translateY(-2px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Scroll-reveal animation.
  // Content remains visible if JavaScript or the observer is unavailable.
  const revealItems = $$(".reveal");

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealItems.forEach(item => item.classList.add("will-reveal"));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -25px 0px"
    });

    revealItems.forEach(item => observer.observe(item));
  }

  // Highlight the current navigation section
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-links a");

  const updateActiveLink = () => {
    let current = "home";

    for (const section of sections) {
      if (window.scrollY >= section.offsetTop - 180) {
        current = section.id;
      }
    }

    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });
  };

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  // Smooth scrolling for internal links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = $(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  });

  // Automatically update the copyright year
  const year = $("#currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Secure external links
  $$('a[target="_blank"]').forEach(link => {
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Show a helpful fallback if the profile photo path is incorrect
  const portrait = $(".profile-image");

  portrait?.addEventListener("error", () => {
    portrait.style.display = "none";

    const wrap = $(".portrait-image-wrap");

    if (wrap && !$(".portrait-fallback", wrap)) {
      const fallback = document.createElement("div");

      fallback.className = "portrait-fallback";

      fallback.innerHTML =
        "<span>SMK</span><small>Place your photo at<br>assets/images/shreevatsa.png</small>";

      wrap.appendChild(fallback);
    }
  });

  // Keyboard feedback for buttons and resume links
  $$(".button, .nav-resume").forEach(el => {
    el.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        el.classList.add("clicked");
      }
    });

    el.addEventListener("keyup", () => {
      el.classList.remove("clicked");
    });

    el.addEventListener("blur", () => {
      el.classList.remove("clicked");
    });
  });
});