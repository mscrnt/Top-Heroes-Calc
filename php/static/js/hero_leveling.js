document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const resourceName = "Meat";

    const currentLevelSlider = document.getElementById("current_level");
    const desiredLevelSlider = document.getElementById("desired_level");

    const currentLevelNum = document.getElementById("current_level_num");
    const desiredLevelNum = document.getElementById("desired_level_num");

    const currentLevelLock = document.getElementById("current_level_lock");
    const desiredLevelLock = document.getElementById("desired_level_lock");

    const currentLevelMin = document.getElementById("current_level_min");
    const currentLevelMax = document.getElementById("current_level_max");
    const desiredLevelMin = document.getElementById("desired_level_min");
    const desiredLevelMax = document.getElementById("desired_level_max");

    const resultContainer = document.getElementById("result");

    let currentLevelLocked = false;
    let desiredLevelLocked = false;

    // Toggle lock states
    currentLevelLock.addEventListener("click", function () {
        currentLevelLocked = !currentLevelLocked;
        currentLevelLock.classList.toggle("fa-lock", currentLevelLocked);
        currentLevelLock.classList.toggle("fa-lock-open", !currentLevelLocked);
        console.log(`Current level lock state: ${currentLevelLocked}`);
    });

    desiredLevelLock.addEventListener("click", function () {
        desiredLevelLocked = !desiredLevelLocked;
        desiredLevelLock.classList.toggle("fa-lock", desiredLevelLocked);
        desiredLevelLock.classList.toggle("fa-lock-open", !desiredLevelLocked);
        console.log(`Desired level lock state: ${desiredLevelLocked}`);
    });

    function updateValues() {
        currentLevelNum.value = currentLevelSlider.value;
        desiredLevelNum.value = desiredLevelSlider.value;
    }

    function enforceConstraints() {
        let currentLevel = parseInt(currentLevelSlider.value);
        let desiredLevel = parseInt(desiredLevelSlider.value);

        if (currentLevelLocked && desiredLevelLocked) {
            // Both sliders locked: revert to previous valid values
            currentLevelSlider.value = currentLevelSlider.getAttribute("data-prev-value") || currentLevel;
            desiredLevelSlider.value = desiredLevelSlider.getAttribute("data-prev-value") || desiredLevel;
        } else if (!currentLevelLocked && currentLevel >= desiredLevel) {
            // Current level adjusts if unlocked
            currentLevelSlider.value = desiredLevel - 1;
        } else if (!desiredLevelLocked && desiredLevel <= currentLevel) {
            // Desired level adjusts if unlocked
            desiredLevelSlider.value = currentLevel + 1;
        }

        // Save valid state
        currentLevelSlider.setAttribute("data-prev-value", currentLevelSlider.value);
        desiredLevelSlider.setAttribute("data-prev-value", desiredLevelSlider.value);

        updateValues();
    }

    function fetchMeatRequired() {
        const currentLevel = parseInt(currentLevelSlider.value);
        const desiredLevel = parseInt(desiredLevelSlider.value);

        if (currentLevel >= desiredLevel) {
            resultContainer.innerHTML = `<p class="error">Invalid levels. Current level must be less than desired level.</p>`;
            return;
        }

        const url = `../pages/get_meat_required.php?current_level=${currentLevel}&desired_level=${desiredLevel}&resource_name=${resourceName}`;
        console.log(`Fetching data from URL: ${url}`);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultContainer.innerHTML = `<p class="error">${data.error}</p>`;
                } else {
                    resultContainer.innerHTML = `<h2>Total Meat Required: ${data.total_meat_required.toLocaleString()} Meat</h2>`;
                }
            })
            .catch(error => {
                console.error("Error fetching meat data:", error);
                resultContainer.innerHTML = `<p class="error">Error fetching meat data.</p>`;
            });
    }

    function syncInputToSlider(input, slider) {
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            slider.value = value;
            enforceConstraints();
            fetchMeatRequired();
        }
    }

    function handleEnterKey(input, slider, event) {
        if (event.key === "Enter") {
            syncInputToSlider(input, slider);
        }
    }

    currentLevelSlider.addEventListener("input", () => {
        enforceConstraints();
        fetchMeatRequired();
    });

    desiredLevelSlider.addEventListener("input", () => {
        enforceConstraints();
        fetchMeatRequired();
    });

    currentLevelNum.addEventListener("blur", () => syncInputToSlider(currentLevelNum, currentLevelSlider));
    currentLevelNum.addEventListener("keydown", (event) => handleEnterKey(currentLevelNum, currentLevelSlider, event));

    desiredLevelNum.addEventListener("blur", () => syncInputToSlider(desiredLevelNum, desiredLevelSlider));
    desiredLevelNum.addEventListener("keydown", (event) => handleEnterKey(desiredLevelNum, desiredLevelSlider, event));

    currentLevelMin.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.min;
        enforceConstraints();
        fetchMeatRequired();
    });

    currentLevelMax.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.max;
        if (!desiredLevelLocked) {
            desiredLevelSlider.value = parseInt(currentLevelSlider.value) + 1;
        }
        enforceConstraints();
        fetchMeatRequired();
    });

    desiredLevelMin.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.min;
        if (!currentLevelLocked) {
            currentLevelSlider.value = parseInt(desiredLevelSlider.value) - 1;
        }
        enforceConstraints();
        fetchMeatRequired();
    });

    desiredLevelMax.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.max;
        enforceConstraints();
        fetchMeatRequired();
    });

    // Initialize on page load
    enforceConstraints();
    fetchMeatRequired();
});
