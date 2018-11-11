const path = require("path");
const os = require("os");

const root = path.join(__dirname, "../");

const config = {
    root,
    repository: "https://github.com/letterpad/letterpad/",
    cachePath: path.join(os.homedir(), "/.cache/letterpad"),
    instanceInfoPath: path.join(os.homedir(), "/.cache/instance.json"),
    tempInstallPath: path.join(root, ".temp")
};

module.exports = config;
