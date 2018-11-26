const path = require("path");
const fs = require("fs-extra");

const playground = path.join(__dirname, "/../playground");

const installationPath = playground + "/installations";
const cachePath = playground + "/cache";

module.exports = {
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

  /**
   * Creates a folder with 2 files.
   *
   * installPath (string) | The path where the folder will be created
   *
   */
  createInstallation: (installPath, content) => {
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
    fs.writeFileSync(installPath + "/index.txt", content, "utf8");
  },
};
