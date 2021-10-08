// node ./actions/4changeLinks.js
let editUrl = "";
let url = "https://google.com";

const curr = require("../sessions/current.json");
let changableArray = [];
let USER_NAME = null;
if(curr.mail){
    USER_NAME = curr.mail;
}
if(curr.sitesToChange){
    changableArray = curr.sitesToChange;
}
const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const _ = require("lodash");

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

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    

    const dataLabel1 = "24_04";
    const userLabel = "nn";
    const baseUrl = "https://za.zavod93.ru/D4QMKY?chan=";
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    puppeteer
        .launch({
            headless: false,
            userDataDir: userDataDirPath,
            args: [
                "--start-maximized", // you can also use '--start-fullscreen'
            ],
        })
        .then(async (browser) => {
            console.log("Changing site .....");
            for (let ch in changableArray) {
                const entity = changableArray[ch];
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
    const {
        baseUrl,
        userLabel,
        dataLabel1,
        dataLabel2,
        filename,
        folderPath,
    } = entity;
    entity.url = `${baseUrl}${userLabel}&data1=${dataLabel1}&data2=${dataLabel2}`;
    const busFileJson = fs.readFileSync(
        `${folderPath}/godaddySites/${filename}.json`,
        "utf8"
    );
    const bus = JSON.parse(busFileJson);

    entity.editUrl = bus.editUrl;

    try {
        await page.setDefaultNavigationTimeout(tM * 60000);
        await page.setDefaultTimeout(tM * 50000);
        await page.waitForTimeout(tM * 200);
        // // // console.log(await page.cookies());
        await turnOffMsg(page, entity);
        await deletePages(page, entity);
        await changeTheme(page, entity);
        await deleteBlocks(page, entity);
        await changeHeader(page, entity);
        await changeFooter(page, entity);
        await publishSite(page, entity);
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
            if(!span) continue;
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
}

async function changeHeader(page, entity) {
    console.log("  Changing header ...  ");
    await page.goto(entity.editUrl);
    await page.waitForTimeout(tM * 5000);
    const header = await page.waitForSelector(
        "div[data-aid*='WIDGET_WRAPPER_HEADER']"
    );
    header.click();
    await page.waitForTimeout(tM * 1000);

    // -----------------------------------------------------------------
    // change main text
    const textArea1 = await page.waitForSelector("textarea[widgettype='HEADER'");
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
    const btnText = await page.waitForSelector("input[type='text'][id*='id']");
    await btnText.evaluate((el) => (el.value = ""));
    await btnText.type("Я НЕ РОБОТ");
    await page.waitForTimeout(tM * 1000);

    const toogleBtn = await page.waitForSelector("div.dropdown-toggle");
    await toogleBtn.click();
    await page.waitForTimeout(tM * 1000);
    const urlSelectorBtn = await page.waitForSelector("a[value='external']");
    await urlSelectorBtn.click();

    await page.waitForTimeout(tM * 1000);
    const btnUrl = await page.waitForSelector("input[type='text'][id*='URL']");
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
        "button.mx-replace-image-button"
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
}

async function deleteBlocks(page, entity) {
    console.log("  blocks deletion started ...  ");
    await page.goto(entity.editUrl);
    await page.waitForTimeout(tM * 5000);
    for (;;) {
        try {
            const renderContainer = await page.waitForSelector(
                "div#render-container"
            );
            const blocks = await renderContainer.$$(
                "div[data-aid*='WIDGET_WRAPPER_']"
            );
            await page.mouse.move(0, 0);
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
                if (dataAid === "WIDGET_WRAPPER_COOKIE_BANNER") skippedBlock++;
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
}

async function deletePages(page, entity) {
    await page.goto(entity.editUrl);
    await page.waitForTimeout(tM * 5000);

    // const settingItems = await page.$$("div[data-aid*='PAGE_TREE_ITEM_']");

    //   const settingItems = await page.$$("div[data-aid='PAGE_SETTINGS_COG_ICON']");
    // console.log("settingItems:", settingItems.length);
    // for (let i = settingItems.length - 1; i >= 0; i--) {
    for (;;) {
        const settingItems = await page.$$("div[data-aid*='PAGE_TREE_ITEM_']");
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
}

async function changeTheme(page, entity) {
    await page.goto(entity.editUrl);

    await page.waitForTimeout(tM * 1000);
    console.log("Theme changing ....");

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
    await colorInput.type("00FF00", { delay: 100 });
    // await colorInput.click({ clickCount: 1 });
    // await page.keyboard.press("0");
    // await page.keyboard.press("0");
    // await page.keyboard.press("f");
    // await page.keyboard.press("f");
    // await page.keyboard.press("0");
    // await page.keyboard.press("0");
    await page.waitForTimeout(tM * 1000);
    // await page.keyboard.press("Enter");
    await themeTabBtn.click();
    await page.waitForTimeout(tM * 5000);
}

async function turnOffMsg(page, entity) {
    await page.goto(entity.editUrl);

    await page.waitForTimeout(tM * 1000);
    console.log("Message button click ....");
    const messageBtn = await page.waitForSelector(
        "div[data-aid='ADDON_BUTTON_MESSAGING']"
    );
    await messageBtn.click();
    console.log("turning off messages ....");
    const checkboxMail = await page.waitForSelector("input[type='checkbox']");
    await checkboxMail.click();

    const mailChangesSubmitBtn = await page.waitForSelector(
        "button[data-aid='EDITOR_HEADER_DONE_BUTTON']"
    );
    await mailChangesSubmitBtn.click();
    await page.waitForTimeout(tM * 5000);
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
