// php/static/js/heroes.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('heroes:DOMContentLoaded');

    // Grab DOM elements
    const factionDropdown = document.getElementById('factionDropdown');
    const heroContainer = document.getElementById('heroContainer');
    const previewContent = document.getElementById('previewContent');
    const modeToggleIcon = document.getElementById('modeToggleIcon');
    const heroDetailsSection = document.getElementById('heroDetails');

    console.log('heroes:ElementsRetrieved', {
        factionDropdown,
        heroContainer,
        previewContent,
        modeToggleIcon,
        heroDetailsSection
    });

    if (!factionDropdown || !heroContainer || !previewContent || !modeToggleIcon || !heroDetailsSection) {
        console.error('heroes:MissingElements');
    }

    let currentMode = 'tile'; // Default mode
    let selectedHeroIndex = 0; // Track selected hero's position
    let currentFactionHeroes = []; // Store heroes of the current faction

    // Define the rarity order
    const rarityOrder = ['Mythic Heroes', 'Legendary Heroes', 'Epic Heroes', 'Rare Heroes'];
    console.log('heroes:rarityOrder', rarityOrder);

    // Log the PHP-generated data object
    console.log('heroes:heroesData', heroesData);
    if (!heroesData) {
        console.error('heroes:heroesDataUndefined');
    }

    // Create modal element for tile mode
    const heroModal = document.createElement('div');
    heroModal.id = 'heroModal';
    heroModal.className = 'hidden';
    heroModal.innerHTML =
        `<button class="modal-close">
            <i class="fa-regular fa-circle-xmark"></i>
        </button>
        <button class="modal-prev">&larr;</button>
        <button class="modal-next">&rarr;</button>
        <div class="modal-content">
            <div id="modalHeroDetails">
                <p>Loading...</p>
            </div>
        </div>`;
    document.body.appendChild(heroModal);
    console.log('heroes:ModalAppended');

    heroModal.style.display = 'none'; // Ensure modal starts hidden

    // Check if on mobile and default to preview mode
    if (window.matchMedia('(max-width: 768px)').matches) {
        currentMode = 'preview';
        modeToggleIcon.classList.remove('fa-toggle-off');
        modeToggleIcon.classList.add('fa-toggle-on');
        console.log('heroes:SwitchedToPreviewMobile');
    }

    function renderHeroes(faction) {
        console.log(`heroes:renderHeroes:${faction}`);

        let factionHeroes = heroesData[faction];
        console.log(`heroes:FactionHeroesInitial:${faction}`, factionHeroes);

        // Combine all factions if "all_heroes" is selected
        if (faction === 'all_heroes') {
            factionHeroes = {};
            for (const key in heroesData) {
                if (key !== 'all_heroes') {
                    for (const rarity in heroesData[key]) {
                        if (!factionHeroes[rarity]) {
                            factionHeroes[rarity] = [];
                        }
                        factionHeroes[rarity] = factionHeroes[rarity].concat(heroesData[key][rarity]);
                    }
                }
            }
            console.log('heroes:CombinedFactionHeroes');
        }

        // If no heroes exist, display a message
        if (!factionHeroes || Object.keys(factionHeroes).length === 0) {
            console.warn(`heroes:NoHeroes:${faction}`);
            heroContainer.innerHTML = '<p>No heroes found for the selected faction.</p>';
            return;
        }

        // Flatten heroes into a single array for navigation
        currentFactionHeroes = Object.entries(factionHeroes).flatMap(([rarity, heroes]) => heroes);
        console.log('heroes:currentFactionHeroesCount', currentFactionHeroes.length);

        // Render based on the current mode
        if (currentMode === 'tile') {
            console.log('heroes:RenderingTileMode');
            renderTileMode(factionHeroes);
        } else {
            console.log('heroes:RenderingPreviewMode');
            renderPreviewMode(factionHeroes);
        }
    }

    function renderTileMode(factionHeroes) {
        console.log('heroes:renderTileMode');
        heroContainer.innerHTML = '';
        heroContainer.classList.remove('hidden');
        previewContent.classList.add('hidden');
        heroDetailsSection.classList.add('hidden');

        let currentIndex = 0;

        // Create a sorted array of rarities based on rarityOrder
        const sortedRarities = rarityOrder
            .map((rarity) => {
                const matchingKey = Object.keys(factionHeroes).find((key) =>
                    key.toLowerCase().includes(rarity.toLowerCase().split(' ')[0])
                );
                return matchingKey ? [matchingKey, factionHeroes[matchingKey]] : null;
            })
            .filter(Boolean);
        console.log('heroes:sortedRarities', sortedRarities.map(([r]) => r));

        // Flatten sorted heroes into currentFactionHeroes for proper navigation order
        currentFactionHeroes = [];

        // Render the heroes in sorted order
        sortedRarities.forEach(([rarity, heroes]) => {
            if (!heroes || heroes.length === 0) {
                console.warn(`heroes:NoHeroesForRarity:${rarity}`);
                return;
            }

            const rarityTitle = document.createElement('h3');
            rarityTitle.textContent = rarity;
            heroContainer.appendChild(rarityTitle);

            const heroGroup = document.createElement('div');
            heroGroup.className = 'hero-group';

            heroes.forEach((hero) => {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                heroCard.innerHTML = `<img src="${hero.card}" alt="${hero.name}" data-index="${currentIndex}">`;
                console.log(`heroes:CreatingHeroCard:${hero.name}:${currentIndex}`);

                heroCard.addEventListener('click', () => {
                    console.log(`heroes:HeroCardClicked:${hero.name}:${currentIndex}`);
                    openHeroModal(currentIndex, hero);
                });

                heroGroup.appendChild(heroCard);
                currentFactionHeroes.push(hero);
                currentIndex++;
            });

            heroContainer.appendChild(heroGroup);
        });

        console.log('heroes:TileModeRenderedCount', currentFactionHeroes.length);
    }

    function renderPreviewMode(factionHeroes) {
        console.log('heroes:renderPreviewMode');
        previewContent.innerHTML = '';
        heroContainer.classList.add('hidden');
        previewContent.classList.remove('hidden');
        heroDetailsSection.classList.add('hidden');

        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';

        // Sort based on rarityOrder
        const sortedRarities = rarityOrder
            .map((rarity) => {
                const matchingKey = Object.keys(factionHeroes).find((key) =>
                    key.toLowerCase().includes(rarity.toLowerCase().split(' ')[0])
                );
                return matchingKey ? [matchingKey, factionHeroes[matchingKey]] : null;
            })
            .filter(Boolean);
        console.log('heroes:sortedRaritiesPreview', sortedRarities.map(([r]) => r));

        // Flatten sorted heroes into currentFactionHeroes for proper navigation order
        currentFactionHeroes = [];

        sortedRarities.forEach(([rarity, heroes]) => {
            if (!heroes || heroes.length === 0) {
                console.warn(`heroes:NoHeroesForRarityPreview:${rarity}`);
                return;
            }

            heroes.forEach((hero) => {
                const previewCard = document.createElement('div');
                previewCard.className = 'preview-card';
                previewCard.innerHTML = `<img src="${hero.card}" alt="${hero.name}" data-hero="${hero.name}">`;
                console.log(`heroes:CreatingPreviewCard:${hero.name}`);

                previewCard.addEventListener('click', () => {
                    console.log(`heroes:PreviewCardClicked:${hero.name}`);
                    selectHero(hero);
                });
                previewContainer.appendChild(previewCard);
                currentFactionHeroes.push(hero);
            });
        });

        previewContent.appendChild(previewContainer);
        console.log('heroes:PreviewContainerAppended');

        // Auto-select the first hero in preview mode
        const firstHero = currentFactionHeroes[0];
        if (firstHero) {
            console.log(`heroes:AutoSelectFirstHero:${firstHero.name}`);
            selectHero(firstHero);
        } else {
            console.warn('heroes:NoHeroesToAutoSelectPreview');
        }
    }

    function selectHero(hero) {
        console.log(`heroes:selectHero:${hero.name}`);
        const heroDetails = document.getElementById('heroDetails');
        heroDetails.classList.remove('hidden');
        heroDetails.innerHTML = '<p>Loading...</p>';

        // Find the selected card in preview mode
        const previewCards = Array.from(previewContent.querySelectorAll('.preview-card'));
        const heroIndex = previewCards.findIndex(
            (card) => card.querySelector('img').alt === hero.name
        );
        selectedHeroIndex = heroIndex;
        console.log(`heroes:selectedHeroIndex:${selectedHeroIndex}`);

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
            console.log(`heroes:ScrollToHero:${scrollPosition}`);
            previewContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });

            // Highlight selected hero by adding an outline
            previewCards.forEach((card) => card.classList.remove('selected'));
            selectedCard.classList.add('selected');
        } else {
            console.warn('heroes:SelectedCardNotFound');
        }

        // Display hero details in the sidebar
        console.log(`heroes:DisplayBasicDetails:${hero.name}`);
        heroDetails.innerHTML =
            `<img src="${hero.icon}" alt="${hero.name}">
             <h2>${hero.name}</h2>
             <p>Rarity: ${hero.rarity}</p>`;

        // Fetch and update additional details asynchronously, if needed
        const heroSlug = hero.name.toLowerCase();
        const fetchURL = `/templates/hero_page.php?hero=${heroSlug}&page=gear`;
        console.log(`heroes:FetchDetailsURL:${fetchURL}`);

        fetch(fetchURL)
            .then((response) => {
                console.log(`heroes:ReceivedResponse:${heroSlug}`, response);
                if (!response.ok) throw new Error(`Failed to load page for ${heroSlug}`);
                return response.text();
            })
            .then((html) => {
                console.log(`heroes:LoadedHTML:${heroSlug}`);
                heroDetails.innerHTML = html;
            })
            .catch((error) => {
                console.error(`heroes:ErrorLoadingDetails:${heroSlug}`, error);
                heroDetails.innerHTML = `<p>Error loading details for ${heroSlug}.</p>`;
            });
    }

    function openHeroModal(index, hero) {
        console.log(`heroes:openHeroModal:${index}:${hero.name}`);
        selectedHeroIndex = index;

        heroModal.style.display = 'flex'; // Show modal
        document.body.classList.add('modal-open'); // Prevent scrolling behind modal
        console.log('heroes:HeroModalDisplayed');
        fetchHeroPage(hero);

        heroModal.querySelector('.modal-close').onclick = closeHeroModal;
        heroModal.querySelector('.modal-prev').onclick = () => navigateHero(-1);
        heroModal.querySelector('.modal-next').onclick = () => navigateHero(1);

        document.addEventListener('keydown', handleModalKeyEvents); // Attach keydown listener
    }

    function closeHeroModal() {
        console.log('heroes:closeHeroModal');
        heroModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Restore scrolling
        document.removeEventListener('keydown', handleModalKeyEvents); // Detach keydown listener
    }

    function navigateHero(direction) {
        console.log(`heroes:navigateHero:${direction}`);
        selectedHeroIndex = (selectedHeroIndex + direction + currentFactionHeroes.length) % currentFactionHeroes.length;
        const selectedHero = currentFactionHeroes[selectedHeroIndex];
        console.log(`heroes:NavigateToHero:${selectedHero.name}:${selectedHeroIndex}`);
        fetchHeroPage(selectedHero);
    }

    function handleModalKeyEvents(event) {
        if (heroModal.style.display !== 'flex') return;

        console.log(`heroes:handleModalKey:${event.key}`);
        switch (event.key) {
            case 'Escape':
                closeHeroModal();
                break;
            case 'ArrowLeft':
                navigateHero(-1);
                break;
            case 'ArrowRight':
                navigateHero(1);
                break;
        }
    }

    function fetchHeroPage(hero) {
        console.log(`heroes:fetchHeroPage:${hero.name}`);
        const modalHeroDetails = document.getElementById('modalHeroDetails');
        if (!modalHeroDetails) {
            console.error('heroes:modalHeroDetailsNotFound');
            return;
        }
        modalHeroDetails.innerHTML = '<p>Loading...</p>';

        if (!hero) {
            console.error('heroes:UndefinedHero');
            modalHeroDetails.innerHTML = '<p>Error: Undefined hero.</p>';
            return;
        }

        const heroSlug = hero.name.toLowerCase();
        const fetchURL = `/templates/hero_page.php?hero=${heroSlug}`;
        console.log(`heroes:FetchModalURL:${fetchURL}`);

        fetch(fetchURL)
            .then((response) => {
                console.log(`heroes:ReceivedModalResponse:${heroSlug}`, response);
                if (!response.ok) throw new Error(`Failed to load page for ${heroSlug}`);
                return response.text();
            })
            .then((html) => {
                console.log(`heroes:LoadedModalHTML:${heroSlug}`);
                modalHeroDetails.innerHTML = html;
            })
            .catch((error) => {
                console.error(`heroes:ErrorLoadingModal:${heroSlug}`, error);
                modalHeroDetails.innerHTML = `<p>Error loading details for ${heroSlug}.</p>`;
            });
    }

    function toggleMode() {
        currentMode = currentMode === 'tile' ? 'preview' : 'tile';
        modeToggleIcon.classList.toggle('fa-toggle-off');
        modeToggleIcon.classList.toggle('fa-toggle-on');
        console.log(`heroes:toggleMode:${currentMode}`);
        renderHeroes(factionDropdown.value);
    }

    // Global keydown listener for preview navigation
    document.addEventListener('keydown', (event) => {
        if (currentMode === 'preview' && currentFactionHeroes.length > 0) {
            if (event.key === 'ArrowRight') {
                selectedHeroIndex = (selectedHeroIndex + 1) % currentFactionHeroes.length;
                const nextHero = currentFactionHeroes[selectedHeroIndex];
                console.log(`heroes:ArrowRightPressed:Selecting:${nextHero.name}`);
                selectHero(nextHero);
            } else if (event.key === 'ArrowLeft') {
                selectedHeroIndex = (selectedHeroIndex - 1 + currentFactionHeroes.length) % currentFactionHeroes.length;
                const prevHero = currentFactionHeroes[selectedHeroIndex];
                console.log(`heroes:ArrowLeftPressed:Selecting:${prevHero.name}`);
                selectHero(prevHero);
            }
        }
    });

    // Event listeners
    modeToggleIcon.addEventListener('click', () => {
        console.log('heroes:modeToggleIconClick');
        toggleMode();
    });

    factionDropdown.addEventListener('change', () => {
        console.log(`heroes:factionDropdownChange:${factionDropdown.value}`);
        renderHeroes(factionDropdown.value);
    });

    // Initial render
    console.log('heroes:InitialRender:nature_heroes');
    renderHeroes('nature_heroes');
});
