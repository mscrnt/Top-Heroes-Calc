-- Create factions table
CREATE TABLE IF NOT EXISTS factions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    strong VARCHAR(255) NOT NULL,
    weak VARCHAR(255) NOT NULL,  
    color VARCHAR(7) NOT NULL, 
    icon VARCHAR(255) NOT NULL
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Create heroes table
CREATE TABLE IF NOT EXISTS heroes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    faction_id INT NOT NULL,
    attack_hp_values JSON NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    card VARCHAR(255),
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE
);

-- Create hero_roles table (junction table)
CREATE TABLE IF NOT EXISTS hero_roles (
    hero_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (hero_id, role_id),
    FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create resource_icons table
CREATE TABLE IF NOT EXISTS resource_icons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    icon_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create hero_leveling table
CREATE TABLE IF NOT EXISTS hero_leveling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL,
    meat_required INT NOT NULL, 
    resource_id INT NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_level_meat_required (level, meat_required)
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    max_level INT NOT NULL
);

-- Create castle_levels table
CREATE TABLE IF NOT EXISTS castle_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL UNIQUE,
    required_wood INT DEFAULT NULL,
    required_stone INT DEFAULT NULL,
    wood_resource_id INT DEFAULT NULL,
    stone_resource_id INT DEFAULT NULL,
    level_cap INT DEFAULT NULL,
    building_a_id INT DEFAULT NULL,
    building_b_id INT DEFAULT NULL,
    FOREIGN KEY (wood_resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (stone_resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (building_a_id) REFERENCES buildings(id) ON DELETE SET NULL,
    FOREIGN KEY (building_b_id) REFERENCES buildings(id) ON DELETE SET NULL
);


-- Create building_levels table
CREATE TABLE IF NOT EXISTS building_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    castle_level INT NOT NULL,
    level INT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (castle_level) REFERENCES castle_levels(level) ON DELETE CASCADE,
    UNIQUE KEY unique_building_castle_level (building_id, castle_level)
);

-- Create castle_building_unlocks table
CREATE TABLE IF NOT EXISTS castle_building_unlocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    castle_level INT NOT NULL,
    building_id INT NOT NULL,
    building_level INT NOT NULL,
    FOREIGN KEY (castle_level) REFERENCES castle_levels(level) ON DELETE CASCADE,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_castle_building_unlock (castle_level, building_id, building_level)
);
