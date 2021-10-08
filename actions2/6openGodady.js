// node ./actions2/4changeLinks.js --key [user] [params]
let editUrl = "";
let url = "https://google.com";

const curr = require("../sessions/current.json");
let changableArray = [];
let USER_NAME = null;
if (curr.mail) {
    USER_NAME = curr.mail;
}
if (curr.sitesToChange) {
    changableArray = curr.sitesToChange;
}
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");
const colors = require("colors");
const prompt = require("prompt-sync")();

const timeMulti = 2;
const tM = timeMulti < 1 ? 1 : timeMulti;

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}

let data_1_label = "data_1_label-is-not-set";
let user_label = "user_label-is-not-set";

function main() {
    // console.log(generateColor());
    // return;
    const args = process.argv;
    if (!args[2] /*|| !args[3]*/) {
        console.log("EXIT".red);
        return console.log(
            "Please setup source".red,
            "source:",
            args[2],
            "can be: --one --current"
        );
    }
    const source = args[2];
    if (source === "--one") {
        // console.log();
        USER_NAME = args[3];
        // DOMAIN_ZONE = args[4];
        businessNames = [args[4]];
        data_1_label = args[5];
        user_label = args[6];
        samara_session = args[7];
        console.log(" ================================== ");
        console.log("Use CLI list:");
        console.log("USER_NAME", USER_NAME);
        console.log("businessNames", businessNames);
        // console.log("DOMAIN_ZONE", DOMAIN_ZONE);
        console.log("data_1_label", data_1_label);
        console.log("user_label", user_label);
        console.log("samara_session", samara_session);
        console.log(" ================================== ");
        const confirm = prompt("Continue? ( y ): ");
        if (confirm !== "y") {
            console.log("user escaped");
            return;
        }
    } else if (source === "--current") {
        console.log(" ================================== ");
        console.log("No Way to start CURRENT");
        
        return 0;
        // console.log("USER_NAME", USER_NAME);
        // console.log("businessNames", businessNames);
        // console.log("DOMAIN_ZONE", DOMAIN_ZONE);
        console.log(
            "data_1_label",
            data_1_label,
            "<- not required. set up in jsons"
        );
        console.log(
            "user_label",
            user_label,
            "<- not required. set up in jsons"
        );
        console.log(" ================================== ");
        const confirm = prompt("Continue? ( y ): ");
        if (confirm !== "y") {
            console.log("user escaped");
            return;
        }
    } else {
        console.log("Undefined source".red);
        console.log("source:", source);
        console.log("EXIT".bgRed);
        return;
    }

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

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (source === "--one") {
        changableArray = [
            {
                filename: businessNames[0],
                dataLabel2: samara_session,
                acc: USER_NAME,
            },
        ];
    }
    puppeteer
        .launch({
            headless: false,
            userDataDir: userDataDirPath,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                `--start-maximized`,
                "--disable-infobars",
            ],
        })
        .then(async (browser) => {
            console.log("Changing site .....");
            for (let ch in changableArray) {
                generateColor();
                const entity = changableArray[ch];

                const dataLabel1 =
                    source === "--one" ? data_1_label : entity.data_1_label;
                const userLabel =
                    source === "--one" ? user_label : entity.user_label;

                const baseUrl = "https://za.zavod93.ru/D4QMKY?chan=";
                entity.baseUrl = baseUrl;
                entity.dataLabel1 = dataLabel1;
                entity.userLabel = userLabel;
                entity.folderPath = folderPath;
                await changeFunction(browser, entity);
            }
        });
}

main();

