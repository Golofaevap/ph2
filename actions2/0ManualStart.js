// node ./actions2/0ManualStart.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");
const colors = require("colors");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
// aelbertshvab@yandex.ru+#

// const USER_NAME = "patosgamb1980@ro.ru";
// const USER_NAME = "manmaro1987@rambler.ru";
// const USER_NAME = "johnatanmcsteevenson@yandex.ru";

function main() {
    const args = process.argv;
    if (!args[2] /*|| !args[3]*/) {
        return console.log(
            "Please setup email".red,
            "email:",
            args[2]
            /*, "pwds:",
            args[3]*/
        );
    }
    const USER_NAME = args[2];

    const fSessions = getDirectories("./sessions");
    console.log("Sessions: ", fSessions);
    if (!fSessions.includes(USER_NAME)) {
        console.log("User is not found!".red);
        return;
    }
    console.log("Creating folders names...");

    const folderPath = `./sessions/${USER_NAME}`;
    const userDataDirPath = `./sessions/${USER_NAME}/userDataDir`;
    const screenshotPath = `./sessions/${USER_NAME}/screnshots`;

    //   return;

    // puppeteer usage as normal
    console.log("Launching puppeteer...");

    puppeteer
        .launch({
            headless: false,
            userDataDir: userDataDirPath,
            ignoreDefaultArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
        .then(async (browser) => {
            console.log("Environment almost created..");
            const page = await browser.newPage();
            try {
                await page.goto("https://google.com");
                await page.waitForTimeout(1000);
            } catch (error) {
                console.log(error);
            } finally {
                // await browser.close();
                console.log(`Started. Use it`);
            }
        });
}

main();
