document.addEventListener('DOMContentLoaded', () => {
    const factionDropdown = document.getElementById('factionDropdown');
    const heroContainer = document.getElementById('heroContainer');
    const factionTitle = document.getElementById('factionTitle');
    const previewContent = document.getElementById('previewContent');
    const modeToggleIcon = document.getElementById('modeToggleIcon');
    const heroDetailsSection = document.getElementById('heroDetails');
    const heroModal = document.createElement('div');

    let currentMode = 'tile'; // Default mode
    let selectedHeroIndex = 0; // Track selected hero's position
    let currentFactionHeroes = []; // Store heroes of the current faction

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
        const factionHeroes = heroesData[faction];
        if (!factionHeroes) {
            heroContainer.innerHTML = '<p>No heroes found for the selected faction.</p>';
            return;
        }

        // Flatten the heroes into a single array
        currentFactionHeroes = Object.entries(factionHeroes).flatMap(([rarity, heroes]) => heroes);

        if (currentMode === 'tile') {
            renderTileMode(factionHeroes, faction);
        } else {
            renderPreviewMode(factionHeroes, faction);
        }
    }

    function renderTileMode(factionHeroes, faction) {
        heroContainer.innerHTML = '';
        heroContainer.classList.remove('hidden');
        previewContent.classList.add('hidden');
        heroDetailsSection.classList.add('hidden');
    
        let currentIndex = 0; // Reset index for mapping

        Object.entries(factionHeroes).forEach(([rarity, heroes]) => {
            const rarityTitle = document.createElement('h3');
            rarityTitle.textContent = `${rarity} Heroes`;
            heroContainer.appendChild(rarityTitle);

            const heroGroup = document.createElement('div');
            heroGroup.className = 'hero-group';

            heroes.forEach((hero) => {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                heroCard.innerHTML = `<img src="/static/images/${faction}/${rarity}/${hero}.webp" alt="${hero}" data-index="${currentIndex}">`;

                // Attach the correct index to the event listener
                heroCard.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index, 10); // Safely parse data-index
                    openHeroModal(index, faction);
                });

                heroGroup.appendChild(heroCard);

                console.log(`Mapping hero: ${hero} to index: ${currentIndex}`);
                currentIndex++; // Increment index after each mapping
            });

            heroContainer.appendChild(heroGroup);
        });
    }

    function renderPreviewMode(factionHeroes, faction) {
        previewContent.innerHTML = '';
        heroContainer.classList.add('hidden');
        previewContent.classList.remove('hidden');
        heroDetailsSection.classList.add('hidden'); // Initially hide details section

        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';

        Object.entries(factionHeroes).forEach(([rarity, heroes]) => {
            heroes.forEach((hero) => {
                const previewCard = document.createElement('div');
                previewCard.className = 'preview-card';
                previewCard.innerHTML = `<img src="/static/images/${faction}/${rarity}/${hero}.webp" alt="${hero}" data-hero="${hero}" data-rarity="${rarity}">`;
                previewCard.addEventListener('click', () => selectHero(hero, faction, rarity));
                previewContainer.appendChild(previewCard);
            });
        });

        previewContent.appendChild(previewContainer);

        // Auto-select the first hero in preview mode
        const firstHero = Object.entries(factionHeroes)[0]?.[1]?.[0];
        if (firstHero) {
            selectHero(firstHero, faction, Object.keys(factionHeroes)[0]);
        }
    }

    function selectHero(hero, faction, rarity) {
        const heroDetails = document.getElementById('heroDetails');
        heroDetails.classList.remove('hidden');
        heroDetails.innerHTML = '<p>Loading...</p>';
    
        const previewCards = Array.from(previewContent.querySelectorAll('.preview-card'));
        const heroIndex = previewCards.findIndex(
            (card) => card.querySelector('img').alt === hero
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
    
            // Highlight selected hero
            previewCards.forEach((card) => card.classList.remove('selected'));
            selectedCard.classList.add('selected');
        }
    
        // Fetch and display hero details
        const heroSlug = hero.toLowerCase();
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
    
    

    function openHeroModal(index, faction) {
        console.log(`Attempting to open modal for index: ${index}`);
        console.log(`Current mode: ${currentMode}`);
        console.log(`Current faction heroes:`, currentFactionHeroes);
    
        if (currentMode !== 'tile') {
            console.warn(`Modal attempted to open in non-tile mode. Aborting.`);
            return; // Ensure modal only in tile mode
        }
    
        selectedHeroIndex = index;
        const selectedHero = currentFactionHeroes[selectedHeroIndex];
    
        console.log(`Selected hero index: ${selectedHeroIndex}`);
        console.log(`Selected hero: ${selectedHero}`);
        console.log(`Faction: ${faction}`);
        console.log(`Hero array length: ${currentFactionHeroes.length}`);
    
        if (!selectedHero) {
            console.error(
                `Undefined hero at index ${selectedHeroIndex}. Possible out-of-bounds access or mapping issue.`
            );
            return;
        }
    
        heroModal.style.display = 'flex'; // Show modal
        fetchHeroPage(selectedHero, faction);
    
        // Attach modal controls
        heroModal.querySelector('.modal-close').onclick = closeHeroModal;
        heroModal.querySelector('.modal-prev').onclick = () => navigateHero(-1, faction);
        heroModal.querySelector('.modal-next').onclick = () => navigateHero(1, faction);
    
        // Add keydown listener for modal navigation and close
        document.addEventListener('keydown', handleModalKeyEvents);
    }
    

    function closeHeroModal() {
        heroModal.style.display = 'none';
    }

    function navigateHero(direction, faction) {
        selectedHeroIndex = (selectedHeroIndex + direction + currentFactionHeroes.length) % currentFactionHeroes.length;
        const selectedHero = currentFactionHeroes[selectedHeroIndex];
        console.log(`Navigating to index: ${selectedHeroIndex}, Hero: ${selectedHero}`);
        fetchHeroPage(selectedHero, faction);
    }

    function closeHeroModal() {
        heroModal.style.display = 'none'; // Hide modal
        // Remove keydown listener
        document.removeEventListener('keydown', handleModalKeyEvents);
    }

    // Handle keydown events for modal
    function handleModalKeyEvents(event) {
        if (heroModal.style.display !== 'flex') return; // Ensure modal is open

        switch (event.key) {
            case 'Escape': // Close modal on Escape key
                console.log('Escape key pressed. Closing modal.');
                closeHeroModal();
                break;
            case 'ArrowLeft': // Navigate to previous hero on Left arrow key
                console.log('Left arrow key pressed. Navigating to previous hero.');
                navigateHero(-1, factionDropdown.value); // Use current faction
                break;
            case 'ArrowRight': // Navigate to next hero on Right arrow key
                console.log('Right arrow key pressed. Navigating to next hero.');
                navigateHero(1, factionDropdown.value); // Use current faction
                break;
            default:
                break;
        }
}

    function fetchHeroPage(hero, faction) {
        const modalHeroDetails = document.getElementById('modalHeroDetails');
        modalHeroDetails.innerHTML = '<p>Loading...</p>';

        if (!hero) {
            console.error(`Undefined hero at index ${selectedHeroIndex}`);
            modalHeroDetails.innerHTML = `<p>Error: Undefined hero.</p>`;
            return;
        }

        const heroSlug = hero.toLowerCase();
        const fetchURL = `/templates/hero_page.php?hero=${heroSlug}&faction=${faction.toLowerCase()}&page=gear`;

        console.log(`Fetching hero page: ${fetchURL}`);

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
                modalHeroDetails.innerHTML = `
                    <p>Error loading details for <strong>${heroSlug}</strong>.</p>
                    <p>Check if the file exists and the fetch URL is correct.</p>`;
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
                selectHero(nextHero, factionDropdown.value);
            } else if (event.key === 'ArrowLeft') {
                selectedHeroIndex =
                    (selectedHeroIndex - 1 + currentFactionHeroes.length) %
                    currentFactionHeroes.length;
                const prevHero = currentFactionHeroes[selectedHeroIndex];
                selectHero(prevHero, factionDropdown.value);
            }
        }
    });
    

    modeToggleIcon.addEventListener('click', toggleMode);

    renderHeroes('nature_heroes');

    factionDropdown.addEventListener('change', () => renderHeroes(factionDropdown.value));
});
