#!/usr/bin/env node
const fs = require("fs-extra");
const shell = require("shelljs");
const path = require("path");
const decompress = require("decompress");
const download = require("download");
const copydir = require("copy-dir");

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
  constructor() {
    this.releases = store.get("releases");
    this.force = false;
    this.sourceExist = false;
    this.cachePath = config.cachePath;
    this.downloadObj = null;
    this.foldersToLink = ["node_modules"];

    this.inputs = {
      installationPath: store.get("cmdRunPath"),
      version: store.get("version"),
      name: null,
      rootUrl: "",
      apiUrl: "",
      uploadUrl: "",
      appPort: 4040,
      apiPort: 3030,
      domain: "",
      baseName: "",
    };
  }

  /**
   * The main function which takes input from the user and starts the installation process.
   * @memberof install
   */
  init() {
    // start by asking some questions
    steps
      .installInputs({
        version: this.inputs.version,
        installationPath: this.inputs.installationPath,
      })
      .then(res => {
        let domain = path.join(res.domain, res.baseName);
        // if the domain is localhost, then add port num
        if (res.domain.indexOf("://localhost") > 0) {
          domain = `${res.domain}:${res.appPort}`;
        }
        this.inputs = {
          ...res,
          rootUrl: `${domain}`,
          apiUrl: `${domain}/graphql`,
          uploadUrl: `${domain}/upload`,
          baseName: `/${res.baseName}`,
        };
        this.performInstall().then(() => {
          this.seed();
          this.createPm2File();
        });
      })
      .catch(e => {
        logger("[Error]: " - e.message, logLevel.ERROR);
        tracker.remove(this.inputs.installationPath);
        debug("Removing tracker info");
        process.exit();
      });
  }

  performInstall() {
    this.prepare();
    this.preInstall();
    return this.install().then(() => {
      this.postInstall();
      this.finish();
      tracker.set(this.inputs);
      return Promise.resolve();
    });
  }

  prepare() {
    logger("Preparing to install", logLevel.ANNOUNCE);
    const installationPath = common.getInstallationPath(
      this.inputs.installationPath
    );

    debug(`Installation path - ${installationPath}`);
    // check if the path is empty. Avoid averwriting.
    if (!this.force && !common.isDirEmpty(installationPath)) {
      logger(`The installation directory is not empty.`, logLevel.ERROR);
      process.exit();
    }
    this.downloadObj = common.getDownloadObj(
      this.releases,
      this.inputs.version
    );

    this.inputs.version = this.downloadObj.version;
    this.inputs.installationPath = installationPath;

    // cache path would be ~/.cache/letterpad/1.1.3
    this.cachePath = path.join(this.cachePath, this.inputs.version);
    debug(`Cache path - ${this.cachePath}`);

    // create the cache folder if it does not exist
    fs.ensureDirSync(this.cachePath);
  }
  /**
   * Check all the paths and dependencies to ensure the install will work
   *
   * @param {string} dest The path where the user wants to install
   */
  preInstall() {
    if (!common.isDirEmpty(this.cachePath)) {
      this.sourceExist = true;
    }
    if (!this.downloadObj) {
      this.downloadObj = common.getDownloadObj(
        this.releases,
        this.inputs.version
      );
    }
  }

  install() {
    logger("Installing letterpad...", logLevel.ANNOUNCE);
    if (this.sourceExist) {
      debug("Source already exists in cache");
      return Promise.resolve();
    }
    return download(this.downloadObj.zipball).then(data => {
      debug(`Downloading letterpad from ${this.downloadObj.zipball}`);
      // unzip the contents and remove the leading directory
      return decompress(data, this.cachePath, { strip: 1 }).then(() => {
        debug("Decompressed the zip file");
      });
    });
  }

  postInstall() {
    if (!this.sourceExist) {
      logger("Installing node dependencies...", logLevel.ANNOUNCE);
      shell.cd(this.cachePath);
      shell.exec("yarn install --production=false ", { silent: true });
      debug("Dependencies installed.");
      const builder = new build();
      builder.start(this.cachePath);
    }
    logger("Copying files...", logLevel.ANNOUNCE);

    copydir.sync(
      `${this.cachePath}/`,
      `${this.inputs.installationPath}/`,
      (stat, filename) => {
        if (stat === "directory" && filename === "node_modules") {
          return false;
        }
        return true;
      }
    );

    debug(`Sources moved to ${this.inputs.installationPath}`);
    return Promise.resolve();
  }

  finish() {
    const {
      rootUrl,
      apiUrl,
      uploadUrl,
      apiPort,
      appPort,
      baseName,
    } = this.inputs;
    envEditor.writeEnv(
      this.inputs.installationPath + "/sample.env",
      this.inputs.installationPath + "/.env",
      {
        rootUrl,
        apiUrl,
        uploadUrl,
        apiPort,
        appPort,
        baseName,
      }
    );
    logger(
      `Environment written: ${this.inputs.installationPath}/.env`,
      logLevel.ANNOUNCE
    );
    this.foldersToLink.map(folder => {
      const sourceNM = this.cachePath + "/" + folder;
      const destNM = this.inputs.installationPath + "/" + folder;
      debug(`Symlink - ${sourceNM} -> ${destNM}`);
      shell.exec(`rm -rf ${destNM}`);
      shell.exec(`ln -s ${sourceNM} ${destNM}`);
    });

    logger(`Installation complete`, logLevel.SUCCESS);
  }

  seed() {
    logger("Seeding the database", logLevel.ANNOUNCE);
    const builder = new build();
    builder.seed(this.inputs.installationPath);
  }

  createPm2File() {
    // create a file to run pm2.
    const scriptName = path.join(this.inputs.installationPath, "pm.sh");
    const technicalName = this.inputs.name.replace(" ", "-");
    const scriptContent = `#!/bin/bash
      pm2 delete -s ${technicalName}Api || :
      pm2 delete -s ${technicalName} || :
      pm2 start ./apiBuild/server.js --name=${technicalName}Api
      pm2 start ./server.js --name=${technicalName}`;
    fs.writeFileSync(scriptName, scriptContent);
    fs.chmodSync(scriptName, "755");
  }
}

module.exports = install;
