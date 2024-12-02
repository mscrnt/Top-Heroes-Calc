<?php
// get_meat_required.php

include_once __DIR__ . '/../includes/db_functions.php';

header('Content-Type: application/json'); // Return JSON data

// Get parameters from the query string
$currentLevel = isset($_GET['current_level']) ? (int)$_GET['current_level'] : 0;
$desiredLevel = isset($_GET['desired_level']) ? (int)$_GET['desired_level'] : 0;
$resourceName = isset($_GET['resource_name']) ? $_GET['resource_name'] : '';

// Check if levels are valid
if ($currentLevel && $desiredLevel && $currentLevel < $desiredLevel) {
    $totalMeatRequired = 0;
    $resource = getResourceByName($resourceName);

    if ($resource) {
        $resourceId = $resource['id'];

        // Calculate the total meat required for each level in the range
        for ($level = $currentLevel + 1; $level <= $desiredLevel; $level++) {
            $levelingData = getHeroLeveling($level, $resourceId);
            if ($levelingData) {
                $totalMeatRequired += $levelingData['meat_required'];
            } else {
                echo json_encode(['error' => "Meat data not found for level $level"]);
                exit;
            }
        }

        // Return the result as JSON
        echo json_encode(['total_meat_required' => $totalMeatRequired]);
    } else {
        echo json_encode(['error' => "Resource '$resourceName' not found"]);
    }
} else {
    echo json_encode(['error' => 'Invalid levels']);
}
