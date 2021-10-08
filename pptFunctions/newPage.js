// creates page in browser;

async function newPage(browser, options) {
    const page = await browser.newPage();
    await page.setViewport({ width: options.width, height: options.height });
    return page;
}

module.exports = newPage;
