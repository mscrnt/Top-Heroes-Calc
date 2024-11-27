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
    const container = document.querySelector('.container.content-wrapper');
    const desktopInitialTop = 220; // Default top for desktop
    const mobileInitialTop = 290; // Default top for mobile
    const fixedTopDistance = 10; // Distance from top when pinned

    let initialTopPixels = desktopInitialTop; // Default for desktop
    let isPinned = false; // Tracks whether the shard is pinned to the top

    // Function to calculate the initial position dynamically
    function calculateInitialTop() {
        if (window.innerWidth <= 768) {
            initialTopPixels = mobileInitialTop;
            console.log(`[ShardDisplay] Mobile view detected, using mobileInitialTop: ${mobileInitialTop}px`);
        } else {
            initialTopPixels = desktopInitialTop;
            console.log(`[ShardDisplay] Desktop view detected, using desktopInitialTop: ${desktopInitialTop}px`);
        }
        return initialTopPixels;
    }

    function initializePosition() {
        initialTopPixels = calculateInitialTop(); // Recalculate the initial position dynamically
        floatingShard.style.top = `${initialTopPixels}px`;
        floatingShard.style.position = 'absolute'; // Default to absolute
        console.log(`[ShardDisplay] Initialized position: top=${initialTopPixels}px, position=absolute`);
    }

    function updateFloatingPosition() {
        const scrollTop = container.scrollTop;

        console.log(`[ShardDisplay] scrollTop: ${scrollTop}, threshold: ${initialTopPixels - fixedTopDistance}`);

        if (scrollTop > initialTopPixels - fixedTopDistance && !isPinned) {
            // Pin the shard to the top
            floatingShard.style.position = 'fixed';
            floatingShard.style.top = `${fixedTopDistance}px`;
            isPinned = true;
            console.log(`[ShardDisplay] Pinned to top. Position=fixed, top=${fixedTopDistance}px`);
        } else if (scrollTop <= initialTopPixels - fixedTopDistance && isPinned) {
            // Unpin the shard
            floatingShard.style.position = 'absolute';
            floatingShard.style.top = `${initialTopPixels}px`;
            isPinned = false;
            console.log(`[ShardDisplay] Unpinned from top. Position=absolute, top=${initialTopPixels}px`);
        }
    }

    // Set the initial position on load
    initializePosition();

    // Listen for scroll events to update position
    container.addEventListener('scroll', updateFloatingPosition);

    // Recalculate the initial offset if the window is resized
    window.addEventListener('resize', () => {
        initializePosition();
        console.log(`[ShardDisplay] Reinitialized position on resize.`);
    });
}
