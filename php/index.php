<?php
// index.php

// Define page titles
$pageTitles = [
    'shard_calc' => 'Hero Shard Calculator',
    'heroes' => 'Hero Info',
    'hero_leveling' => 'Hero Level Calculator',
];

// Determine the current page and its title
$page = isset($_GET['page']) ? $_GET['page'] : 'shard_calc';
$allowed_pages = ['shard_calc', 'heroes', 'hero_leveling']; // Allowed pages
if (!in_array($page, $allowed_pages)) {
    $page = 'shard_calc'; // Fallback to default page
}
$pageTitle = isset($pageTitles[$page]) ? $pageTitles[$page] : 'Top Heroes'; // Fallback title

// Include header with the dynamically set title
include 'includes/header.php'; 
?>

<div class="page-layout">
    <!-- Wrapper for controls and main content -->
    <div class="content-wrapper">
        <!-- Controls Bar -->
        <div class="controls-bar">
            <!-- Hamburger Menu -->
            <div class="hamburger-menu">
                <i class="fa fa-bars" id="hamburgerIcon"></i>
                <div class="menu-dropdown" id="menuDropdown">
                    <a href="index.php?page=shard_calc" <?php if ($page === 'shard_calc') echo 'class="active"'; ?>>Shard Calculator</a>
                    <a href="index.php?page=heroes" <?php if ($page === 'heroes') echo 'class="active"'; ?>>Hero Info</a>
                    <a href="index.php?page=hero_leveling" <?php if ($page === 'hero_leveling') echo 'class="active"'; ?>>Hero Level Calculator</a>
                </div>
            </div>

            <!-- Page Title -->
            <div class="controls-bar-title">
                <?= htmlspecialchars($pageTitle) ?>
            </div>

            <!-- Light/Dark Mode Toggle -->
            <div class="theme-toggle">
                <i id="themeToggleIcon" class="fa-regular fa-sun"></i>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="container">
            <div class="container-content">
                <?php
                // Dynamically include the selected page
                include "templates/{$page}.php";
                ?>
            </div>
        </div>
    </div>
</div>

<?php
include 'includes/footer.php'; // Closes </body> and </html>
?>
