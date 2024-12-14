<?php
// includes/header.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title> <!-- Use the dynamic title -->

    <!-- External CSS -->
    <link rel="stylesheet" href="/static/css/all.min.css">

    <!-- Internal CSS -->
    <link rel="stylesheet" href="/static/css/style.css">

    <!-- Favicon -->
    <link rel="icon" href="/favicon-32x32.png" sizes="16x16" type="image/png">

    <!-- External JS -->
    <script src="/static/js/app.js" defer></script>
    <script src="/static/js/matomo.js" defer></script> <!-- Matomo -->
    <script src="/static/js/adsense.js" defer></script> <!-- Google AdSense -->
    <script src="/static/js/logrocket.js" defer></script> <!-- LogRocket -->
</head>
<body>
