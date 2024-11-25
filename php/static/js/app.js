// static/lib/app.js

document.addEventListener("DOMContentLoaded", () => {
    // Load and apply theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    const body = document.body;
    const themeToggleButton = document.getElementById("themeToggleIcon");

    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        body.classList.remove("light-mode");
        themeToggleButton.classList.add("fa-moon");
        themeToggleButton.classList.remove("fa-sun");
    } else {
        body.classList.add("light-mode");
        body.classList.remove("dark-mode");
        themeToggleButton.classList.add("fa-sun");
        themeToggleButton.classList.remove("fa-moon");
    }

    // Add event listener for theme toggle
    themeToggleButton.addEventListener("click", toggleTheme);

    // Add event listener for hamburger menu
    const hamburgerIcon = document.getElementById("hamburgerIcon");
    const menuDropdown = document.getElementById("menuDropdown");

    hamburgerIcon.addEventListener("click", toggleMenu);

    // Close the menu if the user clicks outside of it
    document.addEventListener("click", (event) => {
        if (!menuDropdown.contains(event.target) && !hamburgerIcon.contains(event.target)) {
            menuDropdown.classList.remove("show");
        }
    });
});

function toggleTheme() {
    const themeToggleButton = document.getElementById("themeToggleIcon");
    const body = document.body;

    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        themeToggleButton.classList.remove("fa-moon");
        themeToggleButton.classList.add("fa-sun");
        localStorage.setItem("theme", "light"); // Save preference to localStorage
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        themeToggleButton.classList.remove("fa-sun");
        themeToggleButton.classList.add("fa-moon");
        localStorage.setItem("theme", "dark"); // Save preference to localStorage
    }
}

function toggleMenu() {
    const menuDropdown = document.getElementById("menuDropdown");
    menuDropdown.classList.toggle("show");
}
