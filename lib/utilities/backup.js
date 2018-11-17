const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const { logger, logLevel } = require("../logger");
const config = require("../config");
/**
 * Backups:
 *  - uploads
 *  - database
 *  - custom css
 *  - .env
 * @param {string} path Installation path
 */

const assets = {
    uploads: "public/uploads",
    css: "public/css/custom.css",
    database: "data",
    env: ".env"
};

const backup = {
    perform: async installPath => {
        const sourcePaths = {};
        Object.keys(assets).map(name => {
            sourcePaths[name] = path.join(installPath, assets[name]);
        });

        // create a hash of the install path. this will be our folder name
        const encodedInstallPath = Buffer.from(installPath).toString("base64");

        // create a backup folder
        const backupFolder = config.backupPath + "/" + encodedInstallPath;
        fs.ensureDirSync(backupFolder);
        try {
            Object.keys(sourcePaths).map(name => {
                const destPath = backupFolder + "/" + assets[name];
                console.log("destPath :", destPath);
                fs.ensureDirSync(destPath);
                fs.copySync(sourcePaths[name], destPath);
            });
            return true;
        } catch (err) {
            logger(err.message, logLevel.ERROR);
            logger(
                "Error while taking backup. Installation cannot proceed.",
                logLevel.ERROR
            );
            process.exit();
        }
    },
    restore: async installPath => {
        // get the back folder (encrypted name)
        const backupFolder = Buffer.from(installPath).toString("base64");
        // get the path of the backup folder. this will be the source
        const sourcePath = config.backupPath + "/" + backupFolder;
        fs.copySync(sourcePath, installPath);
    },
    delete: installPath => {
        // get the back folder (encrypted name)
        const backupFolder = Buffer.from(installPath).toString("base64");
        // get the path of the backup folder. this will be the source
        const sourcePath = config.backupPath + "/" + backupFolder;
        rimraf.sync(sourcePath);
    }
};

module.exports = backup;
