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

/**
 * Get all resources from the database.
 * @return array
 */
function getAllResources() {
    global $pdo;

    $stmt = $pdo->query("SELECT * FROM resources");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get a resource by name.
 * @param string $name
 * @return array|null
 */
function getResourceByName($name) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT * FROM resources WHERE name = :name");
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get icons for a specific resource.
 * @param int $resourceId
 * @return array
 */
function getResourceIcons($resourceId) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT ri.type, ri.icon_path
        FROM resource_icons ri
        WHERE ri.resource_id = :resource_id
    ");
    $stmt->execute(['resource_id' => $resourceId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get hero leveling information.
 * @param int $level
 * @param int $resourceId
 * @return array|null
 */
function getHeroLeveling($level, $resourceId) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT level, meat_required
        FROM hero_leveling
        WHERE level = :level AND resource_id = :resource_id
    ");
    $stmt->execute(['level' => $level, 'resource_id' => $resourceId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get the required meat for a hero leveling.
 * @param int $level
 * @param string $resourceName
 * @return string|null
 */
function getHeroLevelingMeat($level, $resourceName) {
    global $pdo;

    // Get the resource ID for the given resource name
    $resource = getResourceByName($resourceName);
    if (!$resource) {
        throw new InvalidArgumentException("Resource '$resourceName' not found.");
    }

    $resourceId = $resource['id'];

    // Get hero leveling data for the specified level and resource
    $stmt = $pdo->prepare("
        SELECT meat_required
        FROM hero_leveling
        WHERE level = :level AND resource_id = :resource_id
    ");
    $stmt->execute(['level' => $level, 'resource_id' => $resourceId]);
    return $stmt->fetchColumn();
}

/**
 * Get all hero leveling data for a specific resource.
 * @param int $resourceId
 * @return array
 */
function getAllHeroLevels($resourceId) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT level, meat_required
        FROM hero_leveling
        WHERE resource_id = :resource_id
        ORDER BY level ASC
    ");
    $stmt->execute(['resource_id' => $resourceId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get all buildings and their maximum levels.
 * @return array
 */
function getAllBuildingsWithMaxLevels() {
    global $pdo;

    $stmt = $pdo->query("SELECT id, name, max_level FROM buildings ORDER BY name ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Check if a building is available at a specific castle level.
 * @param int $buildingId
 * @param int $castleLevel
 * @return bool
 */
function isBuildingAvailableAtCastleLevel($buildingId, $castleLevel) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM building_levels
        WHERE building_id = :building_id AND castle_level = :castle_level
    ");
    $stmt->execute(['building_id' => $buildingId, 'castle_level' => $castleLevel]);
    return $stmt->fetchColumn() > 0;
}

/**
 * Get hero leveling costs for a specific resource.
 * @param string $resourceName
 * @return array
 */
function getHeroLevelingCostsByResource($resourceName) {
    global $pdo;

    $resource = getResourceByName($resourceName);
    if (!$resource) {
        throw new InvalidArgumentException("Resource '$resourceName' not found.");
    }

    $stmt = $pdo->prepare("
        SELECT 
            hl.level,
            hl.meat_required
        FROM hero_leveling hl
        WHERE hl.resource_id = :resource_id
        ORDER BY hl.level ASC
    ");
    $stmt->execute(['resource_id' => $resource['id']]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get resource requirements for a specific castle level.
 * @param int $castleLevel
 * @return array|null
 */
function getResourceRequirementsForCastleLevel($castleLevel) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT 
            required_wood,
            required_stone
        FROM castle_levels
        WHERE level = :castle_level
    ");
    $stmt->execute(['castle_level' => $castleLevel]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get all building levels for a specific building.
 * @param int $buildingId
 * @return array
 */
function getAllBuildingLevels($buildingId) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT 
            bl.level AS building_level,
            cl.level AS castle_level
        FROM building_levels bl
        JOIN castle_levels cl ON bl.castle_level = cl.level
        WHERE bl.building_id = :building_id
        ORDER BY bl.level ASC
    ");
    $stmt->execute(['building_id' => $buildingId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get buildings unlocked at a specific castle level.
 * @param int $castleLevel
 * @return array
 */
function getBuildingsUnlockedAtCastleLevel($castleLevel) {
    global $pdo;

    $stmt = $pdo->prepare("
        SELECT 
            cb.building_id,
            b.name AS building_name,
            cb.building_level
        FROM castle_building_unlocks cb
        JOIN buildings b ON cb.building_id = b.id
        WHERE cb.castle_level = :castle_level
        ORDER BY cb.building_level ASC
    ");
    $stmt->execute(['castle_level' => $castleLevel]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get all castle levels with their requirements, unlocked buildings, and level caps.
 * @return array
 */
function getAllCastleLevels() {
    global $pdo;

    $stmt = $pdo->query("
        SELECT 
            cl.level AS castle_level,
            cl.required_wood,
            cl.required_stone,
            cl.level_cap,
            b1.name AS building_a_name,
            b2.name AS building_b_name
        FROM castle_levels cl
        LEFT JOIN buildings b1 ON cl.building_a_id = b1.id
        LEFT JOIN buildings b2 ON cl.building_b_id = b2.id
        ORDER BY cl.level ASC
    ");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

