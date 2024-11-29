document.addEventListener('DOMContentLoaded', () => {
    const factionDropdown = document.getElementById('factionDropdown');
    const heroContainer = document.getElementById('heroContainer');
    const previewContent = document.getElementById('previewContent');
    const modeToggleIcon = document.getElementById('modeToggleIcon');
    const heroDetailsSection = document.getElementById('heroDetails');
    const heroModal = document.createElement('div');

    let currentMode = 'tile'; // Default mode
    let selectedHeroIndex = 0; // Track selected hero's position
    let currentFactionHeroes = []; // Store heroes of the current faction

    // Define the rarity order
    const rarityOrder = ['Mythic Heroes', 'Legendary Heroes', 'Epic Heroes', 'Rare Heroes'];

    // Create modal element for tile mode
    heroModal.id = 'heroModal';
    heroModal.className = 'hidden';
    heroModal.innerHTML = `
        <button class="modal-close">
            <i class="fa-regular fa-circle-xmark"></i>
        </button>
        <button class="modal-prev">&larr;</button>
        <button class="modal-next">&rarr;</button>
        <div class="modal-content">
            <div id="modalHeroDetails">
                <p>Loading...</p>
            </div>
        </div>
    `;
    document.body.appendChild(heroModal);

    const modalContent = heroModal.querySelector('.modal-content');
    heroModal.style.display = 'none'; // Ensure modal starts hidden

    // Check if on mobile and default to preview mode
    if (window.matchMedia('(max-width: 768px)').matches) {
        currentMode = 'preview';
        modeToggleIcon.classList.remove('fa-toggle-off');
        modeToggleIcon.classList.add('fa-toggle-on');
    }

    function renderHeroes(faction) {
        let factionHeroes = heroesData[faction];
    
        // Combine all factions if "all_heroes" is selected
        if (faction === 'all_heroes') {
            factionHeroes = {};
            for (const key in heroesData) {
                if (key !== 'all_heroes') {
                    // Merge heroes by rarity
                    for (const rarity in heroesData[key]) {
                        if (!factionHeroes[rarity]) {
                            factionHeroes[rarity] = [];
                        }
                        factionHeroes[rarity] = factionHeroes[rarity].concat(heroesData[key][rarity]);
                    }
                }
            }
        }
    
        // If no heroes exist, display a message
        if (!factionHeroes || Object.keys(factionHeroes).length === 0) {
            heroContainer.innerHTML = '<p>No heroes found for the selected faction.</p>';
            return;
        }
    
        // Flatten heroes into a single array for navigation
        currentFactionHeroes = Object.entries(factionHeroes).flatMap(([rarity, heroes]) => heroes);
    
        // Render based on the current mode
        if (currentMode === 'tile') {
            renderTileMode(factionHeroes);
        } else {
            renderPreviewMode(factionHeroes);
        }
    }
    
    

    function renderTileMode(factionHeroes) {
        heroContainer.innerHTML = '';
        heroContainer.classList.remove('hidden');
        previewContent.classList.add('hidden');
        heroDetailsSection.classList.add('hidden');
    
        let currentIndex = 0;
    
        // Create a sorted array of rarities based on rarityOrder
        const sortedRarities = rarityOrder
            .map((rarity) => {
                // Match rarity from rarityOrder with keys in factionHeroes
                const matchingKey = Object.keys(factionHeroes).find((key) => key.toLowerCase().includes(rarity.toLowerCase().split(' ')[0]));
                return matchingKey ? [matchingKey, factionHeroes[matchingKey]] : null;
            })
            .filter(Boolean); // Remove null values if no match is found
    
        // Flatten sorted heroes into currentFactionHeroes for proper navigation order
        currentFactionHeroes = [];
    
        // Render the heroes in sorted order
        sortedRarities.forEach(([rarity, heroes]) => {
            if (!heroes || heroes.length === 0) return; // Skip if no heroes exist for this rarity
    
            const rarityTitle = document.createElement('h3');
            rarityTitle.textContent = rarity; // Use the matched key as the title
            heroContainer.appendChild(rarityTitle);
    
            const heroGroup = document.createElement('div');
            heroGroup.className = 'hero-group';
    
            heroes.forEach((hero) => {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                heroCard.innerHTML = `
                    <img src="${hero.card}" alt="${hero.name}" data-index="${currentIndex}">
                `;
    
                heroCard.addEventListener('click', () => openHeroModal(currentIndex, hero));
    
                heroGroup.appendChild(heroCard);
                currentFactionHeroes.push(hero); // Update currentFactionHeroes in sorted order
                currentIndex++;
            });
    
            heroContainer.appendChild(heroGroup);
        });
    }
    

    function renderPreviewMode(factionHeroes) {
        previewContent.innerHTML = '';
        heroContainer.classList.add('hidden');
        previewContent.classList.remove('hidden');
        heroDetailsSection.classList.add('hidden'); // Initially hide details section
    
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
    
        // Sort based on rarityOrder
        const sortedRarities = rarityOrder
            .map((rarity) => {
                const matchingKey = Object.keys(factionHeroes).find((key) => key.toLowerCase().includes(rarity.toLowerCase().split(' ')[0]));
                return matchingKey ? [matchingKey, factionHeroes[matchingKey]] : null;
            })
            .filter(Boolean); // Remove null values
    
        // Flatten sorted heroes into currentFactionHeroes for proper navigation order
        currentFactionHeroes = [];
    
        sortedRarities.forEach(([rarity, heroes]) => {
            if (!heroes || heroes.length === 0) return; // Skip if no heroes exist for this rarity
    
            heroes.forEach((hero) => {
                const previewCard = document.createElement('div');
                previewCard.className = 'preview-card';
                previewCard.innerHTML = `
                    <img src="${hero.card}" alt="${hero.name}" data-hero="${hero.name}">
                `;
                previewCard.addEventListener('click', () => selectHero(hero));
                previewContainer.appendChild(previewCard);
                currentFactionHeroes.push(hero); // Update currentFactionHeroes in sorted order
            });
        });
    
        previewContent.appendChild(previewContainer);
    
        // Auto-select the first hero in preview mode
        const firstHero = currentFactionHeroes[0];
        if (firstHero) {
            selectHero(firstHero);
        }
    }
    
    

    function selectHero(hero) {
        const heroDetails = document.getElementById('heroDetails');
        heroDetails.classList.remove('hidden');
        heroDetails.innerHTML = '<p>Loading...</p>';
        
        // Find the selected card in preview mode
        const previewCards = Array.from(previewContent.querySelectorAll('.preview-card'));
        const heroIndex = previewCards.findIndex(
            (card) => card.querySelector('img').alt === hero.name
        );
        selectedHeroIndex = heroIndex;
    
        // Scroll to center the selected hero in the row
        const previewContainer = previewContent.querySelector('.preview-container');
        const selectedCard = previewCards[selectedHeroIndex];
        if (selectedCard) {
            const cardOffset = selectedCard.offsetLeft;
            const containerWidth = previewContainer.offsetWidth;
            const cardWidth = selectedCard.offsetWidth;
            const scrollPosition = Math.max(
                0,
                cardOffset - containerWidth / 2 + cardWidth / 2
            );
            previewContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
    
            // Highlight selected hero by adding an outline
            previewCards.forEach((card) => card.classList.remove('selected'));
            selectedCard.classList.add('selected');
        }
    
        // Display hero details in the sidebar
        heroDetails.innerHTML = `
            <img src="${hero.icon}" alt="${hero.name}">
            <h2>${hero.name}</h2>
            <p>Rarity: ${hero.rarity}</p>
        `;
    
        // Fetch and update additional details asynchronously, if needed
        const heroSlug = hero.name.toLowerCase();
        const fetchURL = `/templates/hero_page.php?hero=${heroSlug}&page=gear`;
    
        fetch(fetchURL)
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to load page for ${heroSlug}`);
                return response.text();
            })
            .then((html) => {
                heroDetails.innerHTML = html;
            })
            .catch((error) => {
                console.error(error);
                heroDetails.innerHTML = `<p>Error loading details for ${heroSlug}.</p>`;
            });
    }
    
    
    

    function openHeroModal(index, hero) {
        selectedHeroIndex = index;

        heroModal.style.display = 'flex'; // Show modal
        document.body.classList.add('modal-open'); // Prevent scrolling behind modal

        fetchHeroPage(hero);

        heroModal.querySelector('.modal-close').onclick = closeHeroModal;
        heroModal.querySelector('.modal-prev').onclick = () => navigateHero(-1);
        heroModal.querySelector('.modal-next').onclick = () => navigateHero(1);

        document.addEventListener('keydown', handleModalKeyEvents); // Attach keydown listener
    }
    

    function closeHeroModal() {
        heroModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Restore scrolling
        document.removeEventListener('keydown', handleModalKeyEvents); // Detach keydown listener
    }

    function navigateHero(direction) {
        selectedHeroIndex = (selectedHeroIndex + direction + currentFactionHeroes.length) % currentFactionHeroes.length;
        const selectedHero = currentFactionHeroes[selectedHeroIndex];
        fetchHeroPage(selectedHero);
    }

    function closeHeroModal() {
        heroModal.style.display = 'none'; // Hide modal
        // Remove keydown listener
        document.removeEventListener('keydown', handleModalKeyEvents);
    }

    // Handle keydown events for modal
    function handleModalKeyEvents(event) {
        if (heroModal.style.display !== 'flex') return;

        switch (event.key) {
            case 'Escape': // Close modal on Escape key
                closeHeroModal();
                break;
            case 'ArrowLeft': // Navigate to previous hero
                navigateHero(-1);
                break;
            case 'ArrowRight': // Navigate to next hero
                navigateHero(1);
                break;
        }
    }

    function fetchHeroPage(hero) {
        const modalHeroDetails = document.getElementById('modalHeroDetails');
        modalHeroDetails.innerHTML = '<p>Loading...</p>';

        if (!hero) {
            console.error('Undefined hero.');
            modalHeroDetails.innerHTML = '<p>Error: Undefined hero.</p>';
            return;
        }

        const heroSlug = hero.name.toLowerCase();
        const fetchURL = `/templates/hero_page.php?hero=${heroSlug}`;

        fetch(fetchURL)
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to load page for ${heroSlug}`);
                return response.text();
            })
            .then((html) => {
                modalHeroDetails.innerHTML = html;
            })
            .catch((error) => {
                console.error(error);
                modalHeroDetails.innerHTML = `<p>Error loading details for ${heroSlug}.</p>`;
            });
    }

    function toggleMode() {
        currentMode = currentMode === 'tile' ? 'preview' : 'tile';
        modeToggleIcon.classList.toggle('fa-toggle-off');
        modeToggleIcon.classList.toggle('fa-toggle-on');
        renderHeroes(factionDropdown.value);
    }

    document.addEventListener('keydown', (event) => {
        if (currentMode === 'preview') {
            if (event.key === 'ArrowRight') {
                selectedHeroIndex = (selectedHeroIndex + 1) % currentFactionHeroes.length;
                const nextHero = currentFactionHeroes[selectedHeroIndex];
                selectHero(nextHero);
            } else if (event.key === 'ArrowLeft') {
                selectedHeroIndex = (selectedHeroIndex - 1 + currentFactionHeroes.length) % currentFactionHeroes.length;
                const prevHero = currentFactionHeroes[selectedHeroIndex];
                selectHero(prevHero);
            }
        }
    });

    modeToggleIcon.addEventListener('click', toggleMode);
    factionDropdown.addEventListener('change', () => renderHeroes(factionDropdown.value));

    renderHeroes('nature_heroes'); // Default faction
});