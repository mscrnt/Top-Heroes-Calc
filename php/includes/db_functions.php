<?php
// db_functions.php

require_once __DIR__ . '/db.php';

/**
 * Get all heroes from the database, including faction names.
 * @return array
 */
function getAllHeroes() {
    global $pdo;

    $stmt = $pdo->query("
        SELECT 
            heroes.id,
            heroes.name,
            factions.name AS faction, -- Fetch faction name
            heroes.attack_hp_values,
            heroes.rarity,
            heroes.icon,
            heroes.card
        FROM heroes
        JOIN factions ON heroes.faction_id = factions.id
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


/**
 * Get a specific hero by ID.
 * @param int $id
 * @return array|null
 */
function getHero($id) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT h.*, f.name AS faction_name, f.color AS faction_color, f.strong AS faction_strong, f.weak AS faction_weak, f.icon AS faction_icon
        FROM heroes h
        JOIN factions f ON h.faction_id = f.id
        WHERE h.id = :id
    ");
    $stmt->execute(['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get a specific field for a hero by ID.
 * @param int $id
 * @param string $field
 * @return string|null
 */
function getHeroField($id, $field) {
    global $pdo;

    // Ensure the requested field exists in the table
    $validFields = ['name', 'faction_id', 'attack_hp_values', 'rarity', 'icon', 'card'];
    if (!in_array($field, $validFields)) {
        throw new InvalidArgumentException("Invalid field: $field");
    }

    $stmt = $pdo->prepare("SELECT $field FROM heroes WHERE id = :id");
    $stmt->execute(['id' => $id]);
    return $stmt->fetchColumn();
}

/**
 * Get a hero by name, including faction details.
 * @param string $name
 * @return array|null
 */
function getHeroByName($name) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT 
            heroes.*,
            factions.name AS faction,
            factions.color AS faction_color,
            factions.icon AS faction_icon
        FROM heroes
        JOIN factions ON heroes.faction_id = factions.id
        WHERE heroes.name = :name
    ");
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

/**
 * Get all factions from the database.
 * @return array
 */
function getAllFactions() {
    global $pdo;

    $stmt = $pdo->query("SELECT * FROM factions");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get a faction by name.
 * @param string $name
 * @return array|null
 */
function getFactionByName($name) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT * FROM factions WHERE name = :name");
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get faction advantages (strong/weak) for a specific faction.
 * @param string $factionName
 * @return array|null
 */
function getFactionAdvantages($factionName) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT strong, weak 
        FROM factions 
        WHERE name = :name
    ");
    $stmt->bindParam(':name', $factionName, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Determine if one faction is strong or weak against another.
 * @param string $faction1
 * @param string $faction2
 * @return string
 */
function checkFactionMatchup($faction1, $faction2) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT 
            CASE 
                WHEN strong = :faction2 THEN 'strong'
                WHEN weak = :faction2 THEN 'weak'
                ELSE 'neutral'
            END AS matchup
        FROM factions
        WHERE name = :faction1
    ");
    $stmt->execute(['faction1' => $faction1, 'faction2' => $faction2]);
    return $stmt->fetchColumn();
}
