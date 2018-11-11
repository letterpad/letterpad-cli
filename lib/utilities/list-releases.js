const axios = require("axios");

const listReleases = async () => {
    const releaseData = await axios.get(
        "http://api.github.com/repos/letterpad/letterpad/releases"
    );

    return releaseData.data
        .filter(release => !release.draft)
        .map(release => {
            return {
                zipball_url: release.zipball_url.replace("https", "http")
            };
        });
};

module.exports = listReleases;
