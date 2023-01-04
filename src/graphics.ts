/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Config,
    DriverList,
    Driver_Position,
    Driver_TimingData,
    LiveTimingAPIGraphQL,
    RaceControlMessage,
    TrackStatus,
    TrackStatus_Def,
} from "./npm_f1mv_api";
import { TeamColors } from "./colors";
// @ts-ignore
import blip from "./blips/blip.png";
import { driverHasCrashed } from "./detection/crash_detection";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const d3 = require("d3");

let sc_spawned = false;

export async function generateDrivers(config: Config, svg: any) {
    const { DriverList } = await LiveTimingAPIGraphQL(config, "DriverList");
    console.log(DriverList);

    const g_cars = svg
        .append("g")
        .attr("id", "cars")
        .attr("style", "transform: scale(1, -1)");

    const defs = svg.append("defs");

    for (const key in DriverList) {
        const driver: DriverList = DriverList[key];

        const car_svg = g_cars
            .append("svg")
            .attr("id", driver.Tla)
            .attr("viewBox", "-10.00 -10.00 20 20")
            .attr("x", 8600)
            // .attr("y", 689 - 1871.57138611)
            .attr("y", 689)
            .attr("width", 590)
            .attr("height", 590);

        const patern = defs
        .append("pattern")
        .attr("id", `image${driver.Tla}`)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", "1")
        .attr("width", "1")
        .attr("patternUnits", "objectBoundingBox");

        patern
            .append("image")
            .attr("x", -15)
            .attr("y", 0)
            .attr("xlink:href", blip);

        car_svg
            .append("circle")
            .attr("id", `circle${driver.Tla}`)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 7.5)
            .attr("fill", `#${TeamColors[driver.TeamName]}`);

        // .attr("fill", `url(#image${driver.Tla})`);
        // .attr("style", "background-image: url(./blips/blip.png);");

        // car_svg
        //     .append("img")
        //     .attr("id", `circle${driver.Tla}`)
        //     .attr("src", "/blips/blip.png");

        car_svg
            .append("text")
            .text(driver.Tla)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("dy", `0.35em`)
            .attr("class", `driver-text`)
            .attr("fill", `#fff`);
    }
}

export async function updatePosition(config: Config) {
    const {
        Position,
        DriverList,
        TimingData,
        TrackStatus,
    }: {
        Position: any;
        DriverList: any;
        TimingData: any;
        TrackStatus: TrackStatus;
    } = await LiveTimingAPIGraphQL(config, [
        "Position",
        "DriverList",
        "TimingData",
        "TrackStatus",
    ]);

    // console.log(Position.Position[0]);
    // console.log(DriverList[1]);

    for (const key in Position.Position[0].Entries) {
        const driver: Driver_Position = Position.Position[0].Entries[key];
        const driverInList: DriverList = DriverList[parseInt(key)];
        const driverInData: Driver_TimingData = TimingData.Lines[parseInt(key)];
        // console.log(key);

        if (TrackStatus.Status !== TrackStatus_Def.SCDeployed) {
            d3.select(`#SC`).attr("opacity", 0);
        }

        if (key.match(/24(1|2|3)/g)) {
            console.log("SC Detected");
            if (TrackStatus.Status !== TrackStatus_Def.SCDeployed) {
                d3.select(`#SC`).attr("opacity", 0);
            }
            if (key === "242" || key === "243") {
                return;
            }
            if (!sc_spawned) {
                const car_svg = d3
                    .select("#cars")
                    .append("svg")
                    .attr("id", "SC")
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
                    .attr("r", 7.5)
                    .attr("fill", `#ffeb3b`);

                car_svg
                    .append("text")
                    .text("SC")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("dy", `0.35em`)
                    .attr("class", `driver-text`)
                    .attr("fill", `#fff`);

                sc_spawned = true;
            }

            d3.select(`#SC`).attr("opacity", 1);
            d3.select(`#SC`).attr("x", driver.X - 400);
            d3.select(`#SC`).attr("y", driver.Y - 400);

            return;
        }

        try {
            d3.select(`#${driverInList.Tla}`).attr(
                "opacity",
                driverInData.Retired === true || driverInData.Stopped === true
                    ? 0.5
                    : 1
            );
            d3.select(`#${driverInList.Tla}`).attr(
                "height",
                driverInData.Retired === true ||
                    driverInData.Stopped === true ||
                    driverInData.InPit === true
                    ? 197
                    : 592
            );
            d3.select(`#${driverInList.Tla}`).attr(
                "width",
                driverInData.Retired === true ||
                    driverInData.Stopped === true ||
                    driverInData.InPit === true
                    ? 197
                    : 592
            );
            d3.select(`#${driverInList.Tla}`).attr("x", driver.X - 400);
            d3.select(`#${driverInList.Tla}`).attr("y", driver.Y - 400);
        } catch (err) {
            console.error(
                `Failed to edit driver point for Driver number ${key}`
            );
        }
    }
}

export async function ringManagment(config: Config) {
    const { TimingData, DriverList, RaceControlMessages, SessionInfo } =
        await LiveTimingAPIGraphQL(config, [
            "TimingData",
            "DriverList",
            "RaceControlMessages",
            "SessionInfo",
        ]);

    for (const key in TimingData.Lines) {
        const driverInData: Driver_TimingData = TimingData.Lines[key];
        const driverInList: DriverList = DriverList[key];

        if (SessionInfo.Type === "Race") {
            const lapped = driverInData.GapToLeader.endsWith("L");
            if (lapped) {
                d3.select(`#circle${driverInList.Tla}`).attr("class", "lapped");
                for (let _i = 0; _i < 4; _i++) {
                    const message: RaceControlMessage =
                        RaceControlMessages.Messages[
                            RaceControlMessages.Messages.length - (1 + _i)
                        ];

                    if (
                        message.Message.includes(
                            "LAPPED CARS MAY NOW OVERTAKE THE SAFETY CAR"
                        )
                    ) {
                        const messageArray = message.Message.split(":");
                        const allowedDriversToOvertake =
                            messageArray[1].split(",");

                        if (
                            allowedDriversToOvertake.includes(
                                ` ${driverInList.RacingNumber}`
                            )
                        ) {
                            d3.select(`#circle${driverInList.Tla}`).attr(
                                "class",
                                "lapped blink"
                            );
                        }
                    }
                    break;
                }
            } else {
                if (driverInData.Line === 1) {
                    d3.select(`#circle${driverInList.Tla}`).attr(
                        "class",
                        "first"
                    );
                } else {
                    d3.select(`#circle${driverInList.Tla}`).attr("class", "");
                }
            }
            if (await driverHasCrashed(key, config)) {
                d3.select(`#circle${driverInList.Tla}`).attr(
                    "class",
                    d3.select(`#circle${driverInList.Tla}`).attr("class") +
                        "crashed blink"
                );
            } else {
                d3.select(`#circle${driverInList.Tla}`).attr(
                    "class",
                    d3.select(`#circle${driverInList.Tla}`).attr("class") + ""
                );
            }
        } else {
            if (await driverHasCrashed(key, config)) {
                d3.select(`#circle${driverInList.Tla}`).attr(
                    "class",
                    "crashed blink"
                );
            } else {
                d3.select(`#circle${driverInList.Tla}`).attr("class", "");
            }
        }
    }
}
