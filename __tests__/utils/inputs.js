const path = require("path");
const fs = require("fs-extra");
const envEditor = require("../../lib/utilities/envEditor");
const playgroundPath = path.join(__dirname, "/../playground");

const installationPath = path.join(__dirname, "/../playground/installations");
const cachePath = path.join(__dirname, "../playground/cache");

const inputs = {
  installationPath,
  cachePath,
  setInstallDefaults: installer => {
    installer.cachePath = cachePath;
    installer.inputs.installationPath = installationPath;
    installer.inputs.version = "1.0";
    installer.inputs.rootUrl = "rootUrl";
    installer.inputs.apiUrl = "apiUrl";
    installer.inputs.uploadUrl = "uploadUrl";
    installer.inputs.appPort = 50;
    installer.inputs.apiPort = 100;
    installer.foldersToLink = ["index.txt"];

    return installer;
  },
  createInstallation: (installPath, version) => {
    fs.ensureDirSync(installPath);
    const env = [
      "rootUrl=http://localhost:4040",
      "apiUrl=http://localhost:3030/graphql",
      "uploadUrl=http://localhost:3030/upload",
      "appPort=4040",
      "apiPort=3030",
      "baseName=",
    ];
    fs.writeFileSync(installPath + "/.env", env.join("\n"), "utf8");
    fs.writeFileSync(installPath + "/index.txt", version, "utf8");
  },
  createPlayground: action => {
    fs.ensureDirSync(playgroundPath + "/installations");
    // creates the folder for a secific action (install, upgrade, ...etc)
    switch (action) {
      case "install":
        break;
      case "upgrade":
        break;
      default:
        break;
    }
  },
};
module.exports = inputs;
