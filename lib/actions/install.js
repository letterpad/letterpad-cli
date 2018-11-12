#!/usr/bin/env node
const fs = require("fs-extra");
const shell = require("shelljs");
const path = require("path");
const { prompt } = require("enquirer");
const decompress = require("decompress");
const download = require("download");

const config = require("../config");
const build = require("./build");
const listReleases = require("../utilities/list-releases");
const steps = require("../steps");
const { log, debug, logger, logLevel } = require("../logger");
const common = require("../utilities/common");
const envEditor = require("../utilities/env");
const tracker = require("../utilities/tracker");

class install {
    installationPath = null;
    version = "";
    force = false;

    name = null;
    cachePath = config.cachePath;
    sourceExist = false;
    releases = [];
    env = {
        rootUrl: "",
        appPort: 4040,
        apiPort: 3030
    };

    async init() {
        await this.setDefaults();
        // start by asking some questions
        const response = await prompt(steps.install);
        const { apiPort, appPort, installationPath, version, name } = response;

        this.installationPath = installationPath;
        this.name = name;
        this.version = version === "latest" ? this.version : version;

        this.env = {
            rootUrl: `http://localhost:${appPort}`,
            apiUrl: `http://localhost:${apiPort}/graphl`,
            uploadUrl: `http://localhost:${apiPort}/upload`,
            apiPort,
            appPort
        };
        this.performInstall();
    }

    performInstall = async () => {
        if (this.releases.length === 0) {
            await this.setDefaults();
        }
        await this.preInstall();
        await this.install();
        await this.postInstall();
        this.setTracker();
    };
    /**
     * Check all the paths and dependencies to ensure the install will work
     *
     * @param {string} dest The path where the user wants to install
     */
    preInstall = async () => {
        const installationPath = common.getInstallationPath(
            this.installationPath
        );
        debug(`Installation path - ${installationPath}`);
        // check if the path is empty. Avoid averwriting.
        if (!this.force && !common.isDirEmpty(installationPath)) {
            logger(`The installation directory is not empty.`, logLevel.ERROR);
            process.exit();
        }
        this.installationPath = installationPath;

        this.downloadObj = await common.getDownloadObj(
            this.releases,
            this.version
        );
        this.version = this.downloadObj.version;
        // cache path would be ~/.cache/letterpad/1.1.3
        this.cachePath = path.join(this.cachePath, this.version);
        debug(`Cache path - ${this.cachePath}`);

        // create the cache folder if it does not exist
        fs.ensureDirSync(this.cachePath);
        if (!common.isDirEmpty(this.cachePath)) {
            this.sourceExist = true;
        }
    };

    install = async () => {
        if (this.sourceExist) {
            return debug("Source already exists in cache");
        }
        debug("Installing letterpad...");
        const data = await download(this.downloadObj.zipball);
        debug(`Downloading letterpad from ${this.downloadObj.zipball}`);
        // unzip the contents and remove the leading directory
        await decompress(data, this.cachePath, { strip: 1 });
        debug("Decompressed the zip file");
    };

    postInstall = async () => {
        shell.cd(this.cachePath);
        if (!this.sourceExist) {
            logger("Installing node dependencies...", logLevel.ANNOUNCE);
            shell.exec("yarn install --production=false", { silent: true });
            debug("Dependencies installed.");
            const builder = new build();
            builder.start(this.cachePath);
        }
        shell.exec(
            `rsync -a ./ ${this.installationPath}/ --exclude node_modules`
        );
        debug(`Sources moved to ${this.installationPath}`);

        envEditor.setEnv(
            this.installationPath + "/sample.env",
            this.env,
            this.installationPath + "/.env"
        );
        debug(`Environment written: ${this.installationPath}/.env`);

        const sourceNM = this.cachePath + "/node_modules";
        const destNM = this.installationPath + "/node_modules";
        debug(`Symlink - ${sourceNM} -> ${destNM}`);
        shell.exec(`rm -rf ${destNM}`);
        shell.exec(`ln -s ${sourceNM} ${destNM}`);
    };

    setTracker = () => {
        tracker.set({
            installationPath: this.installationPath,
            version: this.version,
            name: this.name,
            apiPort: this.env.apiPort,
            appPort: this.env.appPort
        });
    };

    setDefaults = async () => {
        this.releases = await listReleases();
        this.version = common.getVersionFromRelease(
            this.releases[0].zipball_url
        );
    };
}

module.exports = install;
