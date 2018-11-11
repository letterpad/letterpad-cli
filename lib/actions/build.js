const shell = require("shelljs");
const { logger, logLevel } = require("../logger");

class build {
    installationPath = null;

    start = installationPath => {
        this.installationPath = installationPath;
        logger("Starting build..", logLevel.ANNOUNCE);
        shell.cd(this.installationPath);
        shell.exec("yarn build");
    };
}

module.exports = new build();
