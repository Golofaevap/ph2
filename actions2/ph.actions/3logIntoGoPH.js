// node actions2/2regIntoGoDaddy.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const colors = require("colors");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const pluginProxy = require("puppeteer-extra-plugin-proxy");
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

    const page2 = await newPage(browser, opts);
    await page2.setDefaultNavigationTimeout(15000);
    await page2.setDefaultTimeout(15000);

    await page2.goto("https://www.pornhub.com/login");
    await page2.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    await page2.setDefaultTimeout(100000);
    await page2.setDefaultNavigationTimeout(200000);
    // accept Cookies;
    try {
        await page2.setDefaultTimeout(1000);
        await page2.setDefaultNavigationTimeout(2000);
        const acceptCookie = await page2.waitForSelector("button[id='acceptCookie']");
        acceptCookie.click();
    } catch (error) {
        console.log(error);
    }
    await page2.setDefaultTimeout(100000);
    await page2.setDefaultNavigationTimeout(200000);
    try {
        // fill the form
        await page2.waitForTimeout(3000);
        const formDiv = await page2.waitForSelector("section[class='formStepOne']");

        // const formDiv = await page2.waitForSelector("div[class='formWrapper']");
        const inputEmail = await formDiv.$("input[name='username']");
        await inputEmail.type(session.mail, { delay: 40 });

        await page2.waitForTimeout(3000);
        const inputPassword = await formDiv.$("input[name='password']");
        await inputPassword.click({ clickCount: 3 });
        await inputPassword.type(session.password, { delay: 250 });

        await page2.waitForTimeout(3000);
        const inputNik = await formDiv.$("input[name='remember_me']");
        await inputNik.click({ clickCount: 1 });
        // await inputNik.type(session.nikname, { delay: 300 });

        // click the button
        await page2.waitForTimeout(3000);
        const submitBtn = await formDiv.$("input[type='submit']");
        console.log(submitBtn);
        await submitBtn.click();
    } catch (error) {}
    return;
    // is reg successfull??
    try {
        await page2.waitForSelector("div[class='emailVerHomepageContainer']");
    } catch (error) {
        console.log("Registration failed");
        return;
    }

    // TEMPORARY
    // TEMPORARY
    // await page2.goto("https://www.pornhub.com/user/welcome/likes");
    // await page2.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    // TEMPORARY
    // What i like survey
    await page2.waitForTimeout(3000);
    // gender selector
    /*const sectionGenderInterest = await page2.waitForSelector("section[class='genderInterest']");
    const buttonSelectorWrap = await sectionGenderInterest.$$("div.buttonSelectorWrap");
    console.log("buttonSelectorWrap", buttonSelectorWrap.length);

    const genderLists = buttonSelectorWrap;
    for (let iUl in genderLists) {
        const ul = genderLists[iUl];
        await ul.focus();
        await page2.waitForTimeout(3000);
        const lis = await ul.$$("li");
        // await lis[Math.floor(Math.random() * lis.length)].evaluate((btn) => btn.click());
        const index1 = Math.floor(Math.random() * lis.length);
        console.log(index1);
        await lis[index1].click();
    }
    return;
    // await genderLists.forEach(async (ul) => {
    //     await ul.focus();
    //     await page2.waitForTimeout(5000);
    //     const lis = await ul.$$("li");
    //     await lis[Math.floor(Math.random() * lis.length)].click();
    // });
    //preferenceSelector
    const sectionsSelector = await page2.$$("section[class*='Selector']");
    // console.log(sectionsSelector.length);
    // return;
    for (let iSec in sectionsSelector) {
        const section = sectionsSelector[iSec];
        const uls = await section.$$("ul");
        console.log("uls", uls.length);
        for (let iUl in uls) {
            const ul = uls[iUl];
            await ul.focus();
            await page2.waitForTimeout(2000);
            const lis = await ul.$$("li");
            console.log("lis", lis.length);
            for (let ilis in lis) {
                if (Math.random() > 0.7) {
                    await page2.waitForTimeout(2000);
                    const cb = await lis[ilis];

                    // const cb = await lis[ilis].$("input[type='checkbox']");
                    // const cb = await lis[ilis].$("div");
                    // if (!cb) continue;
                    console.log(
                        await cb.evaluate((btn) => {
                            btn.click();
                            return btn.innerText;
                        })
                    );
                }
            }
        }
    }
    // const preferences = await preferenceSelector.$$("ul");
    // await preferences.forEach(async (ul) => {
    //     await ul.focus();
    //     await page2.waitForTimeout(5000);
    //     const lis = await ul.$$("li");
    //     for (let ilis in lis) {
    //         if (Math.random() > 0.7) {
    //             await page2.waitForTimeout(2000);
    //             await lis[ilis].click();
    //         }
    //     }
    // }); */

    const welcomeBottomNav = await page2.waitForSelector("section.welcomeBottomNav");
    const welcomeBottomNavBtn1 = await welcomeBottomNav.$("a");
    await welcomeBottomNavBtn1.click();
    await page2.waitForTimeout(7000);
    // await welcomeBottomNavBtn1.focus();
    await page2.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    const welcomeBottomNav2 = await page2.waitForSelector("section.welcomeBottomNav");
    const welcomeBottomNavBtn2 = await welcomeBottomNav2.$("a");
    await welcomeBottomNavBtn2.click();
    await page2.waitForTimeout(7000);

    await page2.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    // const welcomeBottomNav3 = await page2.waitForSelector("section.welcomeBottomNav");
    const welcomeBottomNavBtn3 = await page2.$("a[class*='skipStep'");
    await welcomeBottomNavBtn3.click();
    await page2.waitForTimeout(7000);
    await page2.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    // const welcomeBottomNav3 = await page2.waitForSelector("section.welcomeBottomNav");
    const welcomeBottomNavBtn4 = await page2.$("a[class*='linkProfile'");
    await welcomeBottomNavBtn4.click();
    await page2.waitForTimeout(7000);

    session.phRegistered = true;
    fs.writeFileSync(`${session.folderPath}/credentials.json`, JSON.stringify(session));
}

main();
