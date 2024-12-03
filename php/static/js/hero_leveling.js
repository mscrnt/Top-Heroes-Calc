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

    const currentLevelNotice = document.getElementById("current_level_notice");
    const desiredLevelNotice = document.getElementById("desired_level_notice");

    const resultContainer = document.getElementById("result");

    let currentLevelLocked = false;
    let desiredLevelLocked = false;

    // Dynamically position the notice below the slider container
    function adjustNoticePosition(notice, container) {
        const containerRect = container.getBoundingClientRect();
        notice.style.position = "absolute";
        notice.style.top = `${containerRect.bottom + window.scrollY}px`; // 5px below the container
        notice.style.left = `${containerRect.left + window.scrollX}px`;
        notice.style.width = `${containerRect.width}px`;
    }

    // Update positions of notices dynamically
    function updateNoticePositions() {
        adjustNoticePosition(currentLevelNotice, currentLevelSlider.closest(".slider-container"));
        adjustNoticePosition(desiredLevelNotice, desiredLevelSlider.closest(".slider-container"));
    }


    // Load stored values or set defaults
    function loadStoredValues() {
        const storedCurrentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;
        const storedDesiredLevel = parseInt(localStorage.getItem("desiredLevel")) || maxLevel;
        currentLevelLocked = localStorage.getItem("currentLevelLocked") === "true";
        desiredLevelLocked = localStorage.getItem("desiredLevelLocked") === "true";

        currentLevelSlider.value = storedCurrentLevel;
        desiredLevelSlider.value = storedDesiredLevel;
        currentLevelNum.value = storedCurrentLevel;
        desiredLevelNum.value = storedDesiredLevel;

        updateLockState(currentLevelLock, currentLevelLocked);
        updateLockState(desiredLevelLock, desiredLevelLocked);
    }

    // Save values to local storage
    function saveValues() {
        localStorage.setItem("currentLevel", currentLevelSlider.value);
        localStorage.setItem("desiredLevel", desiredLevelSlider.value);
        localStorage.setItem("currentLevelLocked", currentLevelLocked);
        localStorage.setItem("desiredLevelLocked", desiredLevelLocked);
    }

    // Update the lock icon and class
    function updateLockState(lockElement, isLocked) {
        lockElement.classList.toggle("fa-lock", isLocked);
        lockElement.classList.toggle("fa-lock-open", !isLocked);
        lockElement.classList.toggle("locked", isLocked);
    }

    // Update lock states and save to local storage
    currentLevelLock.addEventListener("click", function () {
        currentLevelLocked = !currentLevelLocked;
        updateLockState(currentLevelLock, currentLevelLocked);
        saveValues();
    });

    desiredLevelLock.addEventListener("click", function () {
        desiredLevelLocked = !desiredLevelLocked;
        updateLockState(desiredLevelLock, desiredLevelLocked);
        saveValues();
    });

    // Update values and enforce constraints
    function updateValues() {
        currentLevelNum.value = currentLevelSlider.value;
        desiredLevelNum.value = desiredLevelSlider.value;
        saveValues();
    }

    function enforceConstraints(source) {
        let currentLevel = parseInt(currentLevelSlider.value);
        let desiredLevel = parseInt(desiredLevelSlider.value);

        // Trigger pulse for a given element
        function triggerGlow(element) {
            if (!element.classList.contains("pulse")) {
                element.classList.add("pulse");
                setTimeout(() => element.classList.remove("pulse"), 3000); // Remove pulse after 1 second
            }
        }

        if (currentLevelLocked && desiredLevelLocked) {
            if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1;
                triggerGlow(desiredLevelLock);
                triggerGlow(currentLevelNotice); // Show notice for current level
            }
            if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1;
                triggerGlow(currentLevelLock);
                triggerGlow(desiredLevelNotice); // Show notice for desired level
            }
        } else if (currentLevelLocked && !desiredLevelLocked) {
            if (source === "current" && currentLevel >= desiredLevel) {
                desiredLevelSlider.value = currentLevel + 1;
            } else if (source === "desired" && desiredLevel <= currentLevel) {
                desiredLevelSlider.value = currentLevel + 1;
                triggerGlow(currentLevelLock);
                triggerGlow(desiredLevelNotice); // Show notice for current level
            }
        } else if (desiredLevelLocked && !currentLevelLocked) {
            if (source === "desired" && desiredLevel <= currentLevel) {
                currentLevelSlider.value = desiredLevel - 1;
            } else if (source === "current" && currentLevel >= desiredLevel) {
                currentLevelSlider.value = desiredLevel - 1;
                triggerGlow(desiredLevelLock);
                triggerGlow(currentLevelNotice); // Show notice for desired level
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

    // Calculate and display the meat required
    function fetchMeatRequired() {
        const currentLevel = parseInt(currentLevelSlider.value);
        const desiredLevel = parseInt(desiredLevelSlider.value);

        if (currentLevel >= desiredLevel) {
            resultContainer.innerHTML = `<p class="error">Invalid levels. Current level must be less than desired level.</p>`;
            return;
        }

        let totalMeatRequired = 0;
        levelingData.forEach(entry => {
            if (entry.level > currentLevel && entry.level <= desiredLevel) {
                totalMeatRequired += parseInt(entry.meat_required, 10) || 0;
            }
        });
    
        if (isNaN(totalMeatRequired)) {
            resultContainer.innerHTML = `<p class="error">Error calculating meat requirements.</p>`;
            return;
        }
    
        resultContainer.innerHTML = `
            <h2>
                ${totalMeatRequired.toLocaleString()}
                <img src="${iconPath}" alt="Meat Icon" class="meat-icon">
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
        const minDelay = 5; // Minimum delay for maximum speed
        const accelerationFactor = 0.9; // Factor to reduce delay (lower = faster acceleration)
        let isHeld = false; // Tracks if the button is being held
        let isMouseDown = false; // Tracks if the mouse is down (to avoid hover issues)
    
        function performStep() {
            handleIncrementDecrement(input, slider, step);
    
            // Gradually decrease delay, but never go below minDelay
            delay = Math.max(minDelay, delay * accelerationFactor);
    
            // Schedule the next step
            timeoutId = setTimeout(performStep, delay);
        }
    
        function startHold() {
            isHeld = false;
            isMouseDown = true;
            timeoutId = setTimeout(() => {
                if (isMouseDown) {
                    isHeld = true;
                    delay = 100; // Reset delay to the initial value for acceleration
                    performStep(); // Start the acceleration
                }
            }, initialDelay); // Delay before treating it as a hold
        }
    
        function endHold() {
            isMouseDown = false;
            clearTimeout(timeoutId);
            if (!isHeld) {
                // Single click behavior
                handleIncrementDecrement(input, slider, step);
            }
        }
    
        // Mouse and touch event bindings
        button.addEventListener("mousedown", startHold);
        button.addEventListener("mouseup", endHold);
    
        // Prevent mouse hover issues by tracking mouse state
        button.addEventListener("mouseleave", () => {
            if (isMouseDown) {
                endHold();
            }
        });
    
        button.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent long-press menu
            startHold();
        });
        button.addEventListener("touchend", endHold);
        button.addEventListener("touchcancel", endHold);
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

    // Adjust notice positions on DOM load and resize
    updateNoticePositions();
    window.addEventListener("resize", updateNoticePositions);

    loadStoredValues();
    enforceConstraints("current");
    fetchMeatRequired();
});
