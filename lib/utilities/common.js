const shell = require("shelljs");
const fs = require("fs");
const { log, logLevel } = require("../logger");

const common = {
    isDirEmpty: dirname => {
        const files = fs.readdirSync(dirname + "/");
        return files.length > 0 ? false : true;
    },

    getDownloadObj: async (releases, version) => {
        let link = null;
        // check if the appropriate version is available
        for (var i = 0; i < releases.length; i++) {
            const { zipball_url } = releases[i];
            const _version = common.getVersionFromRelease(zipball_url);
            if (_version === "v" + version || _version === version) {
                link = releases[i];
                break;
            }
        }
        if (!link) {
            log("No package found of version " + version, logLevel.ERROR);
            process.exit();
        }
        return {
            zipball: link.zipball_url,
            version: link.zipball_url.substr(
                link.zipball_url.lastIndexOf("/") + 1
            )
        };
    },
    getVersionFromRelease: releaseUrl => {
        return releaseUrl.substr(releaseUrl.lastIndexOf("/") + 1);
    },
    /**
     * The path where letterpad will be installed.
     * - The user may run the cli from a different folder and install in a different folder.
     * - If the path is not provided then the current folder is the installation folder.
     * - If the folder does not exist, create it.
     *
     * @param {*} dest Installation path
     * @returns path
     * @memberof install
     */
    getInstallationPath(dest) {
        // installation path is the path where the script was run
        let installationPath = process.cwd();
        // if the user gave a different path, join it
        if (typeof dest === "string") {
            if (dest.indexOf("/") > 0) {
                installationPath = path.join(installationPath, dest);
            }
            installationPath = dest;
        }
        // check if installation path is ok
        if (!fs.existsSync(installationPath)) {
            shell.mkdir(installationPath);
        }

        return installationPath;
    },
    uiTableChars: {
        top: "═",
        "top-mid": "╤",
        "top-left": "╔",
        "top-right": "╗",
        bottom: "═",
        "bottom-mid": "╧",
        "bottom-left": "╚",
        "bottom-right": "╝",
        left: "║",
        "left-mid": "╟",
        mid: "─",
        "mid-mid": "┼",
        right: "║",
        "right-mid": "╢",
        middle: "│"
    }
};
module.exports = common;
