<?php
include_once __DIR__ . '/../includes/db_functions.php';
// Fetch the resource for "Meat"
$resourceName = "Meat";
$resource = getResourceByName($resourceName);

if ($resource) {
    $resourceId = $resource['id'];
    $iconData = getResourceIcons($resourceId);

    // Fetch all hero leveling data for the resource
    $levelingTable = getAllHeroLevels($resourceId);
    $maxLevel = count($levelingTable); // Dynamic max level

    // Preload the leveling table and max level into JavaScript variables
    echo "<script>const levelingData = " . json_encode($levelingTable) . ";</script>";
    echo "<script>const maxLevel = " . $maxLevel . ";</script>";

    $iconPath = null;
    foreach ($iconData as $icon) {
        if ($icon['type'] === 'Default') {
            $iconPath = $icon['icon_path'];
            break;
        }
    }

    if ($iconPath) {
        echo "<script>const iconPath = '" . htmlspecialchars($iconPath, ENT_QUOTES) . "';</script>";
    } else {
        $iconErrorMessage = "No default icon found for resource '$resourceName'.";
    }
} else {
    $iconErrorMessage = "Resource '$resourceName' not found in the database.";
}

// Initialize variables
$currentLevel = isset($_POST['current_level']) ? (int)$_POST['current_level'] : 1; // Default to 1
$desiredLevel = isset($_POST['desired_level']) ? (int)$_POST['desired_level'] : $maxLevel; // Default to max level
$totalMeatRequired = 0;

// Calculate total meat required if both levels are set and valid
if ($currentLevel && $desiredLevel && $currentLevel < $desiredLevel) {
    foreach ($levelingTable as $entry) {
        if ($entry['level'] > $currentLevel && $entry['level'] <= $desiredLevel) {
            $totalMeatRequired += $entry['meat_required'];
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="/static/js/hero_leveling.js" defer></script>
</head>
<body>
  <!-- Calculation Result -->
  <div id="meat-result">
    <?php if ($currentLevel && $desiredLevel): ?>
      <?php if (isset($errorMessage)): ?>
        <p class="error"><?= htmlspecialchars($errorMessage) ?></p>
      <?php else: ?>
        <div class="result-content">
          <!-- Wrap icon + "Required:" on same row -->
          <div class="required-header">
            <?php if (isset($iconPath)): ?>
              <img src="<?= htmlspecialchars($iconPath) ?>" alt="Meat Icon" class="meat-icon">
            <?php endif; ?>
            <div class="required-label">Required:</div>
          </div>
          <!-- Number on its own line -->
          <div class="required-number"><?= number_format($totalMeatRequired) ?></div>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </div>

  <!-- Form Section -->
  <form id="hl_form" method="POST" action="">
    <!-- Current Level Section -->
    <label for="current_level">Current Level:</label>
    <div class="input-pair">
      <button type="button" id="current_level_decrease" class="level-button">
        <i class="fa-solid fa-minus"></i>
      </button>
      <input
        type="number"
        id="current_level_num"
        name="current_level_num"
        value="<?= htmlspecialchars($currentLevel) ?>"
        min="1"
        max="<?= $maxLevel - 1 ?>"
        step="1"
        required
      >
      <button type="button" id="current_level_increase" class="level-button">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    <div class="slider-container">
      <span id="current_level_min" class="slider-min">1</span>
      <input
        type="range"
        id="current_level"
        name="current_level"
        value="<?= htmlspecialchars($currentLevel) ?>"
        min="1"
        max="<?= $maxLevel - 1 ?>"
        step="1"
        required
      >
      <span id="current_level_max" class="slider-max"><?= $maxLevel - 1 ?></span>
      <i id="current_level_lock" class="fa-solid fa-lock-open lock-icon"></i>
    </div>
    <p class="notice" id="current_level_notice">Unlock Target Level to increase Current Level greater.</p>

    <!-- Desired Level Section -->
    <label for="desired_level">Target Level:</label>
    <div class="input-pair">
      <button type="button" id="desired_level_decrease" class="level-button">
        <i class="fa-solid fa-minus"></i>
      </button>
      <input
        type="number"
        id="desired_level_num"
        name="desired_level_num"
        value="<?= htmlspecialchars($desiredLevel) ?>"
        min="2"
        max="<?= $maxLevel ?>"
        step="1"
        required
      >
      <button type="button" id="desired_level_increase" class="level-button">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    <div class="slider-container">
      <span id="desired_level_min" class="slider-min">2</span>
      <input
        type="range"
        id="desired_level"
        name="desired_level"
        value="<?= htmlspecialchars($desiredLevel) ?>"
        min="2"
        max="<?= $maxLevel ?>"
        step="1"
        required
      >
      <span id="desired_level_max" class="slider-max"><?= $maxLevel ?></span>
      <i id="desired_level_lock" class="fa-solid fa-lock-open lock-icon"></i>
    </div>
    <p class="notice" id="desired_level_notice">Unlock Current Level to decrease Target Level lesser.</p>

    <!-- Explanation Section (replaces the Calculate button) -->
    <div class="explanation">
      <h3>How this page works</h3>
      <p>
        Adjust your <strong>Current Level</strong> and <strong>Target Level</strong> using either the number inputs or the sliders.
        There’s no “Calculate” button anymore—any valid change you make to those fields will automatically update the total Meat required and display it above.
      </p>
      <ul>
        <li>
          <strong>Current Level</strong>: choose your starting hero level (between 1 and <code><?= $maxLevel - 1 ?></code>).
        </li>
        <li>
          <strong>Target Level</strong>: choose the level you want to reach (between 2 and <code><?= $maxLevel ?></code>).
        </li>
        <li>
          If you try to set Current &ge; Target (while both levels are “locked”), the sliders will automatically enforce a valid range and show a brief notice.
        </li>
        <li>
          As soon as both levels are valid (Current &lt; Target), the script calculates the sum of <code>meat_required</code> from <code>levelingData</code> and renders it with the Meat icon above.
        </li>
      </ul>
      <p class="note">
        You can also click the “min” or “max” text under each slider to jump directly to level 1 (for Current) or level <?= $maxLevel ?> (for Target).
      </p>
    </div>
  </form>
</body>
</html>
