const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");

const config = require("../config");

const tracker = require("../utilities/tracker");

const { debug, logger, logLevel } = require("../logger");

class list {
  init() {
    const installations = tracker.getInstallations();
    // get all  the versions
    const versions = installations.map(item => item.version);
    const cacheInstalls = this.getDirectories(config.cachePath);

    cacheInstalls.map(cacheVersion => {
      if (versions.indexOf(cacheVersion) >= 0) {
        return;
      }

      const unwantedPath = path.join(config.cachePath, cacheVersion);
      rimraf.sync(unwantedPath);
      debug("Removed cache: " + unwantedPath);
    });
    logger("Purged old cache", logLevel.SUCCESS);
    process.exit();
  }

  getDirectories(path) {
    let filesAndDirectories = fs.readdirSync(path);
    let directories = [];

    filesAndDirectories.map(name => {
      try {
        const stat = fs.statSync(path + "/" + name);
        if (stat.isDirectory()) {
          directories.push(name);
        }
      } catch (error) {
        console.log("error :", error);
      }
    });
    return directories;
  }
}
module.exports = list;
