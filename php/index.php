<?php
// index.php

// Define page titles
$pageTitles = [
    'shard_calc' => 'Shard Calculator',
    'heroes' => 'Hero Info',
];

// Determine the current page and its title
$page = isset($_GET['page']) ? $_GET['page'] : 'shard_calc';
$allowed_pages = ['shard_calc', 'heroes']; 
if (!in_array($page, $allowed_pages)) {
    $page = 'shard_calc'; 
}
$pageTitle = isset($pageTitles[$page]) ? $pageTitles[$page] : 'Top Heroes'; 

// Include header with the dynamically set title
include 'templates/header.php'; 
?>


<div class="page-layout">
    <!-- Content Wrapper -->
    <div class="container content-wrapper">
        <!-- Controls Bar -->
        <div class="controls-bar">
            <!-- Hamburger Menu -->
            <div class="hamburger-menu">
                <i class="fa fa-bars" id="hamburgerIcon"></i>
                <div class="menu-dropdown" id="menuDropdown">
                    <a href="index.php?page=shard_calc" <?php if ($page === 'shard_calc') echo 'class="active"'; ?>>Shard Calculator</a>
                    <a href="index.php?page=heroes" <?php if ($page === 'heroes') echo 'class="active"'; ?>>Heroes</a>
                </div>
            </div>

            <!-- Light/Dark Mode Toggle -->
            <div class="theme-toggle">
                <i id="themeToggleIcon" class="fa-regular fa-sun"></i>
            </div>
        </div>

        <!-- Main Content Container -->
        <div class="mt-2">
            <div class="main-container">
                <?php
                // Dynamically include the selected page
                include "templates/{$page}.php";
                ?>
            </div>
        </div>
    </div>

</div>

<?php
include 'templates/footer.php'; // Closes </body> and </html>
?>
