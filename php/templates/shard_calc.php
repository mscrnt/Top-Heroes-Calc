<?php
// templates/shard_calc.php
?>
<link rel="stylesheet" href="/static/css/shard_calc.css">
<script src="/static/js/shard_calc.js" defer></script>

<center>
    <p>This tool helps you figure out exactly how many shards you’ll need to max out your legendary and mythic heroes in <strong>Top Heroes</strong>. Click on a star level or enter your hero level to calculate the shards.</p>
</center>    
<form>
    <div class="form-row">
        <div class="form-group">
            <label for="heroType">Select Hero Type:</label>
            <select class="form-control" id="heroType">
                <option value="legendary" selected>Legendary</option>
                <option value="mythic">Mythic</option>
            </select>
        </div>
        <div class="form-group">
            <label for="currentLevel">Enter Current Hero Level:</label>
            <input type="text" class="form-control" id="currentLevel" placeholder="Example: 1.3">
            <small class="form-text">Format: Level.Step (Use '1.3' for level 1, step 3).</small>
        </div>
    </div>
    <button type="button" class="btn btn-primary" id="calculateButton">Calculate</button>
    <button type="button" class="btn btn-secondary" id="resetButton">Reset</button>
</form>

<div class="floating-shard-display">
    <p>
        <img src="static/images/resources/shard.webp" alt="Shard Icon" style="width: 64px; height: 64px; vertical-align: middle;">
    </p>
    <p>
        <strong><span id="result"></span><br>REQUIRED</strong>
    </p>

</div>

<!-- PHP Logic to Generate Charts -->
<?php
function generateStars($heroType, $level, $starCount, $shardPerStep, $groupClass) {
    $stars = '';
    for ($i = 1; $i <= $starCount; $i++) {
        $stars .= "
        <div class='star-container $groupClass'>
            <i id='{$heroType}-star-$level-$i' class='fas fa-star empty-star $groupClass' data-level='$level' data-shards='$shardPerStep'></i>
        </div>";
    }
    return $stars;
}

$shardData = [
    'legendary' => [
        'title' => 'Legendary Shard Requirements',
        'groups' => [50, 150, 300],
        'Shard per Step' => [1, 1, 2, 2, 4, 6, 4, 4, 8, 8, 16, 4, 8, 16, 16],
        'Per star' => [5, 5, 10, 10, 20, 30, 20, 20, 40, 40, 80, 20, 40, 80, 80],
    ],
    'mythic' => [
        'title' => 'Mythic Shard Requirements',
        'groups' => [100, 300, 600],
        'Shard per Step' => [2, 2, 4, 4, 8, 12, 8, 8, 16, 16, 32, 8, 16, 32, 32],
        'Per star' => [10, 10, 20, 20, 40, 60, 40, 40, 80, 80, 160, 40, 80, 160, 160],
    ]
];

foreach ($shardData as $type => $data) {
    $displayStyle = $type === 'legendary' ? 'block' : 'none';
    echo "<div id='{$type}Chart' class='shard-chart' style='display:{$displayStyle};'>";
    echo "<h3>{$data['title']}</h3>";
    echo "<table>";
    echo "<tr><th>Level</th><th>Star</th><th>Shard per Step</th><th>Per Star</th><th>Overall</th></tr>";

    $levelIndex = 0;
    $grandTotal = 0;

    foreach ($data['groups'] as $groupIndex => $groupTotal) {
        $groupClass = "group-" . ($groupIndex + 1);
        $groupRows = "";
        $levelsInGroup = 5;

        for ($level = 1; $level <= $levelsInGroup; $level++) {
            if ($levelIndex < count($data['Shard per Step'])) {
                $shardPerStep = $data['Shard per Step'][$levelIndex];
                $perStar = $data['Per star'][$levelIndex];
                $stars = generateStars($type, $levelIndex + 1, ($levelIndex % 5) + 1, $shardPerStep, $groupClass);

                $groupRows .= "<tr class='$groupClass'>";
                $groupRows .= "<td class='level-cell'>" . ($levelIndex + 1) . "</td>";
                
                // Star cell with overlay
                $groupRows .= "<td class='star-cell' data-level='" . ($levelIndex + 1) . "' data-shards='$shardPerStep'>";
                $groupRows .= "<div class='progress-overlay' id='{$type}-progress-" . ($levelIndex + 1) . "'></div>";
                $groupRows .= "<div class='star-container'>$stars</div></td>";
                
                $groupRows .= "<td class='shards-per-step'>{$shardPerStep}</td>";
                $groupRows .= "<td class='per-star'>{$perStar}</td>";
                $groupRows .= ($level === 1 ? "<td class='overall' rowspan='5'>{$groupTotal}</td>" : "");
                $groupRows .= "</tr>";

                $levelIndex++;
            }
        }

        $grandTotal += $groupTotal;
        echo $groupRows;
    }

    echo "<tr class='total-row'>";
    echo "<td colspan='4'>Total</td>";
    echo "<td>$grandTotal</td>";
    echo "</tr>";

    echo "</table></div>";
}
?>
