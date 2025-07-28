document.addEventListener('DOMContentLoaded', async () => {
    const fullArticleContent = document.getElementById('full-article-content');
    const articleTitleTag = document.getElementById('article-title-tag');
    // Removed the initial 'backButton' constant here as it refers to a button that will be replaced.

    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
     

    if (!articleId) {
        fullArticleContent.innerHTML = '<p>Article not found. Please go back to the <a href="../../index.html">main page</a>.</p>';
        articleTitleTag.textContent = 'Article Not Found';
        return;
    }

    try {
        const response = await fetch('../js/news.json'); // Adjust the path to your JSON file as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();
        const article = articles.find(a => a.id === articleId);

        if (article) {
            articleTitleTag.textContent = article.title;
            fullArticleContent.innerHTML = `
                <h1>${article.title}</h1>
                <span class="author-date">By ${article.author} on ${new Date(article.datePublished).toLocaleDateString()}</span>
                <img src="src/images/${article.image}" alt="${article.title}">
                <p>${article.content}</p>
                <div class="articleBackButton"><button id="back-to-news-button">Back to Articles</button></div> `;

            // *** IMPORTANT: Get a reference to the NEWLY CREATED button and attach the listener ***
            const backButton = document.getElementById('back-to-news-button');
            if (backButton) { // Ensure the button exists before trying to add a listener
                backButton.addEventListener('click', () => {
                    // Navigate to the main page and scroll to the news-container section
                    history.back();
                    // Alternatively, you can use:  window.location.href = '/spacediscovery/index.html/#news-container';
                });
            }
           

        } else {
            fullArticleContent.innerHTML = '<p>Article not found. Please go back to the <a href="../../index.html">main page</a>.</p>';
            articleTitleTag.textContent = 'Article Not Found';
        }
    } catch (error) {
        console.error('Error fetching full article:', error);
        fullArticleContent.innerHTML = '<p>Error loading article. Please try again later.</p>';
        articleTitleTag.textContent = 'Error Loading Article';
    }
});