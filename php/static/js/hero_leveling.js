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

    const currentLevelDecrease = document.getElementById("current_level_decrease");
    const currentLevelIncrease = document.getElementById("current_level_increase");
    const desiredLevelDecrease = document.getElementById("desired_level_decrease");
    const desiredLevelIncrease = document.getElementById("desired_level_increase");

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
            if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            }
            if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            }
        } else if (currentLevelLocked && !desiredLevelLocked) {
            if (source === "current" && currentLevel >= desiredLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            } else if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            }
        } else if (desiredLevelLocked && !currentLevelLocked) {
            if (source === "desired" && desiredLevel <= currentLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            } else if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            }
        } else {
            if (source === "current" && currentLevel >= desiredLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            }
            if (source === "desired" && desiredLevel <= currentLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            }
        }

        updateValues();
    }

    function fetchMeatRequired() {
        const currentLevel = parseInt(currentLevelSlider.value);
        const desiredLevel = parseInt(desiredLevelSlider.value);
    
        if (currentLevel >= desiredLevel) {
            resultContainer.innerHTML = `<p class="error">Invalid levels. Current level must be less than desired level.</p>`;
            return;
        }
    
        // Calculate total meat required using preloaded data
        let totalMeatRequired = 0;
        levelingData.forEach(entry => {
            if (entry.level > currentLevel && entry.level <= desiredLevel) {
                totalMeatRequired += parseInt(entry.meat_required, 10) || 0;
            }
        });
    
        // Ensure totalMeatRequired is properly calculated
        if (isNaN(totalMeatRequired)) {
            resultContainer.innerHTML = `<p class="error">Error calculating meat requirements.</p>`;
            return;
        }
    
        // Update the result container
        resultContainer.innerHTML = `
            <h2>
                ${totalMeatRequired.toLocaleString()}
                <img src="${iconPath}" alt="Meat Icon" class="meat-icon">
                required
            </h2>`;
    }
    
    
    

    function handleIncrementDecrement(input, slider, step) {
        const minValue = parseInt(input.min);
        const maxValue = parseInt(input.max);
        let currentValue = parseInt(input.value);

        if (currentValue + step >= minValue && currentValue + step <= maxValue) {
            input.value = currentValue + step;
            syncInputToSlider(input, slider);
        }
    }

    function enableHold(button, input, slider, step) {
        let timeoutId;
        let initialDelay = 300; // Delay before acceleration starts
        let delay = 100; // Initial delay after acceleration starts
        const minDelay = 10; // Minimum delay for maximum speed
        const accelerationFactor = 0.9; // Factor to reduce delay (lower = faster acceleration)
        let isHeld = false; // Tracks if the button is being held
    
        function performStep() {
            handleIncrementDecrement(input, slider, step);
    
            // Gradually decrease delay, but never go below minDelay
            delay = Math.max(minDelay, delay * accelerationFactor);
    
            // Schedule the next step
            timeoutId = setTimeout(performStep, delay);
        }
    
        button.addEventListener("mousedown", () => {
            isHeld = false;
            timeoutId = setTimeout(() => {
                isHeld = true;
                delay = 100; // Reset delay to the initial value for acceleration
                performStep(); // Start the acceleration
            }, initialDelay); // Delay before treating it as a hold
        });
    
        button.addEventListener("mouseup", () => {
            clearTimeout(timeoutId);
            if (!isHeld) {
                // Single click behavior
                handleIncrementDecrement(input, slider, step);
            }
        });
    
        button.addEventListener("mouseleave", () => clearTimeout(timeoutId));
    }
    
    

    enableHold(currentLevelDecrease, currentLevelNum, currentLevelSlider, -1);
    enableHold(currentLevelIncrease, currentLevelNum, currentLevelSlider, 1);
    enableHold(desiredLevelDecrease, desiredLevelNum, desiredLevelSlider, -1);
    enableHold(desiredLevelIncrease, desiredLevelNum, desiredLevelSlider, 1);

    function syncInputToSlider(input, slider) {
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            slider.value = value;

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

    enforceConstraints("current");
    fetchMeatRequired();
});
