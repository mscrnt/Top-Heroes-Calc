function handleFloatingShardForm() {
    const floatingForm = document.querySelector('.floating-shard-form');
    const container = document.querySelector('.container');

    const fixedTopDistance = 64;
    const spacing = 8;
    const mobileBreakpoint = 768;

    let isPinned = false;

    if (!floatingForm || !container) return;

    function updateFormPosition() {
        const containerRect = container.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const containerTop = containerRect.top + scrollY;
        const containerWidth = container.offsetWidth;

        const topPos = containerTop + spacing;
        const formShouldPin = scrollY >= containerTop - fixedTopDistance - spacing;
        const isDesktop = window.innerWidth >= mobileBreakpoint;

        if (formShouldPin && !isPinned) {
            floatingForm.classList.add('pinned');
            floatingForm.style.top = '';
            floatingForm.style.left = '';
            if (isDesktop) {
                floatingForm.style.width = `${containerWidth * 0.95}px`;
            }
            isPinned = true;

        } else if (!formShouldPin && isPinned) {
            floatingForm.classList.remove('pinned');
            floatingForm.style.position = 'absolute';
            floatingForm.style.top = `${topPos}px`;
            floatingForm.style.left = '';
            if (isDesktop) {
                floatingForm.style.width = `${containerWidth * 0.95}px`;
            } else {
                floatingForm.style.width = '';
            }
            isPinned = false;

        } else if (!isPinned) {
            floatingForm.style.top = `${topPos}px`;
            if (isDesktop) {
                floatingForm.style.width = `${containerWidth * 0.95}px`;
            } else {
                floatingForm.style.width = '';
            }
        }
    }

    function initializeFormPosition() {
        const containerRect = container.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const containerWidth = container.offsetWidth;
        const topPos = containerRect.top + scrollY + spacing;
        const isDesktop = window.innerWidth >= mobileBreakpoint;

        floatingForm.classList.remove('pinned');
        floatingForm.style.position = 'absolute';
        floatingForm.style.top = `${topPos}px`;
        floatingForm.style.left = '';
        floatingForm.style.transform = '';
        isPinned = false;

        if (isDesktop) {
            floatingForm.style.width = `${containerWidth * 0.95}px`;
        } else {
            floatingForm.style.width = '';
        }
    }

    initializeFormPosition();
    window.addEventListener('scroll', updateFormPosition);
    window.addEventListener('resize', () => {
        initializeFormPosition();
        updateFormPosition();
    });
}

document.addEventListener("DOMContentLoaded", handleFloatingShardForm);
