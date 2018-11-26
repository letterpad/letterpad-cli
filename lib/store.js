// privates. cannot be changed from outside of this class
const data = {
  version: null,
  releases: [],
  cmdRunPath: null,
};

const store = (() => {
  // public
  return {
    get: name => {
      return data[name];
    },
    setVersion: version => {
      data.version = version;
    },
    setReleases: releases => {
      data.releases = releases;
    },
    setCmdRunPath: path => {
      data.cmdRunPath = path;
    },
  };
})();

module.exports = store;
