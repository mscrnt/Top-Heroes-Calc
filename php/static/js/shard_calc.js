// static/js/shard_calc.js

let selectedLevel = null;
let lastSelectedKey = null;
let fillCounts = {}; // Tracks filled sections for each cell

document.addEventListener("DOMContentLoaded", () => {
    resetForm();
    toggleChart();

    document.getElementById("heroType").addEventListener("change", handleChartSwitch);
    document.getElementById("calculateButton").addEventListener("click", () => {
        clearProgressAndCalculateShards();
    });
    document.getElementById("resetButton").addEventListener("click", resetForm);

    document.getElementById("currentLevel").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            clearProgressAndCalculateShards();
        }
    });

    addCellEventListeners();
});

function addCellEventListeners() {
    const heroType = document.getElementById("heroType").value;
    document.querySelectorAll(`#${heroType}Chart .star-cell`).forEach((cell) => {
        cell.removeEventListener("click", handleStarCellClick);
        cell.addEventListener("click", handleStarCellClick);
    });
}

function handleStarCellClick(event) {
    const cell = event.currentTarget;
    const level = parseInt(cell.getAttribute("data-level"));
    const shardPerStep = parseInt(cell.getAttribute("data-shards"));
    incrementProgressBar(level, cell, shardPerStep);
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
    const parts = currentLevelInput.split(".");
    const currentLevel = parseInt(parts[0]);
    const currentSection = parseInt(parts[1]);

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
    document.getElementById("currentLevel").value = "";
    document.getElementById("result").innerText = "";
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
