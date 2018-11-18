const { prompt } = require("enquirer");
const rimraf = require("rimraf");

const tracker = require("../utilities/tracker");
const steps = require("../steps");

const { logger, logLevel } = require("../logger");

class unlink {
    init = async () => {
        const response = await prompt([
            {
                type: "select",
                name: "unlinkPath",
                message: "Which instance do you want to unlink ?",
                choices: steps.installationChoices()
            }
        ]);

        this.start(response.unlinkPath);
    };

    start = async unlinkPath => {
        // unlink the instance
        rimraf.sync(unlinkPath);
        // stop tracking
        tracker.unlink(unlinkPath);
        logger("unlinkd instance " + unlinkPath, logLevel.SUCCESS);
        process.exit();
    };
}
module.exports = unlink;
