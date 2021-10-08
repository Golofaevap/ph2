const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");
resolve = require("path").resolve;
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());

// const cookiesExtention =
// "C:\\Users\\nntve\\Desktop\\code\\puppeteer\\godaddy-farm-bot\\extentions\\cookies.txt";
async function getBrowser(opts) {
    // try {
    console.log((opts.userDataDirPath = resolve(opts.userDataDirPath)));
    const browser = await puppeteer.launch({
        headless: opts.headless,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        userDataDir: opts.userDataDirPath,
        ignoreHTTPSErrors: true,
        defaultViewport: { width: opts.width, height: opts.height },
        ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
        args: [
            // `--proxy-server=https://195.149.87.135:30020`, // :user16980:A6ZyYY6B
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-web-security",

            // `--user-data-dir=${opts.userDataDirPath}`,
            // "--disable-infobars",

            // `--start-maximized`,
            // "--window-position=0,0",
            "--ignore-certifcate-errors",
            "--ignore-certifcate-errors-spki-list",
            // '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
            // `--window-size=${opts.width},${opts.height}`,
        ],
    });
    return browser;
    // } catch (error) {
    //     console.log(error);
    // }
    // return null;
}

module.exports = getBrowser;
