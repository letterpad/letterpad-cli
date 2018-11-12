const shell = require("shelljs");
const { prompt } = require("enquirer");
const { logger, logLevel } = require("../logger");
const steps = require("../steps");
const common = require("../utilities/common");
const tracker = require("../utilities/tracker");
const listReleases = require("../utilities/list-releases");
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
        const upgradeSteps = [...steps.build];
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
        const releases = await listReleases();
        const latestVersion = common.getVersionFromRelease(
            releases[0].zipball_url
        );
        if (version === latestVersion) {
            logger("You are running the latest version", logLevel.SUCCESS);
            process.exit();
        }
        logger("Starting upgrade..", logLevel.ANNOUNCE);

        const installer = new install();
        installer.releases = releases;
        installer.installationPath = upgradePath;
        installer.version = latestVersion;
        installer.force = true;
        await installer.preInstall();
        await installer.install();
        await installer.postInstall();
    };
}

module.exports = upgrade;
