const { prompt } = require("enquirer");
const rimraf = require("rimraf");

const tracker = require("../utilities/tracker");
const steps = require("../steps");

const { logger, logLevel } = require("../logger");

class remove {
    init = async () => {
        const response = await prompt([
            {
                type: "select",
                name: "removePath",
                message: "Which instance do you want to remove ?",
                choices: steps.installationChoices()
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
