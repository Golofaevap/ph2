// node actions/2regIntoGoDaddyUS.js

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require("fs");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const pluginProxy = require("puppeteer-extra-plugin-proxy");

puppeteer.use(StealthPlugin());

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
// aelbertshvab@yandex.ru+#

const USER_NAME = "manmaro1987@rambler.ru";

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
    const { isGoDaddy } = credentials;

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

    if (isGoDaddy) {
        console.log("GoDaddy has already been created for this user...");
        return;
    }

    const proxy = `https://${credentials.proxy_lgn}:${credentials.proxy_pwd}@${credentials.proxy_ip}:${credentials.proxy_prt}`;
    // console.log(proxy, proxy_options);
    // puppeteer usage as normal
    puppeteer
        .launch({
            headless: false,
            userDataDir: userDataDirPath,
            // ignoreHTTPSErrors: true,
            args: [
                // `--proxy-server=${proxy}`,
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        })
        .then(async (browser) => {
            console.log("Creating account..");
            const page = await browser.newPage();
            if (mustAuth)
                await page.authenticate({
                    username: "user183",
                    password: "7UOJq2lG",
                });
            await page.waitForTimeout(1000);

            await page.setDefaultTimeout(100000);
            await page.setDefaultNavigationTimeout(200000);
            try {
                await page.goto(
                    "https://sso.godaddy.com/v1/account/create?realm=idp&app=dashboard.api&path=%2Fvh-login-redirect&marketid=en-US&iframe=false"
                );
                console.log("Came to godaddy....");
                const result = await fillTheForm(page, credentials);
                if (result === 1) {
                    console.log("GoDaddy is created successfully!...");
                    credentials.isGoDaddy = true;
                    const credentialsJson = JSON.stringify(credentials);
                    fs.writeFileSync(
                        `${folderPath}/credentials.json`,
                        credentialsJson
                    );
                    const fileSpec = new Date().toISOString().slice(0, 10);
                    await page.screenshot({
                        path: `${screenshotPath}/regIntoGoDaddy-${fileSpec}.png`,
                        fullPage: true,
                    });
                }
            } catch (error) {
                console.log(error);
            } finally {
                // await page.screenshot({ path: "testresult.png", fullPage: true });
                // await browser.close();
                console.log(`All done`);
            }
        });
}

main();

async function clickLaunch(page) {
    console.log("--  searcing launch link....");
    let link = await page.waitForSelector("a[href*='launch']");
    console.log("--  launch link found. click(  )....");
    await link.click();
}

async function fillTheForm(page, credentials) {
    // await page.focus("iframe");

    // console.log(await page.$("iframe").html())

    // console.log("--  Looking for iframe ....");
    // const elementHandle = await page.waitForSelector("iframe.sso-widget");
    const frame = page;

    console.log("--  Form found found ....");
    console.log("--  is there email field? ....");
    await frame.waitForSelector("#email");
    await frame.waitForTimeout(1000);

    await frame.focus("#email");
    await frame.waitForTimeout(1000);

    await frame.type("#email", credentials.mail, { delay: 0 });
    console.log("--  email entered ....");

    const enteredEmail = await frame.evaluate(() => {
        const emailEl = document.getElementById("email");
        return emailEl.value;
    });

    console.log("--  email checking ....");
    if (enteredEmail !== credentials.mail) {
        console.log("--  email checking FAILD ....");
        const emailField = await frame.waitForSelector("input#email");
        await emailField.click({ clickCount: 3 });
        emailField.type(credentials.mail);
    }
    console.log("--  email checking Complete ....");

    await frame.waitForTimeout(1000);
    await frame.focus("#username");
    console.log("--  user name = done ....");

    console.log("--  password creating ....");
    await frame.waitForTimeout(1000);
    await frame.focus("#new-password");
    await frame.waitForTimeout(1000);
    await frame.type("#new-password", "x", { delay: 380 });
    await frame.waitForTimeout(1000);
    await frame.focus("#new-password");
    await frame.waitForTimeout(1000);
    await page.keyboard.press("Backspace");
    await frame.waitForTimeout(1000);
    await frame.type("#new-password", credentials.password, { delay: 380 });

    // console.log("--  clicking Accept button ....");
    // await frame.waitForTimeout(2000);
    // const button = await frame.$("#consent-accept-button");
    // await button.click();

    const control = await frame.evaluate(() => {
        const email = document.getElementById("email").value;
        const userName = document.getElementById("username").value;
        const password = document.getElementById("new-password").value;

        return { email, password, userName };
    });
    console.log("--  checking data ....");
    console.log("--", control);
    if (
        control.email !== credentials.mail ||
        control.userName !== credentials.mail ||
        control.password !== credentials.password
    ) {
        console.log("form is not filled correctly...");
        return 0;
    }

    console.log("Everything is ok. Ready to finish registration...");
    await frame.waitForTimeout(5000);
    const submit = await frame.$("#submitBtn");
    await submit.click();
    return 1;
}
