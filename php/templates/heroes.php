<?php
// templates/heroes.php

require_once 'includes/db_functions.php';

// Initialize heroes array
$heroes = [
    'nature_heroes' => [],
    'league_heroes' => [],
    'horde_heroes' => [],
    'all_heroes' => [],
];

// Fetch all heroes from the database
$allHeroes = getAllHeroes();

// Map factions to their respective keys in the $heroes array
$factionMap = [
    'Nature' => 'nature_heroes',
    'League' => 'league_heroes',
    'Horde' => 'horde_heroes',
];

// Loop through each hero and group them by faction and rarity
foreach ($allHeroes as $hero) {
    $factionKey = $factionMap[$hero['faction']] ?? null;

    // Add hero to all_heroes list
    $heroes['all_heroes'][] = [
        'id' => $hero['id'],
        'name' => $hero['name'],
        'card' => $hero['card'] ?? null,
        'rarity' => ucfirst(strtolower($hero['rarity'])), // Ensure proper capitalization (e.g., "Mythic")
    ];

    if ($factionKey) {
        $rarity = ucfirst(strtolower($hero['rarity']));
        if (!isset($heroes[$factionKey][$rarity])) {
            $heroes[$factionKey][$rarity] = []; // Initialize rarity group if not exists
        }

        // Add hero with card to the respective rarity group
        $heroes[$factionKey][$rarity][] = [
            'id' => $hero['id'],
            'name' => $hero['name'],
            'card' => $hero['card'] ?? null,
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/static/css/heroes.css">
    <style>
        /* Style for dropdown options with images */
        #factionDropdown option {
            background-repeat: no-repeat;
            background-position: left center;
            background-size: 20px 20px;
            padding-left: 30px; /* Space for the icon */
        }
        /* #factionDropdown option[value="all_heroes"] {
            background-image: url('/static/images/topheroes-all.png');
        } */
        #factionDropdown option[value="nature_heroes"] {
            background-image: url('/static/images/topheroes-green.png');
        }
        #factionDropdown option[value="league_heroes"] {
            background-image: url('/static/images/topheroes-blue.png');
        }
        #factionDropdown option[value="horde_heroes"] {
            background-image: url('/static/images/topheroes-red.png');
        }
    </style>
</head>
<body>
    <div class="mode-toggle">
        <span id="previewLabel">Tile</span>
        <i class="fa-solid fa-toggle-off" id="modeToggleIcon"></i>
        <span id="tileLabel">Preview</span>
    </div>
    
    <h2>Select Faction</h2>
    <form class="dropdown-form">
        <select name="faction" id="factionDropdown">
            <option value="nature_heroes">Nature Heroes</option>
            <option value="league_heroes">League Heroes</option>
            <option value="horde_heroes">Horde Heroes</option> 
            <option value="all_heroes">All Heroes</option>
        </select>
    </form>
    <div id="heroContainer" class="tile-mode"></div>
    <div id="previewContent" class="hidden"></div>
    <div id="heroDetails" class="hidden"></div>

    <!-- Embed heroesData as a JSON variable -->
    <script>
        const heroesData = <?= json_encode($heroes) ?>;
    </script>
    <script src="/static/js/heroes.js" defer></script>
</body>
</html>
