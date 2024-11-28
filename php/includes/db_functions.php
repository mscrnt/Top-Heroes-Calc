<?php
// db_functions.php

require_once __DIR__ . '/db.php';

/**
 * Get all heroes from the database.
 * @return array
 */
function getAllHeroes() {
    global $pdo;

    $stmt = $pdo->query("SELECT * FROM heroes");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get a specific hero by ID.
 * @param int $id
 * @return array|null
 */
function getHero($id) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT * FROM heroes WHERE id = :id");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get a targeted field (e.g., faction) for a specific hero by ID.
 * @param int $id
 * @param string $field
 * @return string|null
 */
function getHeroField($id, $field) {
    global $pdo;

    // Ensure the requested field exists in the table
    $validFields = ['name', 'roles', 'faction', 'attack_hp_values', 'rarity'];
    if (!in_array($field, $validFields)) {
        throw new InvalidArgumentException("Invalid field: $field");
    }

    $stmt = $pdo->prepare("SELECT $field FROM heroes WHERE id = :id");
    $stmt->execute(['id' => $id]);
    return $stmt->fetchColumn();
}

/**
 * Get a hero by name from the database.
 * @param string $name
 * @return array|null
 */
function getHeroByName($name) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT * FROM heroes WHERE name = :name");
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}


/**
 * Get roles associated with a specific hero.
 * @param int $heroId
 * @return array
 */
function getHeroRoles($heroId) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT r.name, r.icon, r.description
        FROM hero_roles hr
        JOIN roles r ON hr.role_id = r.id
        WHERE hr.hero_id = :hero_id
    ");
    $stmt->execute(['hero_id' => $heroId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}