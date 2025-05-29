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

    if (themeToggleBtn && themeToggleIcon) {
        themeToggleBtn.addEventListener("click", () => {
            const current = root.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
            localStorage.setItem("theme", next);
        });
    }

    if (hamburgerBtn && menuDropdown) {
        hamburgerBtn.addEventListener("click", () => {
            menuDropdown.classList.toggle("show");
        });

        document.addEventListener("click", (event) => {
            if (!hamburgerBtn.contains(event.target) && !menuDropdown.contains(event.target)) {
                menuDropdown.classList.remove("show");
            }
        });
    }

    function applyTheme(mode) {
        root.setAttribute("data-theme", mode);
        themeToggleIcon.className = mode === "dark" ? "fa fa-sun" : "fa fa-moon";
    }
});
