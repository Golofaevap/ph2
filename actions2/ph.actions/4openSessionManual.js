// node actions2/2regIntoGoDaddy.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const colors = require("colors");
const useProxy = require("puppeteer-page-proxy");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const pluginProxy = require("puppeteer-extra-plugin-proxy");
const getBrowser = require("../../pptFunctions/getBrowser");
const newPage = require("../../pptFunctions/newPage");
const cfg = require("./config");
const { Console } = require("console");
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
puppeteer.use(StealthPlugin());

// aelbertshvab@yandex.ru+#

// const USER_NAME = "rihuman1989@autorambler.ru";

async function main() {
    const fSessions = getDirectories(cfg.sessionsFolder);
    console.log("Sessions: ", fSessions);
    let session = null;
    for (let i in fSessions) {
        const fSession = fSessions[i];
        const folderPath = `${cfg.sessionsFolder}/${fSession}`;
        const userDataDirPath = `${cfg.sessionsFolder}/${fSession}/userDataDir`;

        const credentialsJson = fs.readFileSync(`${folderPath}/credentials.json`, "utf8");
        const credentials = JSON.parse(credentialsJson);
        console.log(credentials);
        if (credentials.phRegistered) {
            // Добавить проверку на давность использования
            session = credentials;
            session.userDataDirPath = userDataDirPath;
            break;
        }
    }

    if (!session) return;

    const opts = {
        headless: false,
        userDataDirPath: session.userDataDirPath,
        width: 1280,
        height: 720,
    };
    const browser = await getBrowser(opts);

    // open page with email
    const proxy = "http://user16412:6obvuan@185.174.102.51:16412";
    // const proxy = 'https://C4D8Ky:pDbDDn@host:port';

    const page = await newPage(browser, opts);
    await useProxy(page, proxy);
    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    //     useProxy(req, proxy);
    // });
    const data = await useProxy.lookup(page);
    console.log(data.ip);
    await page.setDefaultNavigationTimeout(15000);
    await page.setDefaultTimeout(15000); //user16980:A6ZyYY6B
    await page.authenticate({ username: "user20", password: "EMtCi1Vn" });
    await page.goto("https://google.com");
}

main();