async function changeFunction(browser, entity) {
    const page = await browser.newPage();
    const { baseUrl, userLabel, dataLabel1, dataLabel2, filename, folderPath } =
        entity;
    entity.url = `${baseUrl}${userLabel}&data1=${dataLabel1}&data2=${dataLabel2}`;
    const busFileJson = fs.readFileSync(
        `${folderPath}/godaddySites/${filename}.json`,
        "utf8"
    );
    const bus = JSON.parse(busFileJson);

    // entity.editUrl = bus.editUrl;
    entity = {
        ...entity,
        ...bus,
        changeHasBeenMade: false,
    };

    try {
        await page.setDefaultNavigationTimeout(tM * 60000);
        await page.setDefaultTimeout(tM * 50000);
        await page.waitForTimeout(tM * 200);
        // // // console.log(await page.cookies());
        await turnOffMsg(page, entity);
        
        return;
    } catch (error) {
        console.log(error);
    } finally {
        const fileSpec = new Date().toISOString().replace(/[^0-9]/g, "");
        // await page.screenshot({
        //   path: `${screenshotPath}/createNewSite-${fileSpec}.png`,
        //   fullPage: true,
        // });

        // await browser.close();
        console.log(`All done, check the screenshot. ✨`);
    }
}

async function changeFooter(page, entity) {
    console.log("  Changing footer ...  ");
    const key = "changeFooter";
    // console.log(entity[key], entity);
    if (entity[key]) {
        console.log("  ", "Footer has been changed".bgMagenta);
        return 2;
    }
    try {
        await page.goto(entity.editUrl);
        await page.waitForTimeout(tM * 5000);

        const footer = await page.waitForSelector(
            "div[data-aid*='WIDGET_WRAPPER_FOOTER']"
        );
        const textElement = await footer.$(".DraftEditor-root");
        await textElement.click();
        await page.waitForTimeout(tM * 1000);

        const muttator = await page.waitForSelector(
            "div[data-aid='MUTATOR_PAGE_NAVIGATION']"
        );
        await page.waitForTimeout(tM * 1000);
        const editorWrapper = await muttator.$$(".DraftEditor-root");
        console.log(editorWrapper.length);

        const spansEditable = await editorWrapper[0].$$("span");
        for (let s in spansEditable) {
            const span = spansEditable[s];
            console.log(s);
            console.log(
                await span.evaluate((el) => {
                    // el.innerText = "";
                    return el.innerText;
                })
            );
            try {
                if (!span) continue;
                await span.click({ clickCount: 3 });
                await page.keyboard.press("Backspace");
                await page.waitForTimeout(tM * 1000);
            } catch (error) {
                console.log("there is no object ...");
            }

            break;
            // console.log(await span.getProperty("data-text"))
        }

        const subStringInpt = await page.waitForSelector(
            "input[widgettype='FOOTER']"
        );
        const subStringInputs = await page.$$("input[widgettype='FOOTER']");
        for (let ss in subStringInputs) {
            const ssInput = subStringInputs[ss];
            // await subStringInpt.evaluate((el) => (el.value = "."));
            await ssInput.click({ clickCount: 3 });
            await page.keyboard.press("Backspace");

            await page.waitForTimeout(tM * 1000);
        }

        const confirmOkFooterChangeBtn = await page.waitForSelector(
            "button[data-aid='EDITOR_HEADER_DONE_BUTTON']"
        );
        await confirmOkFooterChangeBtn.click();
        entity.changeHasBeenMade = true;

        addKeyToBusiness(entity.folderPath, entity.filename, key, true);
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to change footer".bgRed);
        return 0;
    }
}

