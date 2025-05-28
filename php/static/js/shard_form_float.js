function handleFloatingShardForm() {
    const floatingForm = document.querySelector('.floating-shard-form');
    const container = document.querySelector('.container');

    const fixedTopDistance = 64; // Matches top-bar height
    const spacing = 8;           // Space below top bar

    let isPinned = false;

    if (!floatingForm || !container) return;

    function updateFormPosition() {
        const containerRect = container.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const containerTop = containerRect.top + scrollY;
        const formShouldPin = scrollY >= containerTop - fixedTopDistance - spacing;

        if (formShouldPin && !isPinned) {
            floatingForm.classList.add('pinned');
            floatingForm.style.top = ''; // Reset inline styles when pinned
            floatingForm.style.left = '';
            floatingForm.style.width = '';
            isPinned = true;
        } else if (!formShouldPin && isPinned) {
            floatingForm.classList.remove('pinned');
            const topPos = containerTop + spacing;
            floatingForm.style.position = 'absolute';
            floatingForm.style.top = `${topPos}px`;
            floatingForm.style.left = '';
            floatingForm.style.width = '';
            isPinned = false;
        } else if (!isPinned) {
            const topPos = containerTop + spacing;
            floatingForm.style.top = `${topPos}px`;
        }
    }

    function initializeFormPosition() {
        const containerRect = container.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const topPos = containerRect.top + scrollY + spacing;
        floatingForm.classList.remove('pinned');
        floatingForm.style.position = 'absolute';
        floatingForm.style.top = `${topPos}px`;
        floatingForm.style.left = '';
        floatingForm.style.width = '';
        floatingForm.style.transform = '';
        isPinned = false;
    }

    initializeFormPosition();
    window.addEventListener('scroll', updateFormPosition);
    window.addEventListener('resize', () => {
        initializeFormPosition();
        updateFormPosition();
    });
}

document.addEventListener("DOMContentLoaded", handleFloatingShardForm);
