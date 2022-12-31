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
import { discoverF1MVInstances, noInstanceFounded } from "./npm_f1mv_api";

(async () => {
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

    $("#foundInstance").text(JSON.stringify(instances));
})();