async function changeHeader(page, entity) {
    console.log("  Changing header ...  ");
    const key = "changeHeader";
    // console.log(entity[key], entity);
    if (entity[key]) {
        console.log("  ", "Header has been changed".bgMagenta);
        return 2;
    }
    try {
        await page.goto(entity.editUrl);
        await page.waitForTimeout(tM * 5000);
        const header = await page.waitForSelector(
            "div[data-aid*='WIDGET_WRAPPER_HEADER']"
        );
        header.click();
        await page.waitForTimeout(tM * 1000);

        // -----------------------------------------------------------------
        // change main text
        const textArea1 = await page.waitForSelector(
            "textarea[widgettype='HEADER'"
        );
        await textArea1.focus();
        // console.log(textArea1);
        await textArea1.evaluate((el) => {
            el.innerText = "Подтвердите, что вы не робот";
            el.value = "Подтвердите, что вы не робот";
        });
        await textArea1.type(" ");

        // -----------------------------------------------------------------
        // change logo text
        await page.waitForTimeout(tM * 1000);
        header.click();
        await page.waitForTimeout(tM * 1000);

        const logoPivotBtn = await page.waitForSelector("button#logoPivot");
        await logoPivotBtn.click();
        const textArea2 = await page.$("textarea");
        await textArea2.focus();
        // console.log(textArea2);
        await textArea2.evaluate((el) => {
            el.innerText = " ";
            el.value = " ";
        });
        await textArea2.focus();
        await page.keyboard.press("Backspace");

        await page.waitForTimeout(tM * 1000);
        const confirmOkLogoChangeBtn = await page.waitForSelector(
            "button[data-aid='EDITOR_HEADER_DONE_BUTTON']"
        );
        await confirmOkLogoChangeBtn.click();

        // -----------------------------------------------------------------
        // add button
        await page.waitForTimeout(tM * 1000);
        header.click();
        await page.waitForTimeout(tM * 1000);
        // ctaPivot
        const ctaPivotBtn = await page.waitForSelector("button#ctaPivot");
        await ctaPivotBtn.click();
        await page.waitForTimeout(tM * 1000);
        const btnSwitch = await page.waitForSelector("input[type='checkbox']");
        const isSwitchOn = await btnSwitch.evaluate((el) => {
            return el.checked;
        });
        console.log("isSwitchOn:", isSwitchOn);
        if (!isSwitchOn) {
            await btnSwitch.click();
            await page.waitForTimeout(tM * 1000);
        }
        const btnText = await page.waitForSelector(
            "input[type='text']"
            // "input[type='text'][id*='id']"
        );
        await btnText.evaluate((el) => (el.value = ""));
        await btnText.type("Я НЕ РОБОТ");
        await page.waitForTimeout(tM * 1000);

        const toogleBtn = await page.waitForSelector("div.dropdown-toggle");
        await toogleBtn.click();
        await page.waitForTimeout(tM * 1000);
        const urlSelectorBtn = await page.waitForSelector(
            "a[value='external']"
        );
        await urlSelectorBtn.click();

        await page.waitForTimeout(tM * 1000);
        const btnUrl = await page.waitForSelector(
            "input[type='text'][id*='URL']"
        );
        await btnUrl.evaluate((el) => (el.value = ""));
        await btnUrl.type(entity.url);
        await page.waitForTimeout(tM * 1000);

        await page.waitForTimeout(tM * 1000);
        const confirmOkBtnChangeBtn = await page.waitForSelector(
            "button[data-aid='EDITOR_HEADER_DONE_BUTTON']"
        );
        await confirmOkBtnChangeBtn.click();

        // ---------------
        // change accent
        const accent = await page.waitForSelector("div[data-value='accent']");
        await accent.click();
        await page.waitForTimeout(tM * 1000);
        // -----------------------------------------------------------------
        // add button
        await page.waitForTimeout(tM * 1000);
        header.click();
        await page.waitForTimeout(tM * 1000);
        const styleBtn = await page.waitForSelector(
            "div[data-aid='CHANGE_STYLE_PIVOT']"
        );
        await styleBtn.click();

        await page.waitForTimeout(tM * 1000);
        const imageChangeBtn = await page.waitForSelector(
            // "button.mx-replace-image-button"
            "div.open-media-manager"
        );
        imageChangeBtn.click();

        await page.waitForTimeout(tM * 1000);
        const inputFile = await page.waitForSelector("input[type='file']");
        await inputFile.uploadFile("./bg.jpg");
        await page.waitForTimeout(tM * 5000);

        await page.waitForSelector("button[data-aid='delete_image_button']");
        const insertBtn = await page.waitForSelector(
            "button[data-aid='insert_images']"
        );
        console.log("clicking insert button ...");
        // console.log(insertBtn);
        await insertBtn.click();
        await page.waitForTimeout(tM * 1000);

        const confirmOkImageChangeBtn = await page.waitForSelector(
            "button[data-aid='EDITOR_HEADER_DONE_BUTTON']"
        );
        await confirmOkImageChangeBtn.click();
        await page.waitForTimeout(tM * 1000);

        const switchViewBtn = await page.waitForSelector(
            "div[data-aid='SITE_TABS_WEBSITE']"
        );
        await switchViewBtn.click();
        await page.waitForTimeout(tM * 1000);
        entity.changeHasBeenMade = true;

        addKeyToBusiness(entity.folderPath, entity.filename, key, true);
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to change header".bgRed);
        return 0;
    }
}

