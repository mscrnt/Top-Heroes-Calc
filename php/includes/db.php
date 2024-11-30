<?php
// db.php

// Fetch the environment variables
$host = getenv('MYSQL_HOST') ?: 'mysql'; // Default to 'mysql' if not set
$dbname = getenv('MYSQL_DATABASE') ?: 'top_heroes'; // Default to 'top_heroes' if not set
$user = getenv('MYSQL_USER') ?: 'top_heroes'; // Default to 'top_heroes' if not set
$password = getenv('MYSQL_ROOT_PASSWORD') ?: 'top_heroes'; // Default to 'top_heroes' if not set
$port = getenv('MYSQL_PORT') ?: '3306'; // Default to 3306 if not set (MySQL default port)

// Try to establish a database connection using PDO
try {

    // Create a PDO instance using environment variables
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $password);

    // Set PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
