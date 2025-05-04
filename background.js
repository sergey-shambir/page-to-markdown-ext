chrome.action.onClicked.addListener(async (tab) => {
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["page_to_markdown.js"]
    });
    // const doc = URL.createObjectURL(new Blob(
    //     ['Hello, Chrome downloads!'],
    //     { type: 'text/markdown' }
    // ));
    // await chrome.downloads.download({
    //     url: doc,
    //     filename: 'article.md',
    //     conflictAction: 'uniquify'
    // });
});