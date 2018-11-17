const { prompt } = require("enquirer");
const rimraf = require("rimraf");

const tracker = require("../utilities/tracker");

const { logger, logLevel } = require("../logger");

class remove {
    init = async () => {
        let instances = tracker.getInstallations();
        this.versionMapper = {};
        const choices = instances.map(instance => {
            const { name, version, installationPath } = instance;
            this.versionMapper[installationPath] = version;
            return {
                message: `${name} - ${installationPath}`,
                value: installationPath
            };
        });

        const response = await prompt([
            {
                type: "select",
                name: "removePath",
                message: "Which instance do you want to remove ?",
                choices
            }
        ]);

        this.start(response.removePath);
    };

    start = async removePath => {
        // remove the instance
        rimraf.sync(removePath);
        // stop tracking
        tracker.remove(removePath);
        logger("Removed instance " + removePath, logLevel.SUCCESS);
        process.exit();
    };
}
module.exports = remove;
