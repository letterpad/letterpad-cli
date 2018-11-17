const axios = require("axios");

const fetchReleases = async () => {
    const releaseData = await axios
        .get("http://api.github.com/repos/letterpad/letterpad/releases")
        .catch(e => {
            throw new Error("Request not successful");
        });

    return releaseData.data
        .filter(release => !release.draft)
        .map(release => {
            return {
                version: release.tag_name,
                zipball_url: release.zipball_url.replace("https", "http")
            };
        });
};

module.exports = fetchReleases;
