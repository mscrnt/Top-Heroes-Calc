// static/lib/app.js

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("themeToggle");
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  const hamburgerBtn = document.getElementById("hamburgerIcon");
  const menuDropdown = document.getElementById("menuDropdown");

  // 1. Log initial page load
  console.log("[Analytics] DOMContentLoaded – page is ready");
  if (window.MatomoHelper && typeof window.MatomoHelper.recordPageView === "function") {
    window.MatomoHelper.recordPageView(window.location.pathname);
    console.log(`[Matomo] Recorded page view for ${window.location.pathname}`);
  }
  if (window.LogRocket && typeof window.LogRocket.track === "function") {
    LogRocket.track("Page View", { path: window.location.pathname });
    console.log(`[LogRocket] Tracked page view: ${window.location.pathname}`);
  }

  // Load and apply theme
  const savedTheme = localStorage.getItem("theme") || "light";
  console.log(`[Analytics] Applying saved theme: ${savedTheme}`);
  applyTheme(savedTheme);

  // When user clicks the theme toggle:
  if (themeToggleBtn && themeToggleIcon) {
    themeToggleBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);

      console.log(`[Analytics] User toggled theme from ${current} → ${next}`);

      // Matomo: Category="Theme", Action="Toggle", Name=next
      if (
        window.MatomoHelper &&
        typeof window.MatomoHelper.recordThemeToggle === "function"
      ) {
        window.MatomoHelper.recordThemeToggle(next);
        console.log(`[Matomo] recordThemeToggle("${next}")`);
      }

      // LogRocket placeholder
      if (window.LogRocket && typeof window.LogRocket.track === "function") {
        LogRocket.track("Theme Toggle", { previous: current, current: next });
        console.log(`[LogRocket] Tracked Theme Toggle: from ${current} to ${next}`);
      }
    });
  }

  // When user opens/closes the hamburger menu:
  if (hamburgerBtn && menuDropdown) {
    hamburgerBtn.addEventListener("click", () => {
      const wasOpen = menuDropdown.classList.contains("show");
      const isOpening = !wasOpen;
      menuDropdown.classList.toggle("show");

      const action = isOpening ? "Open" : "Close";
      console.log(`[Analytics] Hamburger menu ${action}`);

      // Matomo: Category="Menu", Action="Open"/"Close", Name="hamburger"
      if (
        window.MatomoHelper &&
        typeof window.MatomoHelper.recordMenu === "function"
      ) {
        window.MatomoHelper.recordMenu(action);
        console.log(`[Matomo] recordMenu("${action}")`);
      }

      // LogRocket placeholder
      if (window.LogRocket && typeof window.LogRocket.track === "function") {
        LogRocket.track("Menu Toggle", { menu: "hamburger", action });
        console.log(`[LogRocket] Tracked Menu Toggle: ${action}`);
      }
    });

    document.addEventListener("click", (event) => {
      const clickInside =
        hamburgerBtn.contains(event.target) || menuDropdown.contains(event.target);
      if (!clickInside && menuDropdown.classList.contains("show")) {
        // Menu closes because click occurred outside
        menuDropdown.classList.remove("show");
        console.log("[Analytics] Hamburger menu Close (outside click)");

        if (
          window.MatomoHelper &&
          typeof window.MatomoHelper.recordMenu === "function"
        ) {
          window.MatomoHelper.recordMenu("Close");
          console.log(`[Matomo] recordMenu("Close")`);
        }
        if (window.LogRocket && typeof window.LogRocket.track === "function") {
          LogRocket.track("Menu Toggle", { menu: "hamburger", action: "Close" });
          console.log(`[LogRocket] Tracked Menu Toggle: Close`);
        }
      }
    });
  }

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    themeToggleIcon.className = mode === "dark" ? "fa fa-sun" : "fa fa-moon";
    console.log(`[Analytics] applyTheme("${mode}") → icon set to ${themeToggleIcon.className}`);
  }
});
