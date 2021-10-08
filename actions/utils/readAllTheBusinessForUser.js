// node actions/utils/readAllTheBusinessForUser.js
const fs = require("fs");

function main() {
  const USER_NAME = "rihuman1989@autorambler.ru";

  const fSessions = getDirectories("./sessions");
  console.log("Sessions: ", fSessions);
  if (!fSessions.includes(USER_NAME)) {
    console.log("User does not found!");
    return;
  }
  console.log("Creating folders pathes...");

  const folderPath = `./sessions/${USER_NAME}`;
  // const userDataDirPath = `./sessions/${USER_NAME}/userDataDir`;
  // const screenshotPath = `./sessions/${USER_NAME}/screnshots`;
  const files = getFiles(`${folderPath}/godaddySites`);

  console.log(files);
  for (let f in files) {
    const file = files[f];

    const objRaw = fs.readFileSync(
      `${folderPath}/godaddySites/${file}`,
      "utf8"
    );
    objJson = JSON.parse(objRaw);
    console.log(`${objJson.publicUrl}`);
    // console.log( `{file.slice(0, file.length-5)}`);
  }
  for (let f in files) {
    const file = files[f];
    const objRaw = fs.readFileSync(`${folderPath}/godaddySites/${file}`, "utf8");
    objJson = JSON.parse(objRaw);
    // console.log( `${objJson.publicUrl}`);
    console.log(`${file.slice(0, file.length - 5)}`);
  }
}

main();

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

function getFiles(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isFile() && file.includes("bus-");
  });
}
