/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";
import $ from "jquery";
import {
    Config,
    discoverF1MVInstances,
    noInstanceFounded,
} from "./npm_f1mv_api";
import { generateDrivers, updatePosition } from "./graphics";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const d3 = require("d3");
import * as Sentry from "@sentry/electron";

(async () => {

    Sentry.init({
        dsn: "https://54929c18168e4ba8b17993f0faa2313e@o4504430679883776.ingest.sentry.io/4504430682898432",
    });
    console.log(
        '👋 This message is being logged by "renderer.js", included via webpack'
    );

    const instances = await discoverF1MVInstances("localhost").catch((e) => {
        if (e === noInstanceFounded) {
            console.error(
                "No MultiViewer instances founded on the requested host. Check if MultiViewer is running or if MultiViewer is allowed in your FireWall rules."
            );
        }
        $("#foundInstance").text(
            "No MultiViewer instances founded on the requested host. Check if MultiViewer is running or if MultiViewer is allowed in your FireWall rules."
        );
    });
    if (!instances) return;
    console.log(instances);

    const config: Config = {
        host: "localhost",
        port: instances.port,
    };

    // Generate SVGs
    const svg = d3.select("#svg");

    // Generate drivers point
    await generateDrivers(config, svg);

    // Update drivers postition
    await updatePosition(config);
    setInterval(() => updatePosition(config), 800);
})();
