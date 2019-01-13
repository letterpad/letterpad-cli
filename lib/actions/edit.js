const { prompt } = require("enquirer");
const fs = require("fs-extra");
const rimraf = require("rimraf");
const steps = require("../steps");

const tracker = require("../utilities/tracker");
const envEditor = require("../utilities/envEditor");

const {
  isEqual,
  isDirEmpty,
  getInstallationPath,
} = require("../utilities/common");

const { logger, debug, logLevel } = require("../logger");

class edit {
  init() {
    prompt([
      {
        type: "select",
        name: "editPath",
        message: "Which instance do you want to edit ?",
        choices: steps.installationChoices(),
      },
    ]).then(response => {
      this.start(response.editPath);
    });
  }

  start(editPath) {
    let instances = tracker.read();
    const { version, ...selectedInstance } = instances[editPath];
    // ignore version in this process as it wont take care of version changes

    steps.editInputs(selectedInstance).then(response => {
      const installationPath = getInstallationPath(response.installationPath);

      if (isEqual(selectedInstance, response)) {
        logger("Nothing to upgrade", logLevel.ERROR);
        process.exit();
      }

      if (selectedInstance.installationPath !== installationPath) {
        const oldInstallPath = selectedInstance.installationPath;

        debug(`Moving contents to - ${installationPath}`);

        // check if the path is empty. Avoid averwriting.
        if (!isDirEmpty(installationPath)) {
          logger(`The installation directory is not empty.`, logLevel.ERROR);
          process.exit();
        }
        // move contents to different location
        fs.copySync(oldInstallPath, installationPath);
        logger("Moved contents to " + installationPath, logLevel.SUCCESS);
        // delete the old path
        rimraf.sync(oldInstallPath);
        logger("Removed old folder " + oldInstallPath, logLevel.SUCCESS);
        tracker.remove(oldInstallPath);
      }
      // update .env and tracker info
      this.postEdit(installationPath, response, version);
      process.exit();
    });
  }

  postEdit(installationPath, response, version) {
    const envPath = installationPath + "/.env";
    // rewrite the env file
    envEditor.writeEnv(envPath, envPath, {
      ...response,
      rootUrl: `http://localhost:${response.appPort}`,
      apiUrl: `http://localhost:${response.appPort}/graphql`,
      uploadUrl: `http://localhost:${response.appPort}/upload`,
    });
    logger("Rewrote the environment file", logLevel.SUCCESS);
    // change tracker info
    tracker.set({
      ...response,
      version,
      installationPath,
    });
    debug("Tracker updated");
  }
}
module.exports = edit;
