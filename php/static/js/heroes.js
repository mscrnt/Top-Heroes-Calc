document.addEventListener('DOMContentLoaded', () => {
    const factionDropdown = document.getElementById('factionDropdown');
    const heroContainer = document.getElementById('heroContainer');
    const factionTitle = document.getElementById('factionTitle');

    function renderHeroes(faction) {
        const factionHeroes = heroesData[faction];
        if (!factionHeroes) {
            heroContainer.innerHTML = '<p>No heroes found for the selected faction.</p>';
            return;
        }

        // Update faction title
        factionTitle.textContent = faction
            .replace('_', ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase()) + ' Heroes';

        // Clear existing heroes
        heroContainer.innerHTML = '';

        // Render heroes grouped by rarity
        Object.entries(factionHeroes).forEach(([rarity, heroes]) => {
            const rarityTitle = document.createElement('h3');
            rarityTitle.textContent = `${rarity} Heroes`;
            heroContainer.appendChild(rarityTitle);

            const heroGroup = document.createElement('div');
            heroGroup.className = 'hero-group';

            heroes.forEach((hero) => {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                heroCard.innerHTML = `<img src="/static/images/${faction}/${rarity}/${hero}.webp" alt="${hero}">`;
                heroGroup.appendChild(heroCard);
            });

            heroContainer.appendChild(heroGroup);
        });
    }

    // Initial render
    renderHeroes('nature_heroes');

    // Handle dropdown change
    factionDropdown.addEventListener('change', () => {
        const selectedFaction = factionDropdown.value;
        renderHeroes(selectedFaction);
    });
});
