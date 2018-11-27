// modules
const install = require("./actions/install");
const build = require("./actions/build");
const upgrade = require("./actions/upgrade");
const list = require("./actions/list");
const edit = require("./actions/edit");
const remove = require("./actions/remove");
const purge = require("./actions/purge");
// const unlink = require("./actions/unlink");

const commands = () => {
  const installer = new install();
  const builder = new build();
  const upgrader = new upgrade();
  const lister = new list();
  const editor = new edit();
  const remover = new remove();
  const purger = new purge();
  return [
    // install letterpad
    {
      cmd: "install",
      alias: "i",
      description: "Install letterpad",
      action: () => new install().init(),
    },
    // build letterpad
    {
      cmd: "build",
      alias: "b",
      description: "Build letterpad",
      offline: true,
      action: () => builder.init(),
    },
    // upgrade letterpad
    {
      cmd: "upgrade",
      alias: "u",
      description: "Upgrade a letterpad instance to latest version",
      action: () => upgrader.init(),
    },
    // list installations
    {
      cmd: "list",
      alias: "l",
      description: "List all instances",
      offline: true,
      action: () => lister.init(),
    },
    // edit
    {
      cmd: "edit",
      alias: "e",
      description: "Edit an instance",
      offline: true,
      action: () => editor.init(),
    },
    // remove
    {
      cmd: "remove",
      alias: "r",
      description: "Remove an instance",
      offline: true,
      action: () => remover.init(),
    },
    // purge
    {
      cmd: "purge",
      alias: "r",
      description: "Remove unlinked caches",
      offline: true,
      action: () => purger.init(),
    },
  ];
};
module.exports = commands;
