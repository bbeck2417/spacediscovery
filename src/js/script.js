document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. STARFIELD BACKGROUND
  // ==========================================
  const canvas = document.getElementById("starfield-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  const stars = [];
  const numStars = 200;
  const starSpeed = 0.5;
  const maxZ = 1000;
  const perspectiveFactor = 300;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none";
  canvas.style.overflow = "hidden";

  function Star() {
    this.x = (Math.random() - 0.5) * width;
    this.y = (Math.random() - 0.5) * height;
    this.z = Math.random() * maxZ;
    this.size = Math.random() * 4 + 2;
  }

  function initStars() {
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }
  }

  function drawStar(context, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
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

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";

    stars.forEach((star) => {
      star.z -= starSpeed;

      if (star.z < 1) {
        star.z = maxZ;
        star.x = (Math.random() * 2 - 0.5) * width;
        star.y = (Math.random() * 2 - 0.5) * height;
        star.size = Math.random() * 4 + 2;
      }

      const k = perspectiveFactor / star.z;
      const sx = star.x * k + width / 2;
      const sy = star.y * k + height / 2;
      const size = star.size * k;

      if (
        sx > -size &&
        sx < width + size &&
        sy > -size &&
        sy < height + size &&
        size > 0.1
      ) {
        drawStar(ctx, sx, sy, 5, size, size * 0.1);
      }
    });

    requestAnimationFrame(drawStars);
  }

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  });

  initStars();
  drawStars();

  // ==========================================
  // 2. EARTH SCROLL ANIMATION (RESTORED ORIGINAL)
  // ==========================================
  const earthImageContainer = document.querySelector(".hero-image-container");
  const earthImage = document.querySelector(".hero-image");
  const heroSection = document.getElementById("hero");

  if (earthImageContainer && earthImage && heroSection) {
    // Cache calculation vars
    let heroHeight = heroSection.offsetHeight;
    let heroTop = heroSection.offsetTop;
    let windowHeight = window.innerHeight;

    window.addEventListener("resize", () => {
      heroHeight = heroSection.offsetHeight;
      heroTop = heroSection.offsetTop;
      windowHeight = window.innerHeight;
    });

    function animateEarth() {
      // Logic restored to YOUR original calculations (Bottom of hero leaving screen)
      const scrollY = window.scrollY;

      const currentHeroBottom = heroTop + heroHeight - scrollY;
      const animationStartPoint = windowHeight;
      const animationEndPoint = windowHeight * 0.2;

      let scrollProgress =
        (animationStartPoint - currentHeroBottom) /
        (animationStartPoint - animationEndPoint);

      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      // Just Scale and Opacity. No Parallax TranslateY.
      const scaleValue = 1 - scrollProgress;
      const opacityValue = 1 - scrollProgress;

      earthImage.style.transform = `scale(${scaleValue})`;
      earthImage.style.opacity = opacityValue;

      if (scrollProgress >= 1) {
        earthImageContainer.style.display = "none";
      } else {
        earthImageContainer.style.display = "block";
      }
    }

    // Keep the "Tick" Pattern to prevent choppiness
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            animateEarth();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    animateEarth();
  }

  // ==========================================
  // 3. HAMBURGER MENU
  // ==========================================
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".navlinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
        }
      });
    });
  }

  // ==========================================
  // 4. NEWS FETCHING
  // ==========================================
  const newsContainer = document.getElementById("news-container");

  async function fetchNews() {
    if (!newsContainer) return;

    try {
      const response = await fetch("./src/js/news.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const articles = await response.json();
      displayRecentArticles(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      newsContainer.innerHTML =
        "<p>Error loading news articles. Please try again later.</p>";
    }
  }

  function displayRecentArticles(articles) {
    const sortedArticles = articles.sort(
      (a, b) => new Date(b.datePublished) - new Date(a.datePublished)
    );

    const recentArticles = sortedArticles.slice(0, 5);

    newsContainer.innerHTML = "";

    recentArticles.forEach((article) => {
      const card = document.createElement("div");
      card.classList.add("news-card");
      card.dataset.id = article.id;

      const shortContent = article.content.substring(0, 150) + "...";

      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <div class="card-content">
            <h2>${article.title}</h2>
            <p>${shortContent}</p>
            <div class="author-date">By ${article.author} on ${new Date(
        article.datePublished
      ).toLocaleDateString()}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `./src/articles/index.html?id=${article.id}`;
      });

      newsContainer.appendChild(card);
    });
  }

  fetchNews();

  // ==========================================
  // 5. JOIN FORM VALIDATION
  // ==========================================
  const joinForm = document.getElementById("join-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");

  if (joinForm && nameInput && emailInput) {
    function validateName() {
      if (nameInput.value.trim() === "") {
        nameError.textContent = "Name is required.";
        nameInput.classList.add("invalid");
        return false;
      } else {
        nameError.textContent = "";
        nameInput.classList.remove("invalid");
        return true;
      }
    }

    function validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput.value.trim() === "") {
        emailError.textContent = "Email is required.";
        emailInput.classList.add("invalid");
        return false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email address.";
        emailInput.classList.add("invalid");
        return false;
      } else {
        emailError.textContent = "";
        emailInput.classList.remove("invalid");
        return true;
      }
    }

    joinForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();

      if (isNameValid && isEmailValid) {
        const originalFormHTML = joinForm.innerHTML;
        const userName = nameInput.value;

        joinForm.innerHTML = `
            <div class="success-message">
                <h3>🎉 Thank you ${userName} for joining! 🎉</h3>
                <p>We're excited to have you in our Space Discoveries community.</p>
                <p>Redirecting you back to the form...</p>
            </div>
        `;

        setTimeout(() => {
          joinForm.innerHTML = originalFormHTML;
          const newNameInput = document.getElementById("name");
          const newEmailInput = document.getElementById("email");
          if (newNameInput)
            newNameInput.addEventListener("input", validateName);
          if (newEmailInput)
            newEmailInput.addEventListener("input", validateEmail);
        }, 8000);
      }
    });

    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
  }
});
