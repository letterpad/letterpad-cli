const { debug, logger, logLevel } = require("../logger");
const steps = require("../steps");
const tracker = require("../utilities/tracker");
const envEditor = require("../utilities/envEditor");
const backup = require("../utilities/backup");
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
        const response = await steps.upgrade({ instances: choices });

        logger("Performing backup", logLevel.ANNOUNCE);
        backup.perform(response.upgradePath);
        //this.start(response.upgradePath);
    };

    start = async upgradePath => {
        this.upgradePath = upgradePath;
        const version = this.versionMapper[upgradePath];

        if (installer.version === version) {
            logger("You are running the latest version", logLevel.SUCCESS);
            process.exit();
        }
        logger("Starting upgrade..", logLevel.ANNOUNCE);
        const envFileMap = envEditor.readEnv(upgradePath + "/.env");

        installer.inputs = {
            rootUrl: envFileMap.rootUrl,
            appPort: envFileMap.appPort,
            apiPort: envFileMap.apiPort
        };
        installer.installationPath = upgradePath;
        installer.force = true;
        await installer.performInstall();

        logger("Restoring backup", logLevel.ANNOUNCE);
        // move files from backup to installation path
        backup.restore(upgradePath);
    };
}

module.exports = upgrade;
