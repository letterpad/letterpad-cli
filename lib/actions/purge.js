const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");

const config = require("../config");

const tracker = require("../utilities/tracker");

const { debug, logger, logLevel } = require("../logger");

class list {
    init = async () => {
        const installations = tracker.getInstallations();
        // get all  the versions
        const versions = installations.map(item => item.version);
        const cacheInstalls = await this.getDirectories(config.cachePath);

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
    };

    getDirectories = async path => {
        let filesAndDirectories = await fs.readdir(path);
        let directories = [];
        await Promise.all(
            filesAndDirectories.map(name => {
                return fs.stat(path + "/" + name).then(stat => {
                    if (stat.isDirectory()) directories.push(name);
                });
            })
        );
        return directories;
    };
}
module.exports = list;
