const path = require("path");

const installationPath = path.join(
    __dirname,
    "/../playground/installations/lp"
);
const cachePath = path.join(__dirname, "../playground/cache");

module.exports = {
    installationPath,
    cachePath,
    setInstallDefaults: installer => {
        installer.releases = [
            { version: 1, zipball_url: "http://github.com/version/1" }
        ];
        installer.cachePath = cachePath;
        installer.inputs.installationPath = installationPath;
        installer.inputs.version = 1;
        installer.inputs.rootUrl = "rootUrl";
        installer.inputs.apiUrl = "apiUrl";
        installer.inputs.uploadUrl = "uploadUrl";
        installer.inputs.appPort = 50;
        installer.inputs.apiPort = 100;
        installer.foldersToLink = ["index.txt"];

        return installer;
    }
};
