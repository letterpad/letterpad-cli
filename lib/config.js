const path = require("path");
const os = require("os");

const root = path.join(__dirname, "../");
const cachePath = path.join(os.homedir(), "/.cache/letterpad");

const config = {
    root,
    repository: "https://github.com/letterpad/letterpad/",
    cachePath,
    instanceInfoPath: cachePath + "/instance.json",
    tempInstallPath: path.join(root, ".temp")
};

module.exports = config;
