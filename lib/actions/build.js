const shell = require("shelljs");
const { logger, logLevel } = require("../logger");
const steps = require("../steps");
const tracker = require("../utilities/tracker");

class build {
    buildPath = null;
    init = async () => {
        let instances = tracker.getInstallations();
        const choices = instances.map(instance => {
            return {
                message: `${instance.name} - ${instance.installationPath}`,
                value: instance.installationPath
            };
        });
        const response = await steps.buildInputs({ choices });
        this.start(response.buildPath);
    };

    start = buildPath => {
        this.buildPath = buildPath;
        logger("Build in progress..", logLevel.ANNOUNCE);
        shell.cd(this.buildPath);
        shell.exec("yarn build");
    };

    seed = path => {
        shell.cd(path);
        shell.exec("yarn seed");
        shell.exec("yarn sequelize db:migrate");
    };
}

module.exports = build;
