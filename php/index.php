<?php
// index.php

$pageTitles = [
    'shard_calc' => 'Hero Shard Calculator',
    'heroes' => 'Hero Information',
    'hero_leveling' => 'Hero Level Calculator',
];

$page = $_GET['page'] ?? 'shard_calc';
$allowed_pages = array_keys($pageTitles);
$page = in_array($page, $allowed_pages) ? $page : 'shard_calc';
$pageTitle = $pageTitles[$page] ?? 'Top Heroes';

include 'includes/header.php';
?>

<div class="page-layout">
  <header class="top-bar">
    <div class="top-bar-wrapper">
      <div class="top-bar-inner">
        <div class="hamburger-menu">
          <button id="hamburgerIcon" class="menu-icon" aria-label="Menu">
            <i class="fa fa-bars"></i>
          </button>
          <div id="menuDropdown" class="menu-dropdown">
            <a href="?page=shard_calc" class="<?= $page === 'shard_calc' ? 'active' : '' ?>">Shard Calculator</a>
            <a href="?page=hero_leveling" class="<?= $page === 'hero_leveling' ? 'active' : '' ?>">Hero Level Calculator</a>
            <a href="?page=heroes" class="<?= $page === 'heroes' ? 'active' : '' ?>">Hero Information</a>
          </div>
        </div>

        <h1 class="title"><?= htmlspecialchars($pageTitle) ?></h1>

        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Theme">
          <i id="themeToggleIcon" class="fa fa-sun"></i>
        </button>
      </div> <!-- /.top-bar-inner -->
    </div> <!-- /.top-bar-wrapper -->
  </header>

  <?php if ($page === 'shard_calc') include 'templates/shard_floating_form.php'; ?>

  <div class="content-wrapper">
    <div class="container">
      <div class="container-content">
        <?php include "templates/{$page}.php"; ?>
      </div>
    </div>
  </div>

<!-- Ads go here -->
<div class="ad-wrapper">
  <!-- Left Ad (desktop only) -->
  <div class="ad-slot ad-left">
    <?php include 'includes/ad-left.php'; ?>
  </div>

  <!-- Right Ad (desktop only) -->
  <div class="ad-slot ad-right">
    <?php include 'includes/ad-right.php'; ?>
  </div>

  <!-- Bottom Ad (mobile only) -->
  <div class="ad-slot ad-bottom">
    <?php include 'includes/ad-bottom.php'; ?>
  </div>
</div>

<?php include 'includes/footer.php'; ?>
