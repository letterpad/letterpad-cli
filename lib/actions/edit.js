const { prompt } = require("enquirer");
const steps = require("../steps");
const tracker = require("../utilities/tracker");
const install = require("./install");

class edit {
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

        const response = await prompt([
            {
                type: "select",
                name: "editPath",
                message: "Which instance do you want to edit ?",
                choices
            }
        ]);
        this.start(response.editPath);
    };

    start = async editPath => {
        let instances = tracker.read();
        const selectedInstance = instances[editPath];

        const editSteps = steps.edit.map(item => {
            switch (item.name) {
                case "name":
                    item.default = selectedInstance.name;
                    break;
                case "installationPath":
                    item.default = selectedInstance.installationPath;
                    break;
                case "version":
                    item.default = selectedInstance.version;
                    break;
                case "appPort":
                    item.default = selectedInstance.appPort;
                    break;
                case "apiPort":
                    item.default = selectedInstance.apiPort;
                    break;
            }
            return item;
        });
        const response = await prompt(editSteps);

        const installer = new install();
        installer.name = response.name;
        installer.installationPath = response.installationPath;
        installer.env.apiPort = response.apiPort;
        installer.env.appPort = response.appPort;
        installer.version = response.version;
        // if the installation path has changed
    };
}
module.exports = edit;
