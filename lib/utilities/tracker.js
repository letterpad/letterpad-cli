const fs = require("fs");
const config = require("../config");
const { debug, logger, logLevel } = require("../logger");

const tracker = {
    set: data => {
        logger(`Setting instance tracker`, logLevel.ANNOUNCE);
        const { version, installationPath, name } = data;
        let content = tracker.read();
        if (!content[version]) {
            content[version] = {};
        }
        content[version][installationPath] = {
            installationPath: installationPath,
            name: name
        };

        content = JSON.stringify(content);

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
        Object.keys(data).forEach(version => {
            const instances = data[version];
            Object.keys(instances).forEach(path => {
                const instance = instances[path];
                instance.version = version;
                container.push(instance);
            });
        });
        return container;
    }
};

module.exports = tracker;
