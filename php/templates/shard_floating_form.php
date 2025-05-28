<script src="/static/js/shard_form_float.js" defer></script>

<div class="floating-shard-form" aria-label="Shard Form">
  <form class="shard-form">
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
        <input type="text" class="form-control" id="currentLevel" placeholder="Example: 1.3" />
        <small class="form-text">Format: Level.Step (Use '1.3' for level 1, step 3).</small>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-primary" id="calculateButton">Calculate</button>
      <button type="button" class="btn btn-secondary" id="resetButton">Reset</button>
    </div>
  </form>

  <div class="floating-shard-display" aria-label="Shard Display">
    <img src="/static/images/resources/shard.webp" alt="Shard Icon" />
    <strong><span id="result">500</span></strong>
  </div>
</div>
