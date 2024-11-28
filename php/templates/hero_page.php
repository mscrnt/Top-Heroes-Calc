<?php
// templates/hero_page.php

include_once __DIR__ . '/../includes/db_functions.php';

// Import CSS
echo '<link rel="stylesheet" href="/static/css/hero_page.css">';

// Get the hero and page parameters from the URL
$hero = $_GET['hero'] ?? null;
$page = $_GET['page'] ?? 'gear';

// Sanitize inputs to prevent path traversal
$hero = preg_replace('/[^a-zA-Z0-9_-]/', '', $hero);
$page = preg_replace('/[^a-zA-Z0-9_-]/', '', $page);

// Fetch hero data from the database
$heroData = getHeroByName($hero); // Ensure getHeroByName($hero) fetches hero data as an associative array

if (!$heroData) {
    if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
        exit;
    }
    echo "<h2>No content available.</h2>";
    exit;
}

// Role definitions with icons and descriptions
$roleDefinitions = [
    'Damage Dealer' => [
        'icon' => '/static/images/role_icons/DPS.png',
        'description' => 'Damage Dealer: Excels at dealing damage, increasing final damage by 3%.',
    ],
    'Burst Damage' => [
        'icon' => '/static/images/role_icons/Burst.png',
        'description' => 'Burst Striker: Specialises in delivering high burst damage in a short period through skills.',
    ],
    'Multi-Target' => [
        'icon' => '/static/images/role_icons/Multi_Target.png',
        'description' => 'Area Damage Dealer: Excels at dealing Area of Effect (AOE) damage to multiple enemies.',
    ],
    'Tank' => [
        'icon' => '/static/images/role_icons/Tank.png',
        'description' => 'Guardian: Positioned in the front row to absorb damage, reducing damage taken by 5%.',
    ],
    'Control' => [
        'icon' => '/static/images/role_icons/Controller.png',
        'description' => 'Controller: Capable of controlling enemies through crowd-control effects.',
    ],
    'Sustained' => [
        'icon' => '/static/images/role_icons/Sustain.png',
        'description' => 'Sustainer: Inflicts special effects and engages in prolonged combat.',
    ],
    'Buff' => [
        'icon' => '/static/images/role_icons/Buff.png',
        'description' => 'Buffer: Provides beneficial buffs to enhance teammates’ performance.',
    ],
    'Healer' => [
        'icon' => '/static/images/role_icons/Healer.png',
        'description' => 'Healer: Specialises in healing, enhancing healing effects by 5%.',
    ],
    'Single Target' => [
        'icon' => '/static/images/role_icons/Single_target.png',
        'description' => 'Precision Striker: Focuses on dealing high damage to a single enemy.',
    ],
    'Support' => [
        'icon' => '/static/images/role_icons/Support.png',
        'description' => 'Supporter: Offers strategic support by increasing teammates’ maximum health by 5%.',
    ],
    'Debuff' => [
        'icon' => '/static/images/role_icons/Debuff.png',
        'description' => 'Debuffer: Specialises in weakening enemies by applying debuffs.',
    ],
    'Summoner' => [
        'icon' => '/static/images/role_icons/Summoner.png',
        'description' => 'Summoner: Capable of summoning additional units to assist in battle.',
    ],
];

// Scan the directory for PHP files for valid hero pages
$heroDir = dirname(__DIR__) . "/pages/heroes/{$hero}";
$validPages = [];
if (is_dir($heroDir)) {
    $validPages = array_map(function ($filePath) {
        return basename($filePath, '.php'); // Get the file name without extension
    }, glob("{$heroDir}/*.php"));
}

// Ensure the requested page exists in the hero's folder
if (!in_array($page, $validPages)) {
    if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
        exit;
    }
    echo "<h2>No content available.</h2>";
    exit;
}

// Resolve the full path to the requested page
$heroPath = "{$heroDir}/{$page}.php";

// Handle AJAX requests
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    if (!file_exists($heroPath)) {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
    } else {
        include $heroPath;
    }
    exit;
}
?>

<div class="hero-navigation">
    <h2><?= htmlspecialchars($heroData['name']) ?></h2>
    <?php if (!empty($heroData['icon'])): ?>
        <img src="<?= htmlspecialchars($heroData['icon']) ?>" 
             alt="<?= htmlspecialchars($heroData['name']) ?> Icon" 
             class="hero-icon">
    <?php endif; ?>
    <div class="hero-roles">
        <h3>Roles:</h3>
        <ul>
            <?php foreach (json_decode($heroData['roles'], true) as $role): ?>
                <?php if (isset($roleDefinitions[$role])): ?>
                    <li>
                        <img src="<?= htmlspecialchars($roleDefinitions[$role]['icon']) ?>" 
                             alt="<?= htmlspecialchars($role) ?> Icon" 
                             class="role-icon">
                        <span class="role-description">
                            <?= htmlspecialchars($roleDefinitions[$role]['description']) ?>
                        </span>
                    </li>
                <?php else: ?>
                    <li><?= htmlspecialchars($role) ?></li>
                <?php endif; ?>
            <?php endforeach; ?>
        </ul>
    </div>
    <div class="hero-tabs">
        <?php foreach ($validPages as $validPage): ?>
            <a href="javascript:void(0);" 
               data-hero="<?= htmlspecialchars($hero) ?>" 
               data-page="<?= htmlspecialchars($validPage) ?>" 
               class="<?= $page === $validPage ? 'active' : '' ?>">
                <?= ucfirst(str_replace('_', ' ', $validPage)) ?>
            </a>
        <?php endforeach; ?>
    </div>
</div>

<div class="hero-content">
    <?php include $heroPath; ?>
</div>

<script>
// Inline JavaScript for dynamic tab loading
document.addEventListener('DOMContentLoaded', () => {
    const heroContentContainer = document.querySelector('.hero-content');

    // Handle navigation clicks
    document.querySelectorAll('.hero-tabs a').forEach(link => {
        link.addEventListener('click', function () {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.hero-tabs a').forEach(tab => tab.classList.remove('active'));

            // Add 'active' class to the clicked tab
            this.classList.add('active');

            // Get hero and page from data attributes
            const hero = this.getAttribute('data-hero');
            const page = this.getAttribute('data-page');

            // Fetch the new content dynamically
            fetch(`hero_page.php?hero=${hero}&page=${page}&ajax=true`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load content');
                    }
                    return response.text();
                })
                .then(html => {
                    // Replace the content in the hero-content container
                    heroContentContainer.innerHTML = html;
                })
                .catch(error => {
                    console.error(error);
                    heroContentContainer.innerHTML = '<h2>Error loading content</h2>';
                });
        });
    });
});
</script>
