/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LiveTimingAPIGraphQL,
    Config,
    discoverF1MVInstances,
} from "../npm_f1mv_api";

let timingData: any;
let bestTimes: any;
let sessionInfo: any;
let sessionType: any;
let sessionStatus: any;

// All the api requests
export async function apiRequests(config: Config) {
    const liveTimingState = await LiveTimingAPIGraphQL(config, [
        "TimingAppData",
        "TimingData",
        "TimingStats",
        "SessionInfo",
        "TopThree",
        "SessionStatus",
    ]);

    timingData = liveTimingState.TimingData.Lines;
    bestTimes = liveTimingState.TimingStats.Lines;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    sessionStatus = liveTimingState.SessionStatus.Status;
}

// A lap or sector time can be send through and will return as a number in seconds
export function parseLapOrSectorTime(time: string) {
    // Split the input into 3 variables by checking if there is a : or a . in the time. Then replace any starting 0's by nothing and convert them to numbers using parseInt.
    const [minutes, seconds, milliseconds] = time
        .split(/[:.]/)
        .map((number: string) =>
            parseInt(number.replace(/^0+/, "") || "0", 10)
        );

    if (milliseconds === undefined) return minutes + seconds / 1000;

    return minutes * 60 + seconds + milliseconds / 1000;
}

// Check if the driver is on a push lap or not
export async function isDriverOnPushLap(driverNumber: string, config: Config) {
    await apiRequests(config);
    if (sessionStatus === "Aborted") return false;
    const driverTimingData = timingData[driverNumber];
    const driverBestTimes = bestTimes[driverNumber];

    if (driverTimingData.InPit) return false;

    // If the first mini sector time is status 2064, meaning he is on a out lap, return false
    if (driverTimingData.Sectors[0].Segments[0].Status === 2064) return false;

    // Get the threshold to which the sector time should be compared to the best personal sector time.
    const pushDeltaThreshold =
        sessionType === "Race" ? 0 : sessionType === "Qualifying" ? 1 : 3;

    let isPushing = false;
    for (
        let sectorIndex = 0;
        sectorIndex < driverTimingData.Sectors.length;
        sectorIndex++
    ) {
        const sectors = driverTimingData.Sectors;
        const sector = sectors[sectorIndex];
        const lastSectorIndex = sectors.length - 1;
        const bestSector = driverBestTimes.BestSectors[sectorIndex];

        const sectorTime = parseLapOrSectorTime(sector.Value);
        const bestSectorTime = parseLapOrSectorTime(bestSector.Value);

        // Check if the first sector is completed by checking if the last segment of the first sector has a value meaning he has crossed the last point of that sector and the final sector time does not have a value. The last check is done because sometimes the segment already has a status but the times are not updated yet.
        const completedFirstSector =
            driverTimingData.Sectors[0].Segments.slice(-1)[0].Status !== 0 &&
            sectors[lastSectorIndex].Value === "";

        // If the first sector time is above the threshold it should imidiately break because it will not be a push lap
        if (
            sectorTime - bestSectorTime > pushDeltaThreshold &&
            completedFirstSector
        ) {
            isPushing = false;
            break;
        }

        // If the first sector time is lower then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
        if (
            sectorTime - bestSectorTime < pushDeltaThreshold &&
            completedFirstSector
        ) {
            isPushing = true;
            continue;
        }

        // If the driver has a fastest segment overall it would temporarily set pushing to true because the driver could have still backed out in a later stage
        if (
            sector.Segments.some(
                (segment: { Status: number }) => segment.Status === 2051
            )
        ) {
            isPushing = true;
            continue;
        }
    }

    // Return the final pushing state
    return isPushing;
}
