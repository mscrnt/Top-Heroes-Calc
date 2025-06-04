<?php
// templates/heroes.php

require_once 'includes/db_functions.php';

// Initialize heroes array
$heroes = [
    'nature_heroes' => [],
    'league_heroes' => [],
    'horde_heroes'  => [],
    'all_heroes'    => [],
];

// Fetch all heroes from the database
$allHeroes = getAllHeroes();

// Map factions to their respective keys in the $heroes array
$factionMap = [
    'Nature' => 'nature_heroes',
    'League' => 'league_heroes',
    'Horde'  => 'horde_heroes',
];

// Loop through each hero and group them by faction and rarity
foreach ($allHeroes as $hero) {
    $factionKey = $factionMap[$hero['faction']] ?? null;

    // Add hero to all_heroes list
    $heroes['all_heroes'][] = [
        'id'     => $hero['id'],
        'name'   => $hero['name'],
        'card'   => $hero['card'] ?? null,
        'rarity' => ucfirst(strtolower($hero['rarity'])), // Ensure proper capitalization
    ];

    if ($factionKey) {
        $rarity = ucfirst(strtolower($hero['rarity']));
        if (!isset($heroes[$factionKey][$rarity])) {
            $heroes[$factionKey][$rarity] = []; // Initialize rarity group if it doesn’t exist
        }

        // Add hero to the respective rarity group
        $heroes[$factionKey][$rarity][] = [
            'id'   => $hero['id'],
            'name' => $hero['name'],
            'card' => $hero['card'] ?? null,
        ];
    }
}
?>

<div class="heroes_info">
    <div class="mode-toggle">
        <span id="previewLabel"><i class="fa-solid fa-table-cells"></i></span>
        <i class="fa-solid fa-toggle-off" id="modeToggleIcon"></i>
        <span id="tileLabel"><i class="fa-solid fa-users-between-lines"></i></span>
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

    <!-- Pass PHP-generated data into JavaScript -->
    <script>
        const heroesData = <?= json_encode($heroes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
    </script>
    <script src="/static/js/heroes.js" defer></script>
</div>
