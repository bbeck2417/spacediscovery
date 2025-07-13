document.addEventListener('DOMContentLoaded', async () => {
    const fullArticleContent = document.getElementById('full-article-content');
    const articleTitleTag = document.getElementById('article-title-tag');
    const backButton = document.getElementById('back-button');

    // Get the article ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        fullArticleContent.innerHTML = '<p>Article not found. Please go back to the <a href="index.html">main page</a>.</p>';
        articleTitleTag.textContent = 'Article Not Found';
        return;
    }

    try {
        const response = await fetch('../js/news.json');
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
                <img src="${article.image}" alt="${article.title}">
                <p>${article.content}</p>
                <button id="back-button"><a href="index.html" id="back-button">Back to News</a></button>
            `;
            const backButton = document.getElementById('back-button');
            backButton.addEventListener('click', (event) => {
                window.location.href = '/spacedicovery/index.html/#news-container';
            });
        } else {
            fullArticleContent.innerHTML = '<p>Article not found. Please go back to the <a href="index.html">main page</a>.</p>';
            articleTitleTag.textContent = 'Article Not Found';
        }
    } catch (error) {
        console.error('Error fetching full article:', error);
        fullArticleContent.innerHTML = '<p>Error loading article. Please try again later.</p>';
        articleTitleTag.textContent = 'Error Loading Article';
    }

});