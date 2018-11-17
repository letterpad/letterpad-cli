const { prompt } = require("enquirer");
const tracker = require("./utilities/tracker");

module.exports = {
    installInputs: async defaults =>
        await prompt([
            {
                type: "input",
                name: "name",
                hint: "(E.g. My personal blog)",
                message: "Instance Name?",
                validate: input => {
                    if (!input) {
                        return "Instance name cannot be empty";
                    }
                    const instanceObj = tracker.getInstallationByName(input);
                    if (instanceObj) {
                        return (
                            "You have an existing instance with this name at: " +
                            instanceObj.installationPath
                        );
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: "installationPath",
                hint: "(Enter to install in current path)",
                default: defaults.installationPath,
                message: "Installation path?",
                validate: input => {
                    if (input) {
                        const installationObj = tracker.getInstallation(input);
                        if (installationObj) {
                            return `There is already an existing installation with name: \`${
                                installationObj.name
                            }\` in this path`;
                        }
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: "version",
                default: defaults.version,
                hint: "(Enter to install the latest version)",
                message: "Which version ?"
            },
            {
                type: "input",
                name: "appPort",
                default: "4040",
                message: "Port where client will run ?"
            },
            {
                type: "input",
                name: "apiPort",
                default: "3030",
                message: "Port where api will run ?"
            }
        ]),
    build: [
        {
            type: "select",
            name: "buildPath",
            message: "Which instance do you want to build ?",
            choices: [
                // dynamically added the values
            ]
        }
    ],
    upgrade: async defaults =>
        await propmpt([
            {
                type: "select",
                name: "upgradePath",
                message: "Which instance do you want to upgrade ?",
                choices: defaults.instances
            }
        ]),
    editInputs: async defaults =>
        prompt([
            {
                type: "input",
                name: "name",
                default: defaults.name,
                message: "Instance Name?"
            },
            {
                type: "input",
                name: "installationPath",
                default: defaults.installationPath,
                message: "Installation path?"
            },
            {
                type: "input",
                name: "appPort",
                default: defaults.appPort,
                message: "Port where client will run ?"
            },
            {
                type: "input",
                name: "apiPort",
                default: defaults.apiPort,
                message: "Port where api will run ?"
            }
        ])
};
