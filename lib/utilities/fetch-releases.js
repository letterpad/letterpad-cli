const axios = require("axios");

const fetchReleases = () => {
  return axios
    .get("http://api.github.com/repos/letterpad/letterpad/releases", {
      timeout: 2000,
    })
    .then(releaseData => {
      // simplify the recieved data
      return releaseData.data
        .filter(release => !release.draft)
        .map(release => {
          return {
            version: release.tag_name,
            zipball_url: release.zipball_url.replace("https", "http"),
          };
        });
    })
    .catch(e => {
      throw new Error("Request not successful");
    });
};

module.exports = fetchReleases;
