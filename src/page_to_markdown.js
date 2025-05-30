/**
 * Находит элемент, похожий на основную статью HTML страницы.
 * Использует правила семантического HTML.
 *
 * @returns {HTMLElement}
 */
function findArticleNode() {
    const main = document.querySelector('main')
        ?? document.querySelector('body');
    const article = main.querySelector('article')
        ?? main;

    if (!article) {
        throw new Error('Failed to find HTMLElement with article contents');
    }

    return article;
}

async function saveTextFile(dir, filename, text) {
    const file = await dir.getFileHandle(filename, { create: true });
    const w = await file.createWritable();
    try {
        await w.write(text);
    }
    finally {
        await w.close();
    }
}

async function pageToMarkdown() {
    const dirHandle = await window.showDirectoryPicker({
        id: 'page_to_markdown_save_dir',
        startIn: 'downloads',
        mode: 'readwrite',
    });

    await saveTextFile(dirHandle, 'article.md', '# Article\nHello, world!');
}

pageToMarkdown().then(
    () => {
        alert('Saved page as markdown');
    },
    (e) => {
        alert('Failed to save page as markdown\n' + String(e));
    }
);
