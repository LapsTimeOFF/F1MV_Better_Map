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
import { TeamColors } from "./teamColors";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const d3 = require("d3");

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

    const width = "100vw";
    const height = "100vh";
    const svg = d3
        .select("#svgcontainer")
        .append("svg")
        .attr(
            "viewBox",
            "-4900.6251271128185 -1507.5285782390943 15996.510706256171 6869.783054289148"
        )
        .attr("display", "block")
        .attr("width", width)
        .attr("height", height);

    const g_cars = svg.append("g").attr("id", "cars");

    const car_svg = g_cars
        .append("svg")
        .attr("id", "VER")
        .attr("viewBox", "-10.00 -10.00 20 20")
        .attr("x", 8600)
        // .attr("y", 689 - 1871.57138611)
        .attr("y", 689)
        .attr("width", 590)
        .attr("height", 590);
    

    car_svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 10)
        .attr("fill", `#${TeamColors["Red Bull Racing"]}`);

    car_svg
        .append("text")
        .text("VER")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("dy", `0.35em`)
        .attr("class", `driver-text`)
        .attr("fill", `#fff`);
})();
