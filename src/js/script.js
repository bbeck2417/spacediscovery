document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('starfield-canvas'); // Get the canvas element for the starfield
    const ctx = canvas.getContext('2d'); // Get the 2D rendering context for the canvas
    let width = window.innerWidth; // Get the initial width of the window
    let height = window.innerHeight; // Get the initial height of the window
    const stars = []; // Array to hold star objects
    const numStars = 200; // Number of stars
    const starSpeed = 0.5; // Speed of movement (adjust as needed)

    // Max Z-depth for initial distribution and when stars reset
    const maxZ = 1000; // Determines how "deep" the starfield is
    // Factor for perspective calculation - impacts how stars scale with depth
    const perspectiveFactor = 300; // Adjust for more/less pronounced perspective effect

    canvas.width = width; // Set the canvas width to the window width
    canvas.height = height; // Set the canvas height to the window height
    // Style the canvas to cover the entire viewport
    canvas.style.position = 'fixed'; // Keep fixed to cover viewport
    canvas.style.top = '0'; // Position at the top of the viewport
    canvas.style.left = '0'; // Position at the left of the viewport
    canvas.style.zIndex = '-1'; // Place behind all content
    canvas.style.pointerEvents = 'none'; // Ensure it doesn't block clicks/interactions

    // Star constructor function
    function Star() {
        // Initialize x and y in a 'world' coordinate system relative to the center
        // Multiplying by width/height ensures stars are generated across the potential viewable area
        this.x = (Math.random() - 0.5) * width;
        this.y = (Math.random() - 0.5) * height;
        this.z = Math.random() * maxZ; // Initial random depth within the maxZ range
        this.size = Math.random() * 4 + 2; // Min size to ensure visibility even when far
    }

    // Function to initialize all stars for the first time
    function initStars() {
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
    }

    // --- Helper function to draw a star shape ---
    function drawStar(context, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        context.beginPath();
        context.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            rot += step;
        }
        context.lineTo(cx, cy - outerRadius);
        context.closePath();
        context.fill();
    }

    // Animation loop
    function drawStars() {
        ctx.clearRect(0, 0, width, height); // Clear the entire canvas for each frame
        ctx.fillStyle = 'white'; // Set star color

        stars.forEach(star => {
            star.z -= starSpeed; // Move star towards the viewer

            // Reset star if it moves too close or past the viewer
            if (star.z < 1) { // If z is very small or negative (past camera)
                star.z = maxZ; // Reset to the maximum distance (far end)
                // Re-randomize x and y to appear from a new point across the field
                star.x = (Math.random() * 2 - 0.5) * width;     
                star.y = (Math.random() * 2 - 0.5) * height; 
                star.size = Math.random() * 4 + 2; // Reset size too
            }

            // Perspective calculation: 'k' determines scaling based on depth (z)
            // Closer stars (smaller z) have a larger 'k', making them bigger
            const k = perspectiveFactor / star.z;

            // Calculate screen coordinates (sx, sy) centered on the canvas
            const sx = star.x * k + width / 2; 
            const sy = star.y * k + height / 2;
            const size = star.size * k; // Scaled size of the star

            // Only draw the star if it's within the canvas bounds and is still visible
            if (sx > -size && sx < width + size && sy > -size && sy < height + size && size > 0.1) {
                // --- Replaced ctx.arc with drawStar ---
                const numSpikes = 5; // Number of points on the star (e.g., 5 for a classic star)
                const outerRadius = size;
                // Inner radius controls how "pointy" the star is.
                // A smaller innerRadius makes the points sharper.
                // A common ratio is 0.5, but you can experiment.
                const innerRadius = size * 0.1; 
                drawStar(ctx, sx, sy, numSpikes, outerRadius, innerRadius);
            }
        });

        requestAnimationFrame(drawStars); // Request next animation frame
    }

    // Handle window resize events
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // Optionally, re-initialize stars on resize for optimal distribution
        // stars.length = 0;
        // initStars();
    });

    // Initialize and start the starfield animation
    initStars();
    drawStars();

     // --- New/Updated code for Earth image animation ---
    const earthImageContainer = document.querySelector('.hero-image-container');
    const earthImage = document.querySelector('.hero-image');
    const heroSection = document.getElementById('hero'); // Get reference to the hero section

    // Make sure all necessary elements exist before attempting to animate
    if (earthImageContainer && earthImage && heroSection) {

        function animateEarthOnScroll() {
            // Get the bounding rectangle of the hero section relative to the viewport
            const heroRect = heroSection.getBoundingClientRect();

            // Define the scroll range over which the animation will occur.
            // We want the animation to play as the hero section scrolls upwards
            // and its bottom edge moves from the bottom of the screen towards the top.

            // Animation starts when the bottom of the hero section is at the bottom of the viewport.
            // This means the entire hero section is visible, and the next section is just off-screen below.
            const animationStartPoint = window.innerHeight;

            // Animation ends when the bottom of the hero section has scrolled up
            // to a certain point, e.g., 20% from the bottom of the viewport.
            // Adjust '0.2' (20%) to control when exactly the image fully disappears.
            // A value of '0' means it disappears as the hero section's bottom leaves the screen.
            const animationEndPoint = window.innerHeight * 0.2; // Image disappears when hero section is 20% off screen

            // Get the current position of the bottom of the hero section relative to the viewport top
            const currentHeroBottom = heroRect.bottom;

            // Calculate scroll progress (normalized between 0 and 1)
            // As currentHeroBottom moves from 'animationStartPoint' (bottom of viewport)
            // up towards 'animationEndPoint', 'scrollProgress' will go from 0 to 1.
            let scrollProgress = (animationStartPoint - currentHeroBottom) / (animationStartPoint - animationEndPoint);

            // Clamp the progress value between 0 and 1 to prevent issues outside the animation range
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            // Calculate the scale and opacity values based on the scroll progress
            // As progress goes from 0 to 1, scale and opacity go from 1 to 0 (shrink and disappear)
            const scaleValue = 1 - scrollProgress;
            const opacityValue = 1 - scrollProgress;

            // Apply the calculated styles to the Earth image
            earthImage.style.transform = `scale(${scaleValue})`;
            earthImage.style.opacity = opacityValue;

            // Optional: Hide the image container completely when it's fully transparent
            // This prevents it from potentially blocking interaction with content below,
            // even if its opacity is 0.
            if (scrollProgress >= 1) {
                earthImageContainer.style.display = 'none';
            } else {
                earthImageContainer.style.display = 'block'; // Ensure it's visible when in range
            }
        }

        // Attach the scroll event listener to the window
        window.addEventListener('scroll', animateEarthOnScroll);

        // Call the function once on page load to set the initial state
        // (important if the page is loaded while already scrolled down)
        animateEarthOnScroll();
    }
    // --- Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.navlinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Optional: Close menu when a link is clicked (for single-page sites)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Check if the menu is active before trying to remove the class
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
    const newsContainer = document.getElementById('news-container');
    // Set the title for the news section

    // Function to fetch news data
    async function fetchNews() {
        try {
            const response = await fetch('./src/js/news.json'); // Assuming your JSON file is named news.json
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const articles = await response.json();
            displayRecentArticles(articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            newsContainer.innerHTML = '<p>Error loading news articles. Please try again later.</p>';
        }
    }

    // Function to display the 5 most recent articles
    function displayRecentArticles(articles) {
        // Sort articles by datePublished in descending order (most recent first)
        const sortedArticles = articles.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

        // Get the 5 most recent articles
        const recentArticles = sortedArticles.slice(0, 6);

        recentArticles.forEach(article => {
            const card = document.createElement('div');
            card.classList.add('news-card');
            card.dataset.id = article.id; // Store the article ID for later use

            // Shorten content for card display
            const shortContent = article.content.substring(0, 150) + '...';

            card.innerHTML = `
                <img src="${article.image}" alt="${article.title}">
                <div class="card-content">
                    <h2>${article.title}</h2>
                    <p>${shortContent}</p>
                    <div class="author-date">By ${article.author} on ${new Date(article.datePublished).toLocaleDateString()}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                // Open the full article in a new page
                window.open(`../src/articles/article.html?id=${article.id}`, '_blank');
            });

            newsContainer.appendChild(card);
        });
    }

    // Call the fetchNews function when the page loads
    fetchNews();
});