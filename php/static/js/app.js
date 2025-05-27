// static/lib/app.js

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const themeToggleBtn = document.getElementById("themeToggle");
    const themeToggleIcon = document.getElementById("themeToggleIcon");
    const hamburgerBtn = document.getElementById("hamburgerIcon");
    const menuDropdown = document.getElementById("menuDropdown");

    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Handle theme toggle
    if (themeToggleBtn && themeToggleIcon) {
        themeToggleBtn.addEventListener("click", () => {
            const isDark = body.classList.contains("dark-mode");
            const newTheme = isDark ? "light" : "dark";
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    // Handle hamburger menu toggle
    if (hamburgerBtn && menuDropdown) {
        hamburgerBtn.addEventListener("click", () => {
            menuDropdown.classList.toggle("show");
        });

        // Close if clicked outside
        document.addEventListener("click", (event) => {
            const isClickInsideMenu = menuDropdown.contains(event.target);
            const isClickOnHamburger = hamburgerBtn.contains(event.target);
            if (!isClickInsideMenu && !isClickOnHamburger) {
                menuDropdown.classList.remove("show");
            }
        });
    }

    function setTheme(mode) {
        if (mode === "dark") {
            body.classList.add("dark-mode");
            body.classList.remove("light-mode");
            themeToggleIcon.classList.add("fa-moon");
            themeToggleIcon.classList.remove("fa-sun");
        } else {
            body.classList.add("light-mode");
            body.classList.remove("dark-mode");
            themeToggleIcon.classList.add("fa-sun");
            themeToggleIcon.classList.remove("fa-moon");
        }
    }
});
