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
const installOptions = require("../options/install-options");
const { log, debug, logger, logLevel } = require("../logger");
const common = require("../utilities/common");
const envEditor = require("../utilities/env");

class install {
    installationPath = null;
    version = "1.1.0-beta";
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
        // start by asking some questions
        const response = await prompt(installOptions.install);
        const { apiPort, appPort, installationPath, version, name } = response;

        this.installationPath = installationPath || ".";
        this.releases = await listReleases();
        this.name = name;
        this.version =
            version === "latest"
                ? common.getVersionFromRelease(this.releases[0].zipball_url)
                : version;

        this.env = {
            rootUrl: `http://localhost:${appPort}`,
            apiUrl: `http://localhost:${apiPort}/graphl`,
            uploadUrl: `http://localhost:${apiPort}/upload`,
            apiPort,
            appPort
        };

        await this.preInstall();
        await this.install();
        await this.postInstall();

        await this.setInstallationTracker();
    }

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
        if (!common.isDirEmpty(installationPath)) {
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
            debug("Installing node dependencies...");
            shell.exec("yarn install --production=false", { silent: true });
            debug("Dependencies installed.");
            build.start(this.cachePath);
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
        shell.exec(`ln -s ${sourceNM} ${destNM}`);
    };

    setInstallationTracker = () => {
        let content = {};
        try {
            // fs.accessSync(config.instanceInfoPath, fs.constants.F_OK);
            content = JSON.parse(
                fs.readFileSync(config.instanceInfoPath, "utf8")
            );
        } catch (err) {
            // fs.writeFileSync(config.instanceInfoPath, "{}", "utf8");
        }
        if (!content[this.version]) {
            content[this.version] = {};
        }
        content[this.version][this.installationPath] = {
            installationPath: this.installationPath,
            name: this.name
        };

        content = JSON.stringify(content);

        fs.writeFileSync(config.instanceInfoPath, content, "utf8");
        debug(`Installation tracker set in: ${config.instanceInfoPath} `);
    };
}

module.exports = install;
