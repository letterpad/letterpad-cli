#!/usr/bin/env node
const fs = require("fs-extra");
const shell = require("shelljs");
const path = require("path");
const decompress = require("decompress");
const download = require("download");

const config = require("../config");
const build = require("./build");
const steps = require("../steps");

// helpers
const common = require("../utilities/common");
const envEditor = require("../utilities/envEditor");
const tracker = require("../utilities/tracker");

const store = require("../store");

const { log, debug, logger, logLevel } = require("../logger");

class install {
    releases = store.get("releases");
    force = false;
    sourceExist = false;
    cachePath = config.cachePath;

    inputs = {
        installationPath: store.get("cmdRunPath"),
        version: store.get("version"),
        name: null,
        rootUrl: "",
        apiUrl: "",
        uploadUrl: "",
        appPort: 4040,
        apiPort: 3030
    };

    async init() {
        // start by asking some questions
        const response = await steps.installInputs({
            version: this.inputs.version,
            installationPath: this.inputs.installationPath
        });

        this.inputs = {
            ...response,
            rootUrl: `http://localhost:${response.appPort}`,
            apiUrl: `http://localhost:${response.apiPort}/graphl`,
            uploadUrl: `http://localhost:${response.apiPort}/upload`
        };
        await this.performInstall();
        this.seed();
    }

    performInstall = async () => {
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
        this.downloadObj = await common.getDownloadObj(
            this.releases,
            this.inputs.version
        );

        const installationPath = common.getInstallationPath(
            this.inputs.installationPath
        );
        debug(`Installation path - ${installationPath}`);
        // check if the path is empty. Avoid averwriting.
        if (!this.force && !common.isDirEmpty(installationPath)) {
            logger(`The installation directory is not empty.`, logLevel.ERROR);
            process.exit();
        }
        this.inputs.installationPath = installationPath;

        this.inputs.version = this.downloadObj.version;
        // cache path would be ~/.cache/letterpad/1.1.3
        this.cachePath = path.join(this.cachePath, this.inputs.version);
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
            `rsync -a ./ ${
                this.inputs.installationPath
            }/ --exclude node_modules`
        );
        debug(`Sources moved to ${this.inputs.installationPath}`);

        const { rootUrl, apiUrl, uploadUrl, apiPort, appPort } = this.inputs;

        envEditor.writeEnv(
            this.inputs.installationPath + "/sample.env",
            this.inputs.installationPath + "/.env",
            {
                rootUrl,
                apiUrl,
                uploadUrl,
                apiPort,
                appPort
            }
        );
        debug(`Environment written: ${this.inputs.installationPath}/.env`);

        const sourceNM = this.cachePath + "/node_modules";
        const destNM = this.inputs.installationPath + "/node_modules";
        debug(`Symlink - ${sourceNM} -> ${destNM}`);
        shell.exec(`rm -rf ${destNM}`);
        shell.exec(`ln -s ${sourceNM} ${destNM}`);
    };

    seed = () => {
        logger("Seeding the database", logLevel.ANNOUNCE);
        const builder = new build();
        builder.seed(this.inputs.installationPath);
    };

    setTracker = () => {
        tracker.set(this.inputs);
    };
}

module.exports = install;
