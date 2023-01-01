import {
    Config,
    DriverList,
    Driver_Position,
    Driver_TimingData,
    LiveTimingAPIGraphQL,
    Position,
    TrackStatus,
    TrackStatus_Def,
} from "./npm_f1mv_api";
import { TeamColors } from "./colors";
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

        car_svg
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 10)
            .attr("fill", `#${TeamColors[driver.TeamName]}`);

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
                    .attr("r", 10)
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