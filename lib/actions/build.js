const shell = require("shelljs");
const { logger, logLevel } = require("../logger");
const steps = require("../steps");
const tracker = require("../utilities/tracker");

class build {
  constructor() {
    this.buildPath = null;
  }
  init() {
    let instances = tracker.getInstallations();
    const choices = instances.map(instance => {
      return {
        message: `${instance.name} - ${instance.installationPath}`,
        value: instance.installationPath,
      };
    });
    steps.buildInputs({ choices }).then(res => this.start(res.buildPath));
  }

  start(buildPath) {
    this.buildPath = buildPath;
    logger("Build in progress..", logLevel.ANNOUNCE);
    shell.cd(this.buildPath);
    shell.exec("yarn build");
  }

  seed(path) {
    shell.cd(path);
    shell.exec("yarn seed");
    shell.exec("yarn sequelize db:migrate");
  }
}

module.exports = build;