async function deleteBlocks(page, entity) {
    console.log("  blocks deletion started ...  ");
    const key = "deleteBlocks";
    // console.log(entity[key], entity);
    if (entity[key]) {
        console.log("  ", "Blocks have been deleted".bgMagenta);
        return 2;
    }
    try {
        await page.goto(entity.editUrl);
        await page.waitForTimeout(tM * 5000);
        let attempts = 0;
        for (;;) {
            attempts++;
            await page.mouse.move(0, 0);
            if (attempts > 100) {
                throw "loop on block deletion";
            }
            try {
                const renderContainer = await page.waitForSelector(
                    "div#render-container"
                );
                const blocks = await renderContainer.$$(
                    "div[data-aid*='WIDGET_WRAPPER_']"
                );
                console.log(blocks.length);
                // await page.waitForTimeout(tM*1000);
                let skippedBlock = 0;
                for (let i in blocks) {
                    console.log("  -------------------------------- ");
                    // console.log(await blocks[i].evaluate((el) => el.innerText));
                    const dataAid = await blocks[i].evaluate((el) =>
                        el.getAttribute("data-aid")
                    );
                    console.log(dataAid);
                    if (dataAid === "WIDGET_WRAPPER_FOOTER") skippedBlock++;
                    if (dataAid === "WIDGET_WRAPPER_HEADER") skippedBlock++;
                    if (dataAid === "WIDGET_WRAPPER_MESSAGING") skippedBlock++;
                    if (dataAid === "WIDGET_WRAPPER_POPUP") skippedBlock++;
                    if (dataAid === "WIDGET_WRAPPER_COOKIE_BANNER")
                        skippedBlock++;
                }
                console.log("skippedBlock: ", skippedBlock);
                if (blocks.length > skippedBlock) {
                    console.log("there is candidates to delete ....");
                    const firstBlock = blocks[0];
                    const firstBlockOffset = await firstBlock.evaluate((el) => {
                        return el.offsetHeight;
                        //   const offst = el.offsetHeight;
                        //   const container = document.getElementById("render-container");
                        //   container.scrollTop = offst;
                    });
                    // await renderContainer.evaluate((el) => (el.scrollTop = firstBlockOffset));
                    // console.log(firstBlockOffset);
                    const candidate = blocks[1];
                    // const h2Candidate = await candidate.$("h2");
                    const h2Candidate = await candidate.$("section");
                    const h3Candidate = await candidate.$("h3");
                    const hCandidate = h2Candidate ? h2Candidate : h3Candidate;
                    if (hCandidate) {
                        // console.log(hCandidate);
                        await hCandidate.hover();
                        await page.waitForTimeout(tM * 1000);
                        const editBlockBtn = await page.waitForSelector(
                            "div[data-aid='SECTION_MANAGER_SETTINGS']"
                        );
                        for (;;) {
                            try {
                                await editBlockBtn.hover();
                                await page.waitForTimeout(tM * 1000);
                                await editBlockBtn.click();

                                await page.waitForTimeout(tM * 1000);

                                const deleteBtn = await page.waitForSelector(
                                    "div[data-aid='DELETE_WIDGET_FLYOUT_OPTION']"
                                );
                                await deleteBtn.click();
                                break;
                            } catch (error) {
                                console.error(error);
                                console.log(
                                    "Cannot click DELETE_WIDGET_FLYOUT_OPTION"
                                );
                            }
                        }

                        await page.waitForTimeout(tM * 1000);
                        const confirmDeleteBtn = await page.waitForSelector(
                            "button[data-aid='DELETE_WIDGET_MODAL_DELETE']"
                        );
                        await confirmDeleteBtn.click();
                        await page.waitForTimeout(tM * 5000);
                        // delete_widget_flyout_option
                        // DELETE_WIDGET_FLYOUT_OPTION
                    }
                } else {
                    console.log("There is no blocks to delete ....");
                    break;
                }
            } catch (error) {
                console.log(error);
            }
        }
        entity.changeHasBeenMade = true;

        addKeyToBusiness(entity.folderPath, entity.filename, key, true);
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to delete blocks".bgRed);
        return 0;
    }
}

