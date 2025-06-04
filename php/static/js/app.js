// static/lib/app.js

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById("themeToggle");
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  const hamburgerBtn = document.getElementById("hamburgerIcon");
  const menuDropdown = document.getElementById("menuDropdown");

  // Load and apply theme
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  // When user clicks the theme toggle:
  if (themeToggleBtn && themeToggleIcon) {
    themeToggleBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);

      // Record a Matomo event: Category="Theme", Action="Toggle", Name=next
      if (
        window.MatomoHelper &&
        typeof window.MatomoHelper.recordThemeToggle === "function"
      ) {
        window.MatomoHelper.recordThemeToggle(next);
      }
    });
  }

  // When user opens/closes the hamburger menu:
  if (hamburgerBtn && menuDropdown) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpening = !menuDropdown.classList.contains("show");
      menuDropdown.classList.toggle("show");

      // Record a Matomo event: Category="Menu", Action="Open"/"Close", Name="hamburger"
      if (
        window.MatomoHelper &&
        typeof window.MatomoHelper.recordMenu === "function"
      ) {
        window.MatomoHelper.recordMenu(isOpening ? "Open" : "Close");
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !hamburgerBtn.contains(event.target) &&
        !menuDropdown.contains(event.target) &&
        menuDropdown.classList.contains("show")
      ) {
        // Menu closes because click occurred outside the menu
        menuDropdown.classList.remove("show");
        if (
          window.MatomoHelper &&
          typeof window.MatomoHelper.recordMenu === "function"
        ) {
          window.MatomoHelper.recordMenu("Close");
        }
      }
    });
  }

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    themeToggleIcon.className = mode === "dark" ? "fa fa-sun" : "fa fa-moon";
  }
});
