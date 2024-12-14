<?php
// includes/footer.php
?>
<div id="footer-banner">
    <div class="footer-content">
        <p>
            This website uses cookies to enhance your experience. By continuing to browse, you agree to the use of cookies. 
            This site also uses Google AdSense to serve ads based on user preferences.
        </p>
        <button id="close-footer-banner">&times;</button>
    </div>
</div>

<style>
    /* Footer Banner Styling */
    #footer-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(47, 85, 150, 0.95); /* Dark blue with slight transparency */
        color: white;
        z-index: 1000; /* Ensure it's on top */
        padding: 15px;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.3s ease; /* Smooth slide out */
    }

    #footer-banner.hidden {
        transform: translateY(100%); /* Slide out of view */
    }

    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        width: 100%;
        padding: 0 15px;
    }

    .footer-content p {
        margin: 0;
        font-size: 14px;
        flex: 1; /* Allow p to take up remaining space */
    }

    #close-footer-banner {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 15px;
        transition: color 0.3s ease;
    }

    #close-footer-banner:hover {
        color: #ff6f61; /* Light coral on hover */
    }
</style>

<script>
    // Footer Banner JavaScript
    document.addEventListener('DOMContentLoaded', () => {
        const footerBanner = document.getElementById('footer-banner');
        const closeButton = document.getElementById('close-footer-banner');

        // Close the banner when the "X" button is clicked
        closeButton.addEventListener('click', () => {
            footerBanner.classList.add('hidden');
            localStorage.setItem('footerBannerClosed', 'true'); // Save state to prevent re-showing
        });

        // Check if the banner was previously closed
        if (localStorage.getItem('footerBannerClosed') === 'true') {
            footerBanner.classList.add('hidden');
        }
    });
</script>
</body>
</html>
