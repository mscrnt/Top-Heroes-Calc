<?php
// index.php

$pageTitles = [
    'shard_calc' => 'Hero Shard Calculator',
    'heroes' => 'Hero Info',
    'hero_leveling' => 'Hero Level Calculator',
];

$page = $_GET['page'] ?? 'shard_calc';
$allowed_pages = ['shard_calc', 'heroes', 'hero_leveling'];
$page = in_array($page, $allowed_pages) ? $page : 'shard_calc';
$pageTitle = $pageTitles[$page] ?? 'Top Heroes';

include 'includes/header.php';
?>

<!-- Top Bar Navigation -->
<header class="top-bar">
    <!-- Hamburger + Dropdown -->
    <div class="hamburger-menu">
        <button class="menu-icon" id="hamburgerIcon">
            <i class="fa fa-bars"></i>
        </button>
        <div class="menu-dropdown" id="menuDropdown">
            <a href="index.php?page=shard_calc" class="<?= $page === 'shard_calc' ? 'active' : '' ?>">Shard Calculator</a>
            <a href="index.php?page=heroes" class="<?= $page === 'heroes' ? 'active' : '' ?>">Hero Info</a>
            <a href="index.php?page=hero_leveling" class="<?= $page === 'hero_leveling' ? 'active' : '' ?>">Hero Level Calculator</a>
        </div>
    </div>

    <!-- Title -->
    <h1 class="title"><?= htmlspecialchars($pageTitle) ?></h1>

    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="themeToggle">
        <i id="themeToggleIcon" class="fa fa-sun"></i>
    </button>
</header>

<!-- Main Content -->
<main class="main">
    <?php include "templates/{$page}.php"; ?>
</main>

<!-- Mobile Bottom Navigation -->
<nav class="bottom-nav">
    <a href="index.php?page=shard_calc" class="<?= $page === 'shard_calc' ? 'active' : '' ?>">
        <i class="fa fa-chart-bar"></i>
    </a>
    <a href="index.php?page=heroes" class="<?= $page === 'heroes' ? 'active' : '' ?>">
        <i class="fa fa-users"></i>
    </a>
    <a href="index.php?page=hero_leveling" class="<?= $page === 'hero_leveling' ? 'active' : '' ?>">
        <i class="fa fa-level-up-alt"></i>
    </a>
</nav>

<?php include 'includes/footer.php'; ?>
