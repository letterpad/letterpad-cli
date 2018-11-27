const fs = require("fs-extra");
const config = require("../config");
const { debug, logger, logLevel } = require("../logger");

const tracker = {
  set: data => {
    const { version, installationPath, name, apiPort, appPort } = data;
    let content = tracker.read();
    if (!content[installationPath]) {
      content[installationPath] = {};
    }
    content[installationPath] = {
      installationPath: installationPath,
      name: name || content[installationPath].name,
      version,
      apiPort,
      appPort,
    };

    content = JSON.stringify(content, null, 4);
    fs.writeFileSync(config.instanceInfoPath, content, "utf8");
    logger(`Tracker written for this installation.`, logLevel.ANNOUNCE);
    debug(`Installation tracker set in: ${config.instanceInfoPath} `);
  },

  remove: installationPath => {
    let content = tracker.read();
    if (content[installationPath]) {
      delete content[installationPath];
      content = JSON.stringify(content, null, 4);
      fs.writeFileSync(config.instanceInfoPath, content, "utf8");
    }
  },
  read: () => {
    let content = {};
    try {
      content = JSON.parse(fs.readFileSync(config.instanceInfoPath, "utf8"));
    } catch (err) {
      debug("Tracker file not found. Creating.");
      fs.ensureFileSync(config.instanceInfoPath);
      fs.writeFileSync(config.instanceInfoPath, "{}");
    }
    return content;
  },

  getInstallations: () => {
    const data = tracker.read();
    const container = [];
    Object.keys(data).forEach(path => container.push(data[path]));
    return container;
  },

  getCachedReleases: () => {
    const data = tracker.read();
    const releases = [];
    Object.keys(data).forEach(path => {
      const version = data[path].version;
      if (releases.indexOf(version) === -1) {
        releases.push({
          zipball_url:
            "https://api.github.com/repos/letterpad/letterpad/zipball/" +
            version,
          version: version,
        });
      }
    });
    return releases;
  },

  getInstallation: path => {
    const data = tracker.read();
    return data[path];
  },

  getInstallationByName: input => {
    const data = tracker.read();
    // container is the array of instllation paths.
    const container = Object.keys(data).filter(
      path => data[path].name.toLowerCase() === input.toLowerCase()
    );

    return container.length > 0 ? data[container[0]] : null;
  },
  getVersionInstallationMap: () => {
    let instances = tracker.getInstallations();
    const versionMapper = {};
    instances.forEach(instance => {
      const { version, installationPath } = instance;
      versionMapper[installationPath] = version;
    });
    return versionMapper;
  },
};

module.exports = tracker;
