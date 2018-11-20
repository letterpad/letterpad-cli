const store = require("../store");
const steps = require("../steps");
const install = require("./install");

const tracker = require("../utilities/tracker");
const envEditor = require("../utilities/envEditor");
const backup = require("../utilities/backup");

const { debug, logger, logLevel } = require("../logger");

class upgrade {
    upgradePath = null;
    versionMapper = null;
    latestVersion = null;
    installer = new install();

    init = async () => {
        this.latestVersion = store.get("version");

        // {"1.2.3": "/path/to/installation"}
        this.versionMapper = tracker.getVersionInstallationMap();

        // ask the user which installation to upgrade
        const response = await steps.upgrade({ instances: choices });

        this.upgradePath = response.upgradePath;

        logger("Performing backup", logLevel.ANNOUNCE);
        backup.perform(response.upgradePath);
        logger("Backup complete", logLevel.ANNOUNCE);

        await this.validate();
        await this.start();
        await this.finish();

        logger("Upgrade finish successfully", logLevel.SUCCESS);
    };

    validate = async () => {
        const version = this.versionMapper[this.upgradePath];

        if (this.latestVersion === version) {
            logger("You are running the latest version", logLevel.SUCCESS);
            process.exit();
        }
    };

    start = async () => {
        logger("Starting upgrade..", logLevel.ANNOUNCE);
        const envFileMap = envEditor.readEnv(this.upgradePath + "/.env");
        this.installer.inputs = {
            rootUrl: envFileMap.rootUrl,
            uploadUrl: envFileMap.uploadUrl,
            appPort: envFileMap.appPort,
            apiPort: envFileMap.apiPort,
            installationPath: this.upgradePath,
            version: this.latestVersion,
        };
        this.installer.force = true;
        await this.installer.preInstall();
        await this.installer.install();
        await this.installer.postInstall();
    };

    finish = () => {
        logger("Restoring backup", logLevel.ANNOUNCE);
        // move files from backup to installation path
        backup.restore(this.upgradePath);
        tracker.set({
            ...this.installer.inputs,
        });
        debug("Tracker updated");
    };
}

module.exports = upgrade;
