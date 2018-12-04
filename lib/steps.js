const { prompt } = require("enquirer");
const tracker = require("./utilities/tracker");

module.exports = {
  installationChoices: () => {
    const installations = tracker.getInstallations();
    return installations.map(instance => {
      const { name, installationPath } = instance;
      return {
        message: `${name} - ${installationPath}`,
        value: installationPath,
      };
    });
  },
  installInputs: defaults =>
    prompt([
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
        },
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
        },
      },
      {
        type: "input",
        name: "version",
        default: defaults.version,
        hint: "(Enter to install the latest version)",
        message: "Which version ?",
      },
      {
        type: "input",
        name: "domain",
        default: "http://localhost",
        message: "Domain name ?",
        validate: input => {
          if (input.indexOf("http://") !== 0) {
            return "Domain name should start with http:// or https://";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "appPort",
        default: "4040",
        message: "Port where client will run ?",
      },
      {
        type: "input",
        name: "apiPort",
        default: "3030",
        message: "Port where api will run ?",
      },
      {
        type: "input",
        name: "baseName",
        default: "",
        hint: "Sub folder",
        message: "Base name ?",
      },
      {
        type: "select",
        name: "DB_TYPE",
        initial: 0,
        choices: [
          {
            message: "sqlite",
            value: "sqlite",
          },
          {
            message: "postgres",
            value: "postgres",
          },
          {
            message: "mysql",
            value: "mysql",
          },
        ],
        message: "Enter database type",
      },
    ]),
  buildInputs: defaults =>
    prompt([
      {
        type: "select",
        name: "buildPath",
        message: "Which instance do you want to build ?",
        choices: defaults.choices,
      },
    ]),
  upgrade: defaults =>
    prompt([
      {
        type: "select",
        name: "upgradePath",
        message: "Which instance do you want to upgrade ?",
        choices: defaults.instances,
      },
    ]),
  editInputs: defaults =>
    prompt([
      {
        type: "input",
        name: "name",
        default: defaults.name,
        message: "Instance Name?",
      },
      {
        type: "input",
        name: "installationPath",
        default: defaults.installationPath,
        message: "Installation path?",
      },
      {
        type: "input",
        name: "appPort",
        default: defaults.appPort,
        message: "Port where client will run ?",
      },
      {
        type: "input",
        name: "apiPort",
        default: defaults.apiPort,
        message: "Port where api will run ?",
      },
    ]),
  dbInputs: async () =>
    await prompt([
      {
        type: "input",
        name: "DB_HOST",
        default: "localhost",
        message: "Database hostname?",
      },
      {
        type: "input",
        name: "DB_USER",
        default: "root",
        message: "Enter database user ?",
      },
      {
        type: "input",
        name: "DB_PASSWORD",
        default: "",
        message: "Enter database password?",
      },
      {
        type: "input",
        name: "DB_PORT",
        default: 3306,
        message: "Enter database port?",
      },
      {
        type: "input",
        name: "DB_NAME",
        default: "",
        message: "Enter database name?",
      },
    ]),
};
