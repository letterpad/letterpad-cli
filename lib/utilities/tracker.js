const fs = require("fs");
const config = require("../config");
const { debug, logger, logLevel } = require("../logger");

const tracker = {
    set: data => {
        logger(`Setting instance tracker`, logLevel.ANNOUNCE);
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
            appPort
        };

        content = JSON.stringify(content, null, 4);

        fs.writeFileSync(config.instanceInfoPath, content, "utf8");
        debug(`Installation tracker set in: ${config.instanceInfoPath} `);
    },

    read: () => {
        let content = {};
        try {
            content = JSON.parse(
                fs.readFileSync(config.instanceInfoPath, "utf8")
            );
        } catch (err) {
            debug("Tracker file not found. Creating.");
        }
        return content;
    },

    getInstallations: () => {
        const data = tracker.read();
        const container = [];
        Object.keys(data).forEach(path => container.push(data[path]));
        return container;
    }
};

module.exports = tracker;
