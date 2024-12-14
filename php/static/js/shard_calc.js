// static/js/shard_calc.js

let selectedLevel = null;
let lastSelectedKey = null;
let fillCounts = {}; // Tracks filled sections for each cell

// Default shard values for each hero type
const defaultShards = {
    legendary: 500,
    mythic: 1000,
};

document.addEventListener("DOMContentLoaded", () => {
    resetForm();
    toggleChart();
    handleFloatingShardDisplay();

    document.getElementById("heroType").addEventListener("change", handleChartSwitch);
    document.getElementById("calculateButton").addEventListener("click", () => {
        normalizeInput();
        clearProgressAndCalculateShards();
    });
    document.getElementById("resetButton").addEventListener("click", resetForm);

    document.getElementById("currentLevel").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            normalizeInput();
            clearProgressAndCalculateShards();
        }
    });

    addCellEventListeners();
});

function normalizeInput() {
    const currentLevelInput = document.getElementById("currentLevel");
    let inputValue = currentLevelInput.value.trim();

    // If the input is a whole number, convert it to a float format
    if (/^\d+$/.test(inputValue)) {
        inputValue = `${inputValue}.0`;
        currentLevelInput.value = inputValue;
    }
}

function addCellEventListeners() {
    const heroType = document.getElementById("heroType").value;

    // Add event listeners to level-cell elements
    document.querySelectorAll(`#${heroType}Chart .level-cell`).forEach((cell) => {
        cell.removeEventListener("click", handleCellClick);
        cell.addEventListener("click", handleCellClick);
    });

    // Add event listeners to star-cell elements
    document.querySelectorAll(`#${heroType}Chart .star-cell`).forEach((cell) => {
        cell.removeEventListener("click", handleCellClick);
        cell.addEventListener("click", handleCellClick);
    });
}

function handleCellClick(event) {
    const cell = event.currentTarget;
    const level = parseInt(cell.getAttribute("data-level") || cell.closest('tr').querySelector('.star-cell')?.getAttribute('data-level'));
    const shardPerStep = parseInt(cell.getAttribute("data-shards") || cell.closest('tr').querySelector('.star-cell')?.getAttribute('data-shards'));
    
    if (!isNaN(level) && !isNaN(shardPerStep)) {
        incrementProgressBar(level, cell, shardPerStep);
    } else {
        console.warn(`[ShardCalc] Invalid data-level or data-shards for the clicked cell.`);
    }
}


function incrementProgressBar(level, cell, shardPerStep) {
    const heroType = document.getElementById("heroType").value;
    const currentKey = `${heroType}-progress-${level}`;

    fillCounts[currentKey] = (fillCounts[currentKey] || 0) + 1;
    if (fillCounts[currentKey] > 5) {
        fillCounts[currentKey] = 0;
    }

    updateProgressOverlay(cell, fillCounts[currentKey], shardPerStep);
    document.getElementById("currentLevel").value = `${level}.${fillCounts[currentKey]}`;

    lastSelectedKey = cell;

    calculateShards();
}

function updateProgressOverlay(cell, progress, shardPerStep) {
    let overlay = cell.querySelector(".progress-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.classList.add("progress-overlay");
        cell.appendChild(overlay);
    }
    const totalShards = shardPerStep * 5;
    const currentShards = progress * shardPerStep;
    overlay.style.width = `${(progress / 5) * 100}%`;

    overlay.textContent = progress > 0 ? `${currentShards}/${totalShards}` : "";
}

function calculateShards() {
    const shardsPerLevelLegendary = [1, 1, 2, 2, 4, 6, 4, 4, 8, 8, 16, 4, 8, 16, 16];
    const shardsPerLevelMythic = [2, 2, 4, 4, 8, 12, 8, 8, 16, 16, 32, 8, 16, 32, 32];
    const perStarLegendary = [5, 5, 10, 10, 20, 30, 20, 20, 40, 40, 80, 20, 40, 80, 80];
    const perStarMythic = [10, 10, 20, 20, 40, 60, 40, 40, 80, 80, 160, 40, 80, 160, 160];
    const maxShardsLegendary = 500;
    const maxShardsMythic = 1000;

    const heroType = document.getElementById("heroType").value;
    const currentLevelInput = document.getElementById("currentLevel").value.trim();

    if (!currentLevelInput) {
        // If no level input, display the default shards
        document.getElementById("result").innerText = defaultShards[heroType];
        return;
    }

    const parts = currentLevelInput.split(".");
    const currentLevel = parseInt(parts[0]);
    const currentSection = parseInt(parts[1] || 0);

    clearProgress();

    if (currentLevel && currentSection) {
        const currentCell = document.querySelector(
            `#${heroType}Chart .star-cell[data-level='${currentLevel}']`
        );
        const shardPerStep =
            heroType === "legendary"
                ? shardsPerLevelLegendary[currentLevel - 1]
                : shardsPerLevelMythic[currentLevel - 1];
        fillCounts[`${heroType}-progress-${currentLevel}`] = currentSection;
        updateProgressOverlay(currentCell, currentSection, shardPerStep);
    }

    const perStarValues =
        heroType === "legendary" ? perStarLegendary : perStarMythic;
    const shardsPerStepValues =
        heroType === "legendary"
            ? shardsPerLevelLegendary
            : shardsPerLevelMythic;

    let accumulatedShards = 0;

    for (let level = 1; level < currentLevel; level++) {
        accumulatedShards += perStarValues[level - 1];
    }

    const shardPerStep = shardsPerStepValues[currentLevel - 1];
    accumulatedShards += currentSection * shardPerStep;

    const maxShards = heroType === "legendary" ? maxShardsLegendary : maxShardsMythic;
    const shardsNeeded = maxShards - accumulatedShards;
    document.getElementById("result").innerText = shardsNeeded.toFixed(0);
}

