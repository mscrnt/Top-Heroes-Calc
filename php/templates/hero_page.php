<?php
// templates/hero_page.php

// Import CSS
echo '<link rel="stylesheet" href="/static/css/hero_page.css">';

// Get the hero and page parameters from the URL
$hero = $_GET['hero'] ?? null;
$page = $_GET['page'] ?? 'gear';

// Sanitize inputs to prevent path traversal
$hero = preg_replace('/[^a-zA-Z0-9_-]/', '', $hero);
$page = preg_replace('/[^a-zA-Z0-9_-]/', '', $page);

// Define the hero's directory path
$heroDir = dirname(__DIR__) . "/pages/heroes/{$hero}";

// Check if the hero directory exists
if (!$hero || !is_dir($heroDir)) {
    if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
        echo "<div class='hero-content'><h2>No content available.</h2></div>";
        exit;
    }
    echo "<h2>No content available.</h2>";
    exit;
}

// Scan the directory for PHP files
$validPages = array_map(function ($filePath) {
    return basename($filePath, '.php'); // Get the file name without extension
}, glob("{$heroDir}/*.php"));

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

// Determine the hero icon path
$heroIconPath = "/static/images/hero_icons/{$hero}.webp";
if (!file_exists(dirname(__DIR__) . $heroIconPath)) {
    // Fall back to .png if .webp doesn't exist
    $heroIconPath = "/static/images/hero_icons/{$hero}.png";
}

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
    <h2><?= ucfirst(str_replace('_', ' ', $hero)) ?></h2>
    <?php if (file_exists(dirname(__DIR__) . $heroIconPath)): ?>
        <img src="<?= $heroIconPath ?>" alt="<?= ucfirst(str_replace('_', ' ', $hero)) ?> Icon" class="hero-icon">
    <?php endif; ?>
    <div class="hero-tabs">
        <?php foreach ($validPages as $validPage): ?>
            <a href="javascript:void(0);" 
               data-hero="<?= $hero ?>" 
               data-page="<?= $validPage ?>" 
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
