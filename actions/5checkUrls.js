// node actions/5checkUrls.js

const urls = ["https://moenandsonsinrubbersausages.godaddysites.com"];

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

function main() {
    console.log("Launching puppeteer...");

    puppeteer.launch({ headless: true }).then(async (browser) => {
        console.log("Environment almost created..");
        const page = await browser.newPage();
        try {
            for (let i in urls) {
                const url = urls[i];
                await page.goto(url, { waitUntil: "networkidle2" });
                await page.waitForTimeout(1000);

                const sections = await page.$$("section");
                const sectionsCount = sections.length;

                const button = await page.$("[data-aid='HEADER_CTA_BTN']");
                const isButton = !!button;
                let href = "";
                if (button) {
                    href = await button.evaluate((el) => el.href);
                }
                const isHref = !!href;
                const isBase = href.includes("zavod93");
                const isChan = href.includes("chan=");
                const isD1 = href.includes("data1=");
                const isD2 = href.includes("data2=");
                const sectionsLabel = "Sections count: ";
                const buttonLabel = "| Button: ";
                const hrefLabel = "| link: ";

                // console.log(sections.length);
                console.log(
                    sectionsLabel,
                    sectionsCount === 2
                        ? sectionsCount.toString().green
                        : sectionsCount.toString().red,
                    buttonLabel,
                    isButton ? "EXIST".green : "NOT FOUND".red,
                    hrefLabel,
                    isHref ? href.green : href.red,
                    isBase
                        ? "Base Link - Exist".green
                        : "Base Link - Not Found".red,
                    isChan
                        ? "Channel - Exist".green
                        : "Channel - Not Found".red,
                    isD1 ? "Data1 - Exist".green : "Data1 - Not Found".red,
                    isD2 ? "Data2 - Exist".green : "Data2 - Not Found".red
                );
                console.log(
                    "====================================================================="
                );
            }
        } catch (error) {
            console.log(error);
        } finally {
            // await browser.close();
            console.log(`All done. ✨`);
        }
    });
}

main();
