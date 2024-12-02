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
        currentLevelLock.classList.toggle("locked");
        console.log(`Current level lock state: ${currentLevelLocked}`);
    });

    desiredLevelLock.addEventListener("click", function () {
        desiredLevelLocked = !desiredLevelLocked;
        desiredLevelLock.classList.toggle("fa-lock", desiredLevelLocked);
        desiredLevelLock.classList.toggle("fa-lock-open", !desiredLevelLocked);
        desiredLevelLock.classList.toggle("locked");
        console.log(`Desired level lock state: ${desiredLevelLocked}`);
    });

    function updateValues() {
        currentLevelNum.value = currentLevelSlider.value;
        desiredLevelNum.value = desiredLevelSlider.value;
    }

    function enforceConstraints(source) {
        let currentLevel = parseInt(currentLevelSlider.value);
        let desiredLevel = parseInt(desiredLevelSlider.value);
    
        if (currentLevelLocked && desiredLevelLocked) {
            // Both sliders locked: sliders can't move each other beyond constraints
            if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            }
            if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            }
        } else if (currentLevelLocked && !desiredLevelLocked) {
            // Current level locked: desired level adjusts if needed
            if (source === "current" && currentLevel >= desiredLevel) {
                desiredLevelSlider.value = currentLevel + 1; // Push desired level up
            } else if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1; // Stop desired level at valid point
            }
        } else if (desiredLevelLocked && !currentLevelLocked) {
            // Desired level locked: current level adjusts if needed
            if (source === "desired" && desiredLevel <= currentLevel) {
                currentLevelSlider.value = desiredLevel - 1; // Pull current level down
            } else if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1; // Stop current level at valid point
            }
        } else {
            // Both sliders unlocked: sliders can push each other
            if (source === "current" && currentLevel >= desiredLevel) {
                desiredLevelSlider.value = currentLevel + 1; // Push desired level up
            }
            if (source === "desired" && desiredLevel <= currentLevel) {
                currentLevelSlider.value = desiredLevel - 1; // Pull current level down
            }
        }
    
        // Update the displayed values
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
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultContainer.innerHTML = `<p class="error">${data.error}</p>`;
                } else {
                    resultContainer.innerHTML = `
                        <h2>
                            ${data.total_meat_required.toLocaleString()}
                            <img src="${data.icon_path}" alt="Meat Icon" class="meat-icon">
                            required
                        </h2>`;
                }
            })
            .catch(error => {
                console.error("Error fetching meat data:", error);
                resultContainer.innerHTML = `<p class="error">Error fetching meat data.</p>`;
            });
    }
    

    // Sync input box changes to sliders
    function syncInputToSlider(input, slider) {
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            slider.value = value;

            // Adjust the other slider if constraints are violated
            if (slider === currentLevelSlider) {
                enforceConstraints("current");
            } else if (slider === desiredLevelSlider) {
                enforceConstraints("desired");
            }

            fetchMeatRequired();
        }
    }

    function handleEnterKey(input, slider, event) {
        if (event.key === "Enter") {
            syncInputToSlider(input, slider);
        }
    }

    // Event listeners
    currentLevelSlider.addEventListener("input", () => {
        updateValues();
    });
    
    currentLevelSlider.addEventListener("change", () => {
        enforceConstraints("current");
        fetchMeatRequired();
    });
    
    desiredLevelSlider.addEventListener("input", () => {
        updateValues();
    });
    
    desiredLevelSlider.addEventListener("change", () => {
        enforceConstraints("desired");
        fetchMeatRequired();
    });
    

    currentLevelNum.addEventListener("blur", () => syncInputToSlider(currentLevelNum, currentLevelSlider));
    currentLevelNum.addEventListener("keydown", (event) => handleEnterKey(currentLevelNum, currentLevelSlider, event));

    desiredLevelNum.addEventListener("blur", () => syncInputToSlider(desiredLevelNum, desiredLevelSlider));
    desiredLevelNum.addEventListener("keydown", (event) => handleEnterKey(desiredLevelNum, desiredLevelSlider, event));

    currentLevelMin.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.min;
        enforceConstraints("current");
        fetchMeatRequired();
    });

    currentLevelMax.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.max;
        enforceConstraints("current");
        fetchMeatRequired();
    });

    desiredLevelMin.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.min;
        enforceConstraints("desired");
        fetchMeatRequired();
    });

    desiredLevelMax.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.max;
        enforceConstraints("desired");
        fetchMeatRequired();
    });

    // Initialize on page load
    enforceConstraints("current");
    fetchMeatRequired();
});
