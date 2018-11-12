const shell = require("shelljs");
const { prompt } = require("enquirer");
const { logger, logLevel } = require("../logger");
const steps = require("../steps");
const common = require("../utilities/common");
const tracker = require("../utilities/tracker");
const install = require("./install");

class upgrade {
    upgradePath = null;
    versionMapper = null;

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
        const upgradeSteps = [...steps.upgrade];
        upgradeSteps[0] = {
            ...upgradeSteps[0],
            choices
        };
        const response = await prompt(upgradeSteps);
        this.start(response.upgradePath);
    };

    start = async upgradePath => {
        this.upgradePath = upgradePath;
        const version = this.versionMapper[upgradePath];

        const installer = new install();
        await installer.setDefaults();
        if (installer.version === version) {
            logger("You are running the latest version", logLevel.SUCCESS);
            process.exit();
        }
        logger("Starting upgrade..", logLevel.ANNOUNCE);
        installer.installationPath = upgradePath;
        installer.force = true;
        await installer.performInstall();

        // delete old tracker under new version
        //await installer.setTracker();
    };
}

module.exports = upgrade;