function clearProgress() {
    selectedLevel = null;
    lastSelectedKey = null;
    fillCounts = {};

    document.querySelectorAll(".progress-overlay").forEach((overlay) => {
        overlay.style.width = "0%";
        overlay.textContent = "";
    });
}

function clearProgressAndCalculateShards() {
    clearProgress();
    calculateShards();
}

function resetForm() {
    const heroType = document.getElementById("heroType").value;
    document.getElementById("currentLevel").value = "";
    document.getElementById("result").innerText = defaultShards[heroType];
    clearProgress();
}

function handleChartSwitch() {
    resetForm();
    addCellEventListeners();
    toggleChart();
}

function toggleChart() {
    const heroType = document.getElementById("heroType").value;
    const legendaryChart = document.getElementById("legendaryChart");
    const mythicChart = document.getElementById("mythicChart");

    if (legendaryChart && mythicChart) {
        legendaryChart.style.display = heroType === "legendary" ? "block" : "none";
        mythicChart.style.display = heroType === "legendary" ? "none" : "block";
    }
}

function handleFloatingShardDisplay() {
    const floatingShard = document.querySelector('.floating-shard-display');
    const heroTypeSelect = document.querySelector('#heroType');
    const fixedTopDistance = 64; // Distance from the top of the viewport when pinned (0.5rem)
    const offsetBelowHeroType = 8; // Distance below the #heroType element
    let isPinned = false;

    // Debugging utility
    function logPositionDetails() {
        const heroTypeRect = heroTypeSelect.getBoundingClientRect();
        const floatingShardRect = floatingShard.getBoundingClientRect();

        // console.log('[Debug] HeroType Element Position:', {
        //     top: heroTypeRect.top,
        //     bottom: heroTypeRect.bottom,
        // });
        // console.log('[Debug] Floating Shard Position:', {
        //     top: floatingShardRect.top,
        //     bottom: floatingShardRect.bottom,
        // });
    }

    function updateFloatingShardPosition() {
        const heroTypeRect = heroTypeSelect.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        if (heroTypeRect.bottom + offsetBelowHeroType <= fixedTopDistance && !isPinned) {
            // Pin the shard to the top of the viewport
            floatingShard.style.position = 'fixed';
            floatingShard.style.top = `${fixedTopDistance}px`;
            isPinned = true;
            // console.log('[Debug] Floating shard pinned to viewport.');
        } else if (heroTypeRect.bottom + offsetBelowHeroType > fixedTopDistance && isPinned) {
            // Reposition the floating shard below the heroType element
            floatingShard.style.position = 'absolute';
            floatingShard.style.top = `${heroTypeRect.bottom + scrollY + offsetBelowHeroType}px`;
            isPinned = false;
            // console.log('[Debug] Floating shard unpinned and repositioned.');
        } else if (!isPinned) {
            // Update the floating shard's position dynamically below the heroType element
            floatingShard.style.top = `${heroTypeRect.bottom + scrollY + offsetBelowHeroType}px`;
        }

        logPositionDetails();
    }

    function initializePosition() {
        const heroTypeRect = heroTypeSelect.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // Position the shard 8px below the heroType element
        floatingShard.style.position = 'absolute';
        floatingShard.style.top = `${heroTypeRect.bottom + scrollY + offsetBelowHeroType}px`;

        // console.log('[Debug] Initializing floating shard position...');
        logPositionDetails();
    }

    function detectScrollableContainer() {
        let scrollContainer = window;

        let parent = heroTypeSelect.parentElement;
        while (parent) {
            const overflowY = window.getComputedStyle(parent).overflowY;
            if (overflowY === 'scroll' || overflowY === 'auto') {
                scrollContainer = parent;
                break;
            }
            parent = parent.parentElement;
        }

        return scrollContainer;
    }

    const scrollContainer = detectScrollableContainer();

    // Initialize position and add listeners
    initializePosition();

    if (scrollContainer === window) {
        window.addEventListener('scroll', updateFloatingShardPosition);
    } else {
        scrollContainer.addEventListener('scroll', updateFloatingShardPosition);
    }

    window.addEventListener('resize', initializePosition);
}

