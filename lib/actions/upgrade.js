const store = require("../store");
const steps = require("../steps");
const install = require("./install");

const tracker = require("../utilities/tracker");
const envEditor = require("../utilities/envEditor");
const backup = require("../utilities/backup");

const { debug, logger, logLevel } = require("../logger");

class upgrade {
  constructor() {
    this.upgradePath = null;
    // {"1.2.3": "/path/to/installation"}
    this.versionMapper = tracker.getVersionInstallationMap();
    this.latestVersion = store.get("version");
    this.installer = new install();
  }
  init() {
    // ask the user which installation to upgrade
    steps.upgrade({ instances: steps.installationChoices() }).then(response => {
      this.upgradePath = response.upgradePath;
      this.validate();

      logger("Performing backup", logLevel.ANNOUNCE);
      backup.perform(response.upgradePath);
      logger("Backup complete", logLevel.ANNOUNCE);

      this.start().then(() => {
        this.finish();
        logger("Upgrade finish successfully", logLevel.SUCCESS);
      });
    });
  }

  validate() {
    const version = this.versionMapper[this.upgradePath];

    if (this.latestVersion === version) {
      logger("You are running the latest version", logLevel.SUCCESS);
      process.exit();
    }
  }

  start() {
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
    this.installer.preInstall();
    return this.installer.install().then(() => {
      this.installer.postInstall();
    });
  }

  finish() {
    logger("Restoring backup", logLevel.ANNOUNCE);
    // move files from backup to installation path
    backup.restore(this.upgradePath);
    tracker.set({
      ...this.installer.inputs,
    });
    debug("Tracker updated");
  }
}

module.exports = upgrade;
