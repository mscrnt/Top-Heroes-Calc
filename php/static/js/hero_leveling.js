document.addEventListener("DOMContentLoaded", function () {
    console.log("[Analytics] Page ready");

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

    const resultContainer = document.getElementById("meat-result");

    let currentLevelLocked = false;
    let desiredLevelLocked = false;

    // Position notices once on load and on resize/scroll
    function adjustNoticePosition(notice, container) {
        const rect = container.getBoundingClientRect();
        notice.style.position = "absolute";
        notice.style.top = `${rect.bottom + window.scrollY}px`;
        notice.style.left = `${rect.left + window.scrollX}px`;
        notice.style.width = `${rect.width}px`;
    }

    function updateNoticePositions() {
        adjustNoticePosition(
            currentLevelNotice,
            currentLevelSlider.closest(".slider-container")
        );
        adjustNoticePosition(
            desiredLevelNotice,
            desiredLevelSlider.closest(".slider-container")
        );
    }

    // Load stored values or defaults
    function loadStoredValues() {
        const storedCurrent = parseInt(localStorage.getItem("currentLevel")) || 1;
        const storedDesired = parseInt(localStorage.getItem("desiredLevel")) || maxLevel;
        currentLevelLocked = localStorage.getItem("currentLevelLocked") === "true";
        desiredLevelLocked = localStorage.getItem("desiredLevelLocked") === "true";

        currentLevelSlider.value = storedCurrent;
        desiredLevelSlider.value = storedDesired;
        currentLevelNum.value = storedCurrent;
        desiredLevelNum.value = storedDesired;

        updateLockState(currentLevelLock, currentLevelLocked);
        updateLockState(desiredLevelLock, desiredLevelLocked);

        console.log(
            `[Analytics] Loaded levels: current=${storedCurrent} (locked=${currentLevelLocked}), desired=${storedDesired} (locked=${desiredLevelLocked})`
        );
    }

    // Save values to localStorage
    function saveValues() {
        localStorage.setItem("currentLevel", currentLevelSlider.value);
        localStorage.setItem("desiredLevel", desiredLevelSlider.value);
        localStorage.setItem("currentLevelLocked", currentLevelLocked);
        localStorage.setItem("desiredLevelLocked", desiredLevelLocked);
    }

    // Update lock icon
    function updateLockState(lockElem, isLocked) {
        lockElem.classList.toggle("fa-lock", isLocked);
        lockElem.classList.toggle("fa-lock-open", !isLocked);
        lockElem.classList.toggle("locked", isLocked);
    }

    currentLevelLock.addEventListener("click", function () {
        currentLevelLocked = !currentLevelLocked;
        updateLockState(currentLevelLock, currentLevelLocked);
        saveValues();
        console.log(
            `[Analytics] currentLevelLock toggled → now ${
                currentLevelLocked ? "locked" : "unlocked"
            }`
        );
    });

    desiredLevelLock.addEventListener("click", function () {
        desiredLevelLocked = !desiredLevelLocked;
        updateLockState(desiredLevelLock, desiredLevelLocked);
        saveValues();
        console.log(
            `[Analytics] desiredLevelLock toggled → now ${
                desiredLevelLocked ? "locked" : "unlocked"
            }`
        );
    });

    function updateValues() {
        currentLevelNum.value = currentLevelSlider.value;
        desiredLevelNum.value = desiredLevelSlider.value;
        saveValues();
    }

    function enforceConstraints(source) {
        let curr = parseInt(currentLevelSlider.value);
        let des = parseInt(desiredLevelSlider.value);

        // Helper to show and pulse a notice or lock icon
        function triggerGlow(elem) {
            elem.style.display = "";
            if (!elem.classList.contains("pulse")) {
                elem.classList.add("pulse");
                setTimeout(() => elem.classList.remove("pulse"), 3000);
            }
        }

        if (currentLevelLocked && desiredLevelLocked) {
            if (source === "current" && curr >= des) {
                currentLevelSlider.value = des - 1;
                triggerGlow(desiredLevelLock);
                triggerGlow(currentLevelNotice);
            }
            if (source === "desired" && des <= curr) {
                desiredLevelSlider.value = curr + 1;
                triggerGlow(currentLevelLock);
                triggerGlow(desiredLevelNotice);
            }
        } else if (currentLevelLocked && !desiredLevelLocked) {
            if (source === "current" && curr >= des) {
                desiredLevelSlider.value = curr + 1;
                console.log(
                    `[Analytics] Constraint: desiredLevel bumped to ${
                        desiredLevelSlider.value
                    }`
                );
            } else if (source === "desired" && des <= curr) {
                desiredLevelSlider.value = curr + 1;
                triggerGlow(currentLevelLock);
                triggerGlow(desiredLevelNotice);
            }
        } else if (desiredLevelLocked && !currentLevelLocked) {
            if (source === "desired" && des <= curr) {
                currentLevelSlider.value = des - 1;
                console.log(
                    `[Analytics] Constraint: currentLevel reduced to ${
                        currentLevelSlider.value
                    }`
                );
            } else if (source === "current" && curr >= des) {
                currentLevelSlider.value = des - 1;
                triggerGlow(desiredLevelLock);
                triggerGlow(currentLevelNotice);
            }
        } else {
            if (source === "current" && curr >= des) {
                desiredLevelSlider.value = curr + 1;
                console.log(
                    `[Analytics] Constraint: desiredLevel bumped to ${
                        desiredLevelSlider.value
                    }`
                );
            }
            if (source === "desired" && des <= curr) {
                currentLevelSlider.value = des - 1;
                console.log(
                    `[Analytics] Constraint: currentLevel reduced to ${
                        currentLevelSlider.value
                    }`
                );
            }
        }

        updateValues();
    }

    function fetchMeatRequired() {
        const curr = parseInt(currentLevelSlider.value);
        const des = parseInt(desiredLevelSlider.value);
        if (curr >= des) {
            resultContainer.innerHTML = `<p class="error">Invalid levels. Current level must be less than desired level.</p>`;
            return;
        }
        let total = 0;
        levelingData.forEach((entry) => {
            if (entry.level > curr && entry.level <= des) {
                total += parseInt(entry.meat_required, 10) || 0;
            }
        });
        resultContainer.innerHTML = `
            <div class="result-content">
                <div class="required-header">
                    <img src="${iconPath}" alt="Meat Icon" class="meat-icon">
                    <div class="required-label">Required:</div>
                </div>
                <div class="required-number">${total.toLocaleString()}</div>
            </div>`;
        console.log(
            `[Analytics] fetchMeatRequired: current=${curr}, desired=${des}, total=${total}`
        );
    }

    function handleIncrementDecrement(input, slider, step) {
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        let val = parseInt(input.value);
        if (val + step >= min && val + step <= max) {
            input.value = val + step;
            syncInputToSlider(input, slider);
        }
    }

    function enableHold(button, input, slider, step) {
        let timeoutId,
            initialDelay = 300,
            delay = 100,
            minDelay = 5,
            accel = 0.9,
            isHeld = false,
            isDown = false;

        function performStep() {
            handleIncrementDecrement(input, slider, step);
            delay = Math.max(minDelay, delay * accel);
            timeoutId = setTimeout(performStep, delay);
        }

        function startHold() {
            isHeld = false;
            isDown = true;
            timeoutId = setTimeout(() => {
                if (isDown) {
                    isHeld = true;
                    delay = 100;
                    performStep();
                }
            }, initialDelay);
        }

        function endHold() {
            isDown = false;
            clearTimeout(timeoutId);
            if (!isHeld) {
                handleIncrementDecrement(input, slider, step);
            }
        }

        button.addEventListener("mousedown", startHold);
        button.addEventListener("mouseup", endHold);
        button.addEventListener("mouseleave", () => {
            if (isDown) endHold();
        });
        button.addEventListener("touchstart", (e) => {
            e.preventDefault();
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
        const val = parseInt(input.value);
        if (!isNaN(val)) {
            slider.value = val;
            if (slider === currentLevelSlider) {
                enforceConstraints("current");
            } else {
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

    // Only log on "change" or button clicks, not on every "input"
    currentLevelSlider.addEventListener("change", () => {
        console.log(
            `[Analytics] currentLevelSlider changed → ${currentLevelSlider.value}`
        );
        enforceConstraints("current");
        fetchMeatRequired();
    });

    desiredLevelSlider.addEventListener("change", () => {
        console.log(
            `[Analytics] desiredLevelSlider changed → ${desiredLevelSlider.value}`
        );
        enforceConstraints("desired");
        fetchMeatRequired();
    });

    currentLevelNum.addEventListener("blur", () =>
        syncInputToSlider(currentLevelNum, currentLevelSlider)
    );
    currentLevelNum.addEventListener("keydown", (e) =>
        handleEnterKey(currentLevelNum, currentLevelSlider, e)
    );

    desiredLevelNum.addEventListener("blur", () =>
        syncInputToSlider(desiredLevelNum, desiredLevelSlider)
    );
    desiredLevelNum.addEventListener("keydown", (e) =>
        handleEnterKey(desiredLevelNum, desiredLevelSlider, e)
    );

    currentLevelMin.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.min;
        enforceConstraints("current");
        fetchMeatRequired();
        console.log("[Analytics] Set current to minimum");
    });

    currentLevelMax.addEventListener("click", () => {
        currentLevelSlider.value = currentLevelSlider.max;
        enforceConstraints("current");
        fetchMeatRequired();
        console.log("[Analytics] Set current to maximum");
    });

    desiredLevelMin.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.min;
        enforceConstraints("desired");
        fetchMeatRequired();
        console.log("[Analytics] Set desired to minimum");
    });

    desiredLevelMax.addEventListener("click", () => {
        desiredLevelSlider.value = desiredLevelSlider.max;
        enforceConstraints("desired");
        fetchMeatRequired();
        console.log("[Analytics] Set desired to maximum");
    });

    loadStoredValues();
    enforceConstraints("current");
    fetchMeatRequired();

    updateNoticePositions();
    window.addEventListener("resize", updateNoticePositions);
    window.addEventListener("scroll", updateNoticePositions);
});
