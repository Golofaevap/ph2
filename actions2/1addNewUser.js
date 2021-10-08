// node actions2/1addNewUser.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");
const colors = require("colors");
const validator = require("email-validator");

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
// const NEW_USER_NAME = "manmaro1987@rambler.ru";
// const NEW_USER_PASS = "mg0kYkcD5mg0kYkcD5";

function main() {
    const args = process.argv;
    if (!args[2] || !args[3]) {
        return console.log(
            "EXIT\n".red,
            " - - ",
            "Please setup email and passwords".red,
            "email:",
            args[2],
            "pwds:",
            args[3]
        );
    }
    const NEW_USER_NAME = args[2];
    const NEW_USER_PASS = args[3];
    const NEW_SRNG_PASS = `${NEW_USER_PASS}${NEW_USER_PASS}`;
    const isEmail = validator.validate(NEW_USER_NAME); // true
    if (!isEmail) {
        return console.log(
            "EXIT\n".red,
            " - - ",
            "User name must be an email".red,
            "email:",
            args[2],
            "pwds:",
            args[3]
        );
    }
    if (NEW_SRNG_PASS.length < 10) {
        return console.log(
            "EXIT\n".red,
            " - - ",
            "Password is too weak. At least 5 letters. Capital and lower case, numbers and special characters"
                .red,
            "email:",
            args[2],
            "pwds:",
            args[3]
        );
    }

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
        password: NEW_SRNG_PASS,
        passwordEmail: NEW_USER_PASS,
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
