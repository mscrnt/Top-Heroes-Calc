<script src="/static/js/shard_form_float.js" defer></script>

<div class="floating-shard-form" aria-label="Shard Form">
  <form class="shard-form">
    <div class="form-row">
      <div class="form-group">
        <label for="heroType">Hero Type:</label>
        <select class="form-control" id="heroType">
          <option value="legendary" selected>Legendary</option>
          <option value="mythic">Mythic</option>
        </select>
      </div>

      <div class="form-group">
        <label for="currentLevel">Current Hero Level:</label>
        <input
          type="text"
          class="form-control"
          id="currentLevel"
          placeholder="Example: 1.3"
        />
      </div>
    </div>

    <div class="form-actions">
      <!-- left-aligned display -->
      <div class="floating-shard-display" aria-label="Shard Display">
        <img src="/static/images/resources/shard.webp" alt="Shard Icon" />
        <strong><span id="result">500</span></strong>
      </div>

      <!-- right-aligned button group -->
      <div class="button-group">
        <button
          type="button"
          class="btn btn-primary"
          id="calculateButton"
        >
          Calculate
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          id="resetButton"
        >
          Reset
        </button>
      </div>
    </div>
  </form>
</div>
