document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('starfield-canvas');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const stars = [];
    const numStars = 200; // Number of stars
    const starSpeed = 0.5; // Speed of movement (adjust as needed)

    // Max Z-depth for initial distribution and when stars reset
    const maxZ = 1000; // Determines how "deep" the starfield is
    // Factor for perspective calculation - impacts how stars scale with depth
    const perspectiveFactor = 250; // Adjust for more/less pronounced perspective effect

    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'fixed'; // Keep fixed to cover viewport
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1'; // Place behind all content
    canvas.style.pointerEvents = 'none'; // Ensure it doesn't block clicks/interactions

    // Star constructor function
    function Star() {
        // Initialize x and y in a 'world' coordinate system relative to the center
        // Multiplying by width/height ensures stars are generated across the potential viewable area
        this.x = (Math.random() - 0.5) * width;
        this.y = (Math.random() - 0.5) * height;
        this.z = Math.random() * maxZ; // Initial random depth within the maxZ range
        this.size = Math.random() * 2 + 0.5; // Min size to ensure visibility even when far
    }

    // Function to initialize all stars for the first time
    function initStars() {
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
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
                star.x = (Math.random() - 0.5) * width;
                star.y = (Math.random() - 0.5) * height;
                star.size = Math.random() * 2 + 0.5; // Reset size too
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
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2); // Draw a circle for the star
                ctx.fill();
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
});