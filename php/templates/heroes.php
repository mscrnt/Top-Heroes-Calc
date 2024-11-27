<?php
// templates/heroes.php

// Data structure for heroes
$heroes = [
    'nature_heroes' => [
        'Mythics' => ['Tidecaller', 'Monk'],
        'Legendary' => ['Windwalker', 'Watcher', 'Treeguard', 'Stonemanson', 'Pixie', 'Sage', 'Pathfinder', 'Forest_Maiden', 'Druid'],
        'Epic' => ['Priestess', 'Dancer'],
        'Rare' => ['Pharmacist', 'Archer']
    ],
    'league_heroes' => [
        'Mythics' => ['Rose_Princess', 'Paragon', 'Bishop'],
        'Legendary' => ['Secret_Keeper', 'Pyromancer', 'Hostess', 'Bard', 'Astrologer', 'Adjudicator'],
        'Epic' => ['Ranger', 'Minister', 'Knight'],
        'Rare' => ['Wizard', 'Warrior']
    ],
    'horde_heroes' => [
        'Mythics' => ['Witch', 'Storm_Maiden', 'Desert_Prince'],
        'Legendary' => ['Wilderness_Hunter', 'Warlock', 'Swordmaster', 'Soulmancer', 'Shaman', 'Headhunter', 'Barbarian'],
        'Epic' => ['Rogue', 'Outlaw'],
        'Rare' => ['Guard', 'Blacksmith']
    ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/static/css/heroes.css">
    <title>Heroes</title>
    <style>
        /* Style for dropdown options with images */
        #factionDropdown option {
            background-repeat: no-repeat;
            background-position: left center;
            background-size: 20px 20px;
            padding-left: 30px; /* Space for the icon */
        }
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
        </select>
    </form>
    <!-- <h2 id="factionTitle">Nature Heroes</h2> -->
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
