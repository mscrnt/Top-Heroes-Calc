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
    faction VARCHAR(50) NOT NULL,
    attack_hp_values JSON NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    card VARCHAR(255)
);

-- Create hero_roles table (junction table)
CREATE TABLE IF NOT EXISTS hero_roles (
    hero_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (hero_id, role_id),
    FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
