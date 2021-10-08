// node actions/1addNewUser.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
// aelbertshvab@yandex.ru+#
// risfosi1981@autorambler.ru ; b713Xhjy ;Любимое блюдо;342142
const NEW_USER_NAME = "manmaro1987@rambler.ru";
const NEW_USER_PASS = "mg0kYkcD5mg0kYkcD5";

function main() {
    const fSessions = getDirectories("./sessions");
    console.log("Sessions: ", fSessions);
    if (fSessions.includes(NEW_USER_NAME)) {
        console.log("User creation failed! User is already exists");
        return;
    }
    console.log("Creating folders...");

    const folderPath = `./sessions/${NEW_USER_NAME}`;
    const userDataDirPath = `./sessions/${NEW_USER_NAME}/userDataDir`;
    const screenshotPath = `./sessions/${NEW_USER_NAME}/screnshots`;
    const godaddySitesPath = `./sessions/${NEW_USER_NAME}/godaddySites`;

    fs.mkdirSync(folderPath);
    fs.mkdirSync(userDataDirPath);
    fs.mkdirSync(screenshotPath);
    fs.mkdirSync(godaddySitesPath);
    console.log("Saving Credentials...");

    const credentials = {
        mail: NEW_USER_NAME,
        password: NEW_USER_PASS,
        headless: false,
        proxy_ip: "",
        proxy_prt: "",
        proxy_lgn: "",
        proxy_pwd: "",
    };
    const credentialsJson = JSON.stringify(credentials);

    fs.writeFileSync(`${folderPath}/credentials.json`, credentialsJson);

    //   return;

    // puppeteer usage as normal
    console.log("Launching puppeteer...");

    puppeteer
        .launch({ headless: false, userDataDir: userDataDirPath })
        .then(async (browser) => {
            console.log("Environment almost created..");
            const page = await browser.newPage();
            try {
                await page.goto("https://amazon.com");
                await page.waitForTimeout(1000);
            } catch (error) {
                console.log(error);
            } finally {
                await browser.close();
                console.log(`All done. ✨`);
            }
        });
}

main();