async function deletePages(page, entity) {
    console.log("Delete pages ....");
    const key = "deletePages";
    // console.log(entity[key], entity);
    if (entity[key]) {
        console.log("  ", "Pages have been deleted".bgMagenta);
        return 2;
    }
    try {
        await page.goto(entity.editUrl);
        await page.waitForTimeout(tM * 5000);

        // const settingItems = await page.$$("div[data-aid*='PAGE_TREE_ITEM_']");

        //   const settingItems = await page.$$("div[data-aid='PAGE_SETTINGS_COG_ICON']");
        // console.log("settingItems:", settingItems.length);
        // for (let i = settingItems.length - 1; i >= 0; i--) {
        for (;;) {
            const settingItems = await page.$$(
                "div[data-aid*='PAGE_TREE_ITEM_']"
            );
            const item = settingItems[settingItems.length - 1];
            console.log("item:", 1);
            console.log("item:", await item.evaluate((el) => el.innerText));
            await item.hover();
            await page.waitForTimeout(tM * 1000);
            let itemSettings = await item.$(
                "div[data-aid='PAGE_SETTINGS_COG_ICON']"
            );
            await itemSettings.click();

            try {
                await page.waitForTimeout(tM * 1000);
                const settingMenu = await page.waitForSelector(
                    "div[data-aid='PAGE_KEBAB_MENU']"
                );
                // DELETE_PAGE_BUTTON
                const deleteBtn = await settingMenu.$(
                    "div[data-aid='DELETE_PAGE_BUTTON']"
                );
                if (!deleteBtn) {
                    console.log("There is no delete button in this menu ...");
                    await page.mouse.click(1, 1);
                    await page.waitForTimeout(tM * 1000);

                    break;
                }

                await deleteBtn.click();

                await page.waitForTimeout(tM * 1000);

                const confirmDeleteBtn = await page.waitForSelector(
                    "button[data-aid='DELETE_PAGE_MODAL_DELETE']"
                );
                await confirmDeleteBtn.click();
                await page.waitForTimeout(tM * 1000);
            } catch (error) {
                console.log("Delete button is not found ....");
                continue;
            }
        }
        // PAGE_SETTINGS_COG_ICON
        await page.waitForTimeout(tM * 5000);
        entity.changeHasBeenMade = true;

        addKeyToBusiness(entity.folderPath, entity.filename, key, true);
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to delete pages".bgRed);
        return 0;
    }
}

async function changeTheme(page, entity) {
    console.log("Theme changing ....");
    const key = "changeTheme";
    // console.log(entity[key], entity);
    if (entity[key]) {
        console.log("  ", "Theme has been changed".bgMagenta);
        return 2;
    }
    try {
        await page.goto(entity.editUrl);

        await page.waitForTimeout(tM * 1000);

        const themeTabBtn = await page.waitForSelector(
            "div[data-aid='SITE_TABS_THEME'"
        );
        console.log("Click tab  ....");
        await themeTabBtn.click();

        await page.waitForTimeout(tM * 1000);

        console.log("Button to change theme  ....");
        const changeThemeBtn = await page.waitForSelector(
            "button[data-aid='THEME_CUSTOMIZER_TRY_NEW_LOOK_BUTTON']"
        );
        await changeThemeBtn.click();
        console.log("Select theme  ....");

        const theme = await page.waitForSelector(
            "div[data-aid='THEME_GALLERY_THUMBNAIL_MODERN']"
        );
        theme.click();
        await page.waitForTimeout(tM * 1000);

        const colorAccordion = await page.waitForSelector(
            "div[data-aid='THEME_ACCORDION_COLOR']"
        );
        await colorAccordion.click();

        await page.waitForTimeout(tM * 1000);

        const colorInput = await page.waitForSelector("input.color-input");
        await colorInput.click({ clickCount: 2 });
        const color = generateColor();
        await colorInput.type(color, { delay: 100 });
        await page.waitForTimeout(tM * 1000);
        // await page.keyboard.press("Enter");
        await themeTabBtn.click();
        await page.waitForTimeout(tM * 5000);

        entity.changeHasBeenMade = true;

        addKeyToBusiness(entity.folderPath, entity.filename, key, true);
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to change theme".bgRed);
        return 0;
    }
}

