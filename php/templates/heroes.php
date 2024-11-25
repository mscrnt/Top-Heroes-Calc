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
</head>
<body>
    <h2>Select Faction</h2>
    <form class="dropdown-form">
        <select name="faction" id="factionDropdown">
            <option value="nature_heroes">Nature</option>
            <option value="league_heroes">League</option>
            <option value="horde_heroes">Horde</option>
        </select>
    </form>

    <h2 id="factionTitle">Nature Heroes</h2>
    <div id="heroContainer"></div>

    <!-- Embed heroesData as a JSON variable -->
    <script>
        const heroesData = <?= json_encode($heroes) ?>;
    </script>
    <script src="/static/js/heroes.js" defer></script>
</body>
</html>
