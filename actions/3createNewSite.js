// node actions/3createNewSite.js
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");
const pluginProxy = require("puppeteer-extra-plugin-proxy");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
const cats = ["вода", "стол", "одежда", "отдых", "велос", "продук"];
// aelbertshvab@yandex.ru+#
// const USER_NAME = "hilderfield@yandex.ru";

const curr = require("../sessions/current.json");
let USER_NAME = null;
if (curr.mail) {
    USER_NAME = curr.mail;
}
// const USER_NAME = "mattewmcconnan@yandex.ru";
let businessNames = [];

if (curr.sitesToCreate) {
    businessNames = curr.sitesToCreate;
}

function main() {
    const fSessions = getDirectories("./sessions");
    console.log("Sessions: ", fSessions);
    if (!fSessions.includes(USER_NAME)) {
        console.log("User does not found!");
        return;
    }
    console.log("Creating folders pathes...");

    const folderPath = `./sessions/${USER_NAME}`;
    const userDataDirPath = `./sessions/${USER_NAME}/userDataDir`;
    const screenshotPath = `./sessions/${USER_NAME}/screnshots`;

    const credentialsJson = fs.readFileSync(
        `${folderPath}/credentials.json`,
        "utf8"
    );
    const credentials = JSON.parse(credentialsJson);

    const proxy_options = {
        address: credentials.proxy_ip,
        port: credentials.proxy_prt,
    };
    let mustAuth = false;
    if (credentials.proxy_lgn && credentials.proxy_pwd) {
        proxy_options.credentials = {
            username: credentials.proxy_lgn,
            password: credentials.proxy_pwd,
        };
        mustAuth = true;
    }
    // puppeteer.use(pluginProxy(proxy_options));

    const proxy = `https://${credentials.proxy_lgn}:${credentials.proxy_pwd}@${credentials.proxy_ip}:${credentials.proxy_prt}`;
    console.log(proxy, proxy_options);

    puppeteer
        .launch({
            headless: curr.headless,
            userDataDir: userDataDirPath,
            args: [
                // `--proxy-server=${proxy}`,
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
            ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
        })
        .then(async (browser) => {
            console.log("Creating site..");
            const page = await browser.newPage();
            if (mustAuth) {
                await page.authenticate({
                    username: proxy_options.credentials.username,
                    password: proxy_options.credentials.password,
                });
            }
            await page.waitForTimeout(1000);
            console.log("Page is found...");
            for (let i in businessNames) {
                const businessName = businessNames[i];
                console.log(
                    "|-----------------------------------------------|"
                );
                console.log(
                    "|                                               |"
                );
                console.log(
                    "|                                               |"
                );
                console.log("|  ", USER_NAME);
                console.log("|  ", businessName);
                console.log(
                    "|                                               |"
                );
                console.log(
                    "|                                               |"
                );
                console.log(
                    "|-----------------------------------------------|"
                );

                await oneCycle(
                    page,
                    businessName,
                    credentials,
                    folderPath,
                    screenshotPath
                );
            }
        });
}

main();

async function oneCycle(
    page,
    businessName,
    credentials,
    folderPath,
    screenshotPath
) {
    try {
        await page.waitForTimeout(200);
        // console.log(await page.cookies());
        console.log(" Go to site creation page... ");
        await page.goto("https://websites.godaddy.com/en-US/setup");
        // await page.wait()
        await page.waitForTimeout(1000);

        const randomWord = _.shuffle(cats)[0];
        console.log(" Selecting Category... ");
        await selectCategory(page, randomWord);

        await page.waitForTimeout(1000);

        console.log(" Typing Site Name... ");
        await typeSiteName(page, businessName);

        await page.waitForTimeout(15000);

        console.log(" Publising Site... ");
        const response = await publishSite(page);
        if (response.publicUrl) {
            response.mail = credentials.mail;
            response.password = credentials.password;
            response.createdAt = new Date().toISOString();
            const fileSpec = response.createdAt.replace(/[^0-9]/g, "");
            const respJson = JSON.stringify(response);
            fs.writeFileSync(
                `${folderPath}/godaddySites/bus-${fileSpec}.json`,
                respJson
            );
        }

        console.log("response", response);
    } catch (error) {
        console.log(error);
    } finally {
        const fileSpec = new Date().toISOString().replace(/[^0-9]/g, "");
        await page.screenshot({
            path: `${screenshotPath}/createNewSite-${fileSpec}.png`,
            fullPage: true,
        });
        // await browser.close();
        console.log(`All done, check the screenshot. ✨`);
    }
}

async function selectCategory(page, randomWord) {
    const input = await page.waitForSelector("input:not([disabled])");
    console.log(" ---- ", " Input Found... ");

    input.type(randomWord);
    console.log(" ---- ", " Random Word Typed... ");
    await page.waitForTimeout(5000);
    const listbox = await page.waitForSelector("ul[role='listbox']");
    if (listbox) {
        console.log(" ---- ", " List box found... ");
        const lis = await listbox.$$("li");
        if (lis.length) {
            const targetLi = _.shuffle(lis)[0];
            await targetLi.click();

            console.log(" ---- ", " Category Selected... ");
            await page.waitForTimeout(2000);

            const buttonSubmit = await page.$("button[type='submit']");
            await buttonSubmit.click();
            console.log(" ---- ", " Action Clicked... ");
        }
        // let value = await page.evaluate(el => el.textContent, element)
    }

    // const inputs = await page.$$("input");
    // console.log("inputs len", inputs.length);
    // for (let i in inputs) {
    //     const input = inputs[i];
    //     console.log('await input.getProperty("disabled")', await input.getProperty("disabled"))
    //     if (await input.getProperty("disabled")) continue;
    //     console.log("I am here");
    //     await input.type("вода", { delay: 200 });
    // }
}

async function typeSiteName(page, name) {
    const input = await page.waitForSelector("#Business-Name");

    if (!input) return;
    console.log(" ---- ", " Input Found... ");

    await page.waitForTimeout(1500);
    const delay_ = Math.floor(Math.random() * 300);
    await input.type(name, { delay: delay_ });
    console.log(" ---- ", " Name typed... ");

    await page.waitForTimeout(2000);

    const buttonSubmit = await page.$("button[type='submit']");
    await buttonSubmit.click();
    console.log(" ---- ", " Submit Button Clicked... ");
}

//FOOTER_PUBLISH_SITE
async function publishSite(page) {
    console.log("publishSite(page) ... ");

    const editUrl = await page.url();
    let publicUrl = "";
    let pubButton = null;
    //data-aid="EDITOR_HEADER_PUBLISH_BUTTON"
    try {
        pubButton = await page.waitForSelector(
            "button[data-aid='FOOTER_PUBLISH_SITE']"
        );
    } catch (error) {
        console.log("button[data-aid='FOOTER_PUBLISH_SITE']", "is not found");
    }
    if (!pubButton) {
        try {
            pubButton = await page.waitForSelector(
                "button[data-aid='EDITOR_HEADER_PUBLISH_BUTTON']"
            );
        } catch (error) {
            console.log(
                "button[data-aid='EDITOR_HEADER_PUBLISH_BUTTON']",
                "is not found"
            );
            throw "Unable to publish";
        }
    }
    console.log("publishSite(page) ... ", !!pubButton);
    if (pubButton) {
        pubButton.click();
        await page.waitForTimeout(15000);
        const publicUrlTag = await page.waitForSelector("a.domain-link");
        await publicUrlTag.getProperty("href");

        publicUrl = await page.evaluate(() => {
            const a = document.querySelector("a.domain-link");
            return a.getAttribute("href");
        });
    }

    return {
        editUrl,
        publicUrl,
    };
}
