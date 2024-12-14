<?php
// templates/hero_page.php

include_once __DIR__ . '/../includes/db_functions.php';

// Get the hero and page parameters from the URL
$hero = $_GET['hero'] ?? null;
$page = $_GET['page'] ?? 'gear';

// Allow alphanumeric, spaces, underscores, and hyphens
$hero = preg_replace('/[^a-zA-Z0-9 _-]/', '', $hero);
$page = preg_replace('/[^a-zA-Z0-9_-]/', '', $page);


// Fetch hero data from the database
$heroData = getHeroByName($hero);

if (!$heroData) {
    if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
        exit;
    }
    echo "<h2>No content available.</h2>";
    exit;
}

// Fetch roles associated with the hero from the database
$roleDetails = getHeroRoles($heroData['id']); // New function to fetch role details

// Scan the directory for PHP files for valid hero pages
$heroDir = dirname(__DIR__) . "/pages/heroes/{$hero}";
$validPages = [];
if (is_dir($heroDir)) {
    $validPages = array_map(function ($filePath) {
        return basename($filePath, '.php'); // Get the file name without extension
    }, glob("{$heroDir}/*.php"));
}

// Only resolve the full path to the requested page if valid pages exist
$heroPath = null;
if (!empty($validPages) && in_array($page, $validPages)) {
    $heroPath = "{$heroDir}/{$page}.php";
}

// Handle AJAX requests
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    if ($heroPath && file_exists($heroPath)) {
        include $heroPath;
    } else {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
    }
    exit;
}
?>

<div class="hero-header">
    <h2><?= htmlspecialchars($heroData['name']) ?></h2>
    <?php if (!empty($heroData['icon']) && $heroData['icon'] !== 'null'): ?>
        <img src="<?= htmlspecialchars($heroData['icon']) ?>" 
             alt="<?= htmlspecialchars($heroData['name']) ?> Icon" 
             class="hero-icon">
    <?php endif; ?>

    <!-- Display Faction Icon -->
    <?php if (!empty($heroData['faction_icon'])): ?>
        <?php
        $factionColor = $heroData['faction_color'] ?? '#000'; // Default to black if no color found
        ?>
        <p class="hero-faction" style="color: <?= htmlspecialchars($factionColor) ?> !important;">
            <img src="<?= htmlspecialchars($heroData['faction_icon']) ?>" 
                 alt="<?= htmlspecialchars($heroData['faction']) ?> Icon" 
                 class="faction-icon">
            <?= htmlspecialchars($heroData['faction']) ?>
        </p>
    <?php endif; ?>

    <!-- Display Hero Rarity with custom colors -->
    <?php if (!empty($heroData['rarity'])): ?>
        <?php
        $rarityColors = [
            'Mythic' => '#f28f7a',
            'Legendary' => '#f6c674',
            'Epic' => '#d18bdb',
            'Rare' => '#7dccf1',
        ];
        $rarityColor = $rarityColors[ucfirst(strtolower($heroData['rarity']))] ?? '#000'; // Default to black if no match
        ?>
        <p class="hero-rarity" style="color: <?= htmlspecialchars($rarityColor) ?> !important;">
            <?= htmlspecialchars($heroData['rarity']) ?>
        </p>
    <?php endif; ?>

    <div class="hero-roles">
        <?php if (!empty($roleDetails)): ?>
            <table class="roles-table">
                <?php foreach ($roleDetails as $role): ?>
                    <tr>
                        <!-- Role Icon -->
                        <td class="role-icon-cell">
                            <?php if (!empty($role['icon'])): ?>
                                <img src="<?= htmlspecialchars($role['icon']) ?>" 
                                     alt="<?= htmlspecialchars($role['name']) ?> Icon" 
                                     class="role-icon">
                            <?php endif; ?>
                        </td>

                        <!-- Role Description with Prefix -->
                        <td class="role-description-cell">
                            <?php
                            preg_match('/^(.*?):/', $role['description'] ?? $role['name'], $matches);
                            $prefix = $matches[1] ?? '';
                            $description = preg_replace('/^(.*?):/', '', $role['description'] ?? $role['name']);
                            ?>
                            <strong><?= htmlspecialchars($prefix) ?>:</strong><br>
                            <?= htmlspecialchars(trim($description)) ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php else: ?>
            <!-- <p>No roles assigned.</p> -->
        <?php endif; ?>
    </div>
</div>




<?php if (!empty($validPages)): ?>
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
<?php endif; ?>

<div class="hero-content">
    <?php if ($heroPath && file_exists($heroPath)): ?>
        <?php include $heroPath; ?>
    <?php else: ?>
        <p>No additional content available for this hero.</p>
    <?php endif; ?>
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
