const fs = require("fs");

module.exports = {
    writeEnv: (sourcePath, destPath, data) => {
        const contents = fs.readFileSync(sourcePath, "utf8");
        const envArr = contents.split("\n");
        const changedEnvArr = envArr.map(item => {
            let changedItem = item;
            Object.keys(data).map(key => {
                const needle = `${key}=`;
                if (item.indexOf(needle) === 0) {
                    changedItem = `${key}=${data[key]}`;
                }
            });
            return changedItem;
        });
        fs.writeFileSync(destPath || path, changedEnvArr.join("\n"), "utf8");
    },
    readEnv: (path, key) => {
        const contents = fs.readFileSync(path, "utf8");
        const envArr = contents.split("\n");
        const envMap = {};

        // create a map (key/value) of env file
        envArr
            .filter(item => {
                // remove comments
                return item.indexOf("#") !== 0;
            })
            .forEach(item => {
                if (item.length === 0) return false;
                const keyValue = item.split("=");
                envMap[keyValue[0]] = keyValue[1];
            });
        if (key) {
            return envMap[key];
        }
        return envMap;
        // const needle = `${key}=`;
        // const item = envArr.filter(item => item.indexOf(needle) === 0);
        // if (item.length === 1) return item.split("=")[1];
        // return null;
    }
};
