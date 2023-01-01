import { Config, DriverList, Driver_Position, LiveTimingAPIGraphQL } from "./npm_f1mv_api";
import { TeamColors } from "./colors";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const d3 = require("d3");

export async function generateDrivers(config: Config, svg: any) {
    const {DriverList} = await LiveTimingAPIGraphQL(config, "DriverList");
    console.log(DriverList);

    const g_cars = svg.append("g").attr("id", "cars").attr("style", "transform: scale(1, -1)");

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
    const {Position, DriverList} = await LiveTimingAPIGraphQL(config, ['Position', 'DriverList']);
    
    // console.log(Position.Position[0]);
    // console.log(DriverList[1]);
    

    for(const key in Position.Position[0].Entries) {
        const driver: Driver_Position = Position.Position[0].Entries[key];
        const driverInList: DriverList = DriverList[parseInt(key)];
        // console.log(key);
        

        d3.select(`#${driverInList.Tla}`).attr('x', driver.X-400)
        d3.select(`#${driverInList.Tla}`).attr('y', driver.Y-400)
    }
}