import {
    Config,
    discoverF1MVInstances,
    DriverList,
    LiveTimingAPIGraphQL,
} from "../src/npm_f1mv_api";
import fs from 'fs';
import https from 'https';


(async () => {
    const config: Config = {
        host: "127.0.0.1",
        port: (await discoverF1MVInstances("127.0.0.1")).port,
    };

    const { DriverList } = await LiveTimingAPIGraphQL(config, "DriverList");

    const URLs: any = {};

    for (const key in DriverList) {
        const driver: DriverList = DriverList[key];

        URLs[driver.Tla] = driver.HeadshotUrl;
    }

    URLs["MAG"] =
        "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png";

    console.log(URLs);

    for (const key in URLs) {
        const file = fs.createWriteStream(`/Users/quentinmassot/Library/Mobile Documents/com~apple~CloudDocs/F1 Book/${key}.png`);
        const request = https.get(
            URLs[key],
            function (response) {
                response.pipe(file);

                // after download completed close filestream
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");
                });
            }
        );
    }
})();
