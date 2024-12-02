<?php
// templates/hero_leveling.php

include_once __DIR__ . '/../includes/db_functions.php';

// Define the maximum level as a variable
$maxLevel = 232;

// Import CSS
echo '<link rel="stylesheet" href="/static/css/hero_leveling.css">';

// Import JavaScript
echo '<script src="/static/js/hero_leveling.js" defer></script>';

// Initialize variables
$currentLevel = isset($_POST['current_level']) ? (int)$_POST['current_level'] : null;
$desiredLevel = isset($_POST['desired_level']) ? (int)$_POST['desired_level'] : null;
$totalMeatRequired = 0;

// Fetch the resource for "Meat"
$resourceName = "Meat";
$resource = getResourceByName($resourceName);
if ($resource) {
    $resourceId = $resource['id'];
    $iconData = getResourceIcons($resourceId);

    $iconPath = null;  
    foreach ($iconData as $icon) {
        if ($icon['type'] === 'Default') {
            $iconPath = $icon['icon_path'];  
            break;
        }
    }

    if (!$iconPath) {
        $iconErrorMessage = "No default icon found for resource '$resourceName'.";
    }
} else {
    $iconErrorMessage = "Resource '$resourceName' not found in the database.";
}

// Calculate total meat required if both levels are set
if ($currentLevel && $desiredLevel && $currentLevel < $desiredLevel) {
    $resourceId = 1;
    for ($level = $currentLevel; $level < $desiredLevel; $level++) {
        $levelingData = getHeroLeveling($level + 1, $resourceId);
        if ($levelingData) {
            $totalMeatRequired += $levelingData['meat_required'];
        } else {
            $errorMessage = "Meat required data not found for level " . ($level + 1) . ".";
            break;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <?php if (isset($iconPath)): ?>
        <div>
            <img src="<?= htmlspecialchars($iconPath) ?>" alt="Meat Icon">
        </div>
    <?php elseif (isset($iconErrorMessage)): ?>
        <p class="error"><?= htmlspecialchars($iconErrorMessage) ?></p>
    <?php endif; ?>

    <form method="POST" action="">
        <!-- Current Level Section -->
        <label for="current_level">Current Level:</label>
        <div class="input-pair">
            <input type="number" id="current_level_num" name="current_level_num" 
                value="<?= htmlspecialchars($currentLevel) ?>" 
                min="1" 
                max="<?= $maxLevel - 1 ?>" 
                step="1" 
                required>
            <div class="slider-container">
                <span id="current_level_min" class="slider-min">1</span>
                <input type="range" id="current_level" name="current_level" 
                    value="<?= htmlspecialchars($currentLevel) ?>" 
                    min="1" 
                    max="<?= $maxLevel - 1 ?>" 
                    step="1" 
                    required>
                <span id="current_level_max" class="slider-max"><?= $maxLevel - 1 ?></span>
                <i id="current_level_lock" class="fa-solid fa-lock-open lock-icon"></i>
            </div>
        </div>

        <!-- Desired Level Section -->
        <label for="desired_level">Desired Level:</label>
        <div class="input-pair">
            <input type="number" id="desired_level_num" name="desired_level_num" 
                value="<?= htmlspecialchars($desiredLevel) ?>" 
                min="2" 
                max="<?= $maxLevel ?>" 
                step="1" 
                required>
            <div class="slider-container">
                <span id="desired_level_min" class="slider-min">2</span>
                <input type="range" id="desired_level" name="desired_level" 
                    value="<?= htmlspecialchars($desiredLevel) ?>" 
                    min="2" 
                    max="<?= $maxLevel ?>" 
                    step="1" 
                    required>
                <span id="desired_level_max" class="slider-max"><?= $maxLevel ?></span>
                <i id="desired_level_lock" class="fa-solid fa-lock-open lock-icon"></i>
            </div>
        </div>

        <button type="submit">Calculate</button>
    </form>

    <div id="result">
        <?php if ($currentLevel && $desiredLevel): ?>
            <?php if (isset($errorMessage)): ?>
                <p class="error"><?= htmlspecialchars($errorMessage) ?></p>
            <?php else: ?>
                <h2>Total Meat Required: <?= number_format($totalMeatRequired) ?> Meat</h2>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</body>
</html>

