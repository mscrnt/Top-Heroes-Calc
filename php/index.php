<?php
// index.php
include 'templates/header.php'; // Includes <head>

// Handle page switching
$page = isset($_GET['page']) ? $_GET['page'] : 'shard_calc';
$allowed_pages = ['shard_calc', 'heroes']; // Add the new 'heroes' page here
if (!in_array($page, $allowed_pages)) {
    $page = 'shard_calc'; // Fallback to default page
}
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