async function turnOffMsg(page, entity) {
    console.log("turning off messages ....");
    const key = "turnOffMsg";
    // console.log(entity[key], entity);
    // if (entity[key]) {
    //     console.log("  ", "Message has been turned off".bgMagenta);
    //     return 2;
    // }
    try {
        await page.goto(entity.editUrl);

        
        return 1;
    } catch (error) {
        console.log(error);
        console.log("Problem to switch msg off".bgRed);
        return 0;
    }
}

async function selectCategory(page, randomWord) {
    const input = await page.waitForSelector("input:not([disabled])");

    input.type(randomWord);
    await page.waitForTimeout(tM * 1000);
    const listbox = await page.waitForSelector("ul[role='listbox']");
    if (listbox) {
        const lis = await listbox.$$("li");
        if (lis.length) {
            const targetLi = _.shuffle(lis)[0];
            await targetLi.click();

            await page.waitForTimeout(tM * 1000);

            const buttonSubmit = await page.$("button[type='submit']");
            await buttonSubmit.click();
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

    await page.waitForTimeout(tM * 1500);
    const delay_ = Math.floor(Math.random() * 300);
    await input.type(name, { delay: delay_ });

    await page.waitForTimeout(tM * 1000);

    const buttonSubmit = await page.$("button[type='submit']");
    await buttonSubmit.click();
}

//FOOTER_PUBLISH_SITE
async function publishSite(page, entity) {
    console.log("publishSite(page, entity) ... ");
    if (!entity.changeHasBeenMade) {
        await page.waitForTimeout(5000);
        return 0;
    }
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
    console.log("publishSite(page, entity) ... ", !!pubButton);
    if (pubButton) {
        pubButton.click();

        const publicUrlTag = await page.waitForSelector("a.domain-link");
        await publicUrlTag.getProperty("href");

        publicUrl = await page.evaluate(() => {
            const a = document.querySelector("a.domain-link");
            return a.getAttribute("href");
        });
    }

    await page.waitForTimeout(3000);
    return {
        editUrl,
        publicUrl,
    };
}

function generateColor() {
    const primaryColors = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
    ];

    const secondaryColors = [1, 2, 3, 4, 1, 2, 3, 4];
    const color = [];
    const prColor = _.shuffle(primaryColors);
    const scColr1 = _.shuffle(secondaryColors);
    const scColr2 = _.shuffle(secondaryColors);
    color.push(`${prColor[0]}${prColor[1]}`);
    color.push(`${scColr1[0]}${scColr1[1]}`);
    color.push(`${scColr2[0]}${scColr2[1]}`);

    const shColor = _.shuffle(color);
    const stringColor = shColor.toString().replace(/\W/g, "");
    return stringColor;
}

function addKeyToBusiness(folderPath, filename, key, value = true) {
    try {
        const busFileJson = fs.readFileSync(
            `${folderPath}/godaddySites/${filename}.json`,
            "utf8"
        );
        const bus = JSON.parse(busFileJson);
        bus[key] = value;
        const __bus__ = JSON.stringify(bus, 0, 5);
        fs.writeFileSync(
            `${folderPath}/godaddySites/${filename}.json`,
            __bus__
        );
        return 1;
    } catch (error) {
        console.log(error);
        console.log(folderPath, filename);
        console.log("Problem to update file".bgRed);
    }
}
