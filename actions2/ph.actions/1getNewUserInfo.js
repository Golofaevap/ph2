var generator = require("generate-password");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cfg = require("./config");
const fs = require("fs");
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory();
    });
}
const url =
    "https://www.fakenamegenerator.com/advanced.php?t=country&n%5B%5D=us&c%5B%5D=us&gen=50&age-min=19&age-max=51";

const batchSize = 5;

async function main() {
    // const array = [];
    // for (let i = 0; i < batchSize; i++) {
    const row = {};
    const response = await fetch(url);
    const html = await response.text();
    // console.log(html);
    const $ = cheerio.load(html);
    const infoSection = $("div.address", html);

    row.name = infoSection.first().find("h3").first().text();
    row.fakeAddress = infoSection.first().find("div.adr").first().text().replace("\n", "").trim();
    const dls = $("dl.dl-horizontal");

    dls.each(function () {
        var el = $(this);
        // console.log(el.text());
        const head = el.find("dt").first();
        const headText = head.text().toLowerCase();
        // console.log("head", headText);
        if (headText.includes("email")) {
            row.recoveryEmail = el.find("dd").first().text().split(" ")[0];
            row.workFakeEmail = el.find("div.adtl").find("a").first().attr("href");
        }
        if (headText.includes("vehicle")) {
            row.vehicle = el.find("dd").first().text();
        }
        if (headText.includes("favorite color")) {
            row.favoriteColor = el.find("dd").first().text();
        }
        if (headText.includes("birthday")) {
            row.birthday = el.find("dd").first().text();
        }
        // if (headText.includes("age")) {
        //     row.age = el.find("dd").first().text();
        // }
        if (headText.includes("phone")) {
            row.phone = el.find("dd").first().text();
        }
        if (headText.includes(" maiden name")) {
            row.maidenName = el.find("dd").first().text();
        }
        row.password = generator.generate({
            length: 10,
            numbers: true,
        });
        row.gmail =
            `${row.recoveryEmail}`.split("@")[0] +
            generator.generate({
                length: 4,
                numbers: true,
            }) +
            "@gmail.com";
        row.gmail = row.gmail.toLowerCase();
        row.email = `${row.recoveryEmail}`.toLowerCase();
    });

    //     // console.log(row, dls.length);
    //     array.push(row);
    // }
    console.log(row);
    console.log(cfg);
    const fSessions = getDirectories(cfg.sessionsFolder);
    console.log("Sessions: ", fSessions);
    if (fSessions.includes(row.email)) {
        console.log("User creation failed! User is already exists");
        return;
    }

    console.log("Creating folders...");

    const folderPath = `${cfg.sessionsFolder}/${row.email}`;
    const userDataDirPath = `${cfg.sessionsFolder}/${row.email}/userDataDir`;
    // const screenshotPath = `${cfg.sessionsFolder}/${NEW_USER_NAME}/screnshots`;
    // const godaddySitesPath = `${cfg.sessionsFolder}/${NEW_USER_NAME}/godaddySites`;

    fs.mkdirSync(folderPath);
    fs.mkdirSync(userDataDirPath);
    // fs.mkdirSync(screenshotPath);
    // fs.mkdirSync(godaddySitesPath);
    console.log("Saving Credentials...");

    const credentials = {
        mail: row.email,
        password: row.password,
        headless: false,
        proxy_ip: "",
        proxy_prt: "",
        proxy_lgn: "",
        proxy_pwd: "",
        name: row.name,
        nikname:
            row.name.toLowerCase().replace(/[^a-z]/g, "") +
            generator.generate({
                length: 4,
                numbers: true,
            }),
        workFakeEmail: row.workFakeEmail,
        folderPath,
        userDataDirPath,
    };
    if (`${row.email}`.includes("teleworm")) return;
    if (`${row.email}`.includes("jourrapide")) return;

    const credentialsJson = JSON.stringify(credentials);

    fs.writeFileSync(`${folderPath}/credentials.json`, credentialsJson);
    return row;
}

main();
