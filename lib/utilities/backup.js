const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const { debug, logger, logLevel } = require("../logger");
const config = require("../config");
/**
 * Backups:
 *  - uploads
 *  - database
 *  - custom css
 *  - .env
 * @param {string} path Installation path
 */

const filesToBackup = {
  uploads: "public/uploads",
  css: "public/css/custom.css",
  database: "data",
  env: ".env",
  client: "client",
};

const backup = {
  perform: async installPath => {
    const pathsToBackup = {};
    Object.keys(filesToBackup).map(name => {
      pathsToBackup[name] = path.join(installPath, filesToBackup[name]);
    });

    // create a hash of the install path. this will be our folder name
    const encodedInstallPath = Buffer.from(installPath).toString("base64");

    // Ensure a backup folder exist for this installation
    const backupFolder = config.backupPath + "/" + encodedInstallPath;

    try {
      Object.keys(pathsToBackup).map(name => {
        const destPath = path.join(backupFolder, filesToBackup[name]);
        // backup
        debug("[backup] " + pathsToBackup[name]);
        fs.copySync(pathsToBackup[name], destPath);
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
  },
};

module.exports = backup;
