module.exports = {
    install: [
        {
            type: "input",
            name: "name",
            hint: "(E.g. My personal blog)",
            message: "Instance Name?"
        },
        {
            type: "input",
            name: "installationPath",
            hint: "(Enter to install in current path)",
            message: "Installation path?"
        },
        {
            type: "input",
            name: "version",
            default: "latest",
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
    ],
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
    upgrade: [
        {
            type: "select",
            name: "upgradePath",
            message: "Which instance do you want to upgrade ?",
            choices: [
                // dynamically added the values
            ]
        }
    ]
};
