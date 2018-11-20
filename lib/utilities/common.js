const shell = require("shelljs");
const fs = require("fs-extra");
const path = require("path");
const { log, logger, logLevel } = require("../logger");

const common = {
    isDirEmpty: dirname => {
        const files = fs.readdirSync(dirname);
        return files.length > 0 ? false : true;
    },

    getDownloadObj: async (releases, versionToInstall) => {
        let link = null;
        // check if the appropriate version is available
        for (var i = 0; i < releases.length; i++) {
            const { version } = releases[i];
            if (
                version === "v" + versionToInstall ||
                version === versionToInstall
            ) {
                link = releases[i];
                break;
            }
        }
        if (!link) {
            logger("No package found of version " + version, logLevel.ERROR);
            process.exit();
        }
        return {
            zipball: link.zipball_url,
            version: link.zipball_url.substr(
                link.zipball_url.lastIndexOf("/") + 1
            ),
        };
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
            if (dest.indexOf("/") === 0) {
                installationPath = dest;
            } else {
                installationPath = path.join(installationPath, "/", dest);
            }
        }
        // check if installation path is ok
        fs.ensureDirSync(installationPath);

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
        middle: "│",
    },
    isEqual: (a, b) => {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    },
};
module.exports = common;
