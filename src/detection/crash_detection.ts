/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Config,
    discoverF1MVInstances,
    LiveTimingAPIGraphQL,
} from "../npm_f1mv_api";

let carData: any;
let timingData: any;
let sessionStatus: any;
let sessionInfo: any;
let sessionType: any;
let trackStatus: any;
let lapCount: any;

export async function apiRequests(config: Config) {
    const liveTimingState = await LiveTimingAPIGraphQL(config, [
        "CarData",
        "TimingData",
        "SessionStatus",
        "SessionInfo",
        "TrackStatus",
        "LapCount",
    ]);
    carData = liveTimingState.CarData.Entries;
    timingData = liveTimingState.TimingData.Lines;
    sessionStatus = liveTimingState.SessionStatus.Status;
    sessionInfo = liveTimingState.SessionInfo;
    sessionType = sessionInfo.Type;
    trackStatus = liveTimingState.TrackStatus;
    if (sessionType === "Race") {
        lapCount = liveTimingState.LapCount;
    }
}

export async function driverHasCrashed(driverNumber: string, config: Config) {
    await apiRequests(config);
    const driverCarData = getCarData(driverNumber);

    if (!weirdCarBehaviour(driverCarData, driverNumber)) return false;

    if (overwriteCrashedStatus(driverNumber)) return false;

    return true;
}

export function getCarData(driverNumber: string) {
    try {
        carData[0].Cars[driverNumber].Channels;
    } catch (error) {
        return "error";
    }
    return carData[0].Cars[driverNumber].Channels;
}

export function weirdCarBehaviour(driverCarData: any, racingNumber: string) {
    const driverTimingData = timingData[racingNumber];

    const rpm = driverCarData[0];

    const speed = driverCarData[2];

    const gear = driverCarData[3];

    const speedLimit = getSpeedThreshold();

    return (
        rpm === 0 ||
        speed <= speedLimit ||
        gear > 8 ||
        gear ===
            (sessionStatus === "Inactive" ||
            sessionStatus === "Aborted" ||
            (sessionType !== "Race" && driverTimingData.PitOut)
                ? ""
                : 0)
    );
}

export function getSpeedThreshold() {
    if (
        sessionType === "Qualifying" ||
        sessionType === "Practice" ||
        sessionStatus === "Inactive" ||
        sessionStatus === "Aborted" ||
        trackStatus.Status === "4" ||
        trackStatus.Status === "6" ||
        trackStatus.Status === "7"
    ) {
        return 10;
    }
    return 30;
}

export function overwriteCrashedStatus(racingNumber: string) {
    const driverTimingData = timingData[racingNumber];

    if (driverTimingData.InPit === true) return true;
    if (driverTimingData.Retired === true) return true;
    if (driverTimingData.Stopped === true) return true;

    const lastSectorSegments = driverTimingData.Sectors.slice(-1)[0].Segments;

    const sessionInactive =
        sessionStatus === "Inactive" || sessionStatus === "Finished";

    // Detect if grid start during inactive (formation lap) during a 'Race' session
    // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
    if (
        lastSectorSegments.slice(-2, -1)[0].Status !== 0 &&
        sessionInactive &&
        !timingData[racingNumber].PitOut
    ) {
        console.log(racingNumber + " is lining up for a race start");
        return true;
    }

    // If the race is started and the last mini sector has a different value then 0 (has a value)
    if (
        sessionType === "Race" &&
        sessionStatus === "Started" &&
        lastSectorSegments.slice(-1)[0].Status !== 0 &&
        lapCount.CurrentLap === 1
    ) {
        console.log(racingNumber + " is doing a race start");
        return true;
    }

    // Detect if practice pitstop
    // If the session is 'practice' and the second mini sector does have a value.
    if (sessionType === "Practice" && driverTimingData.PitOut) {
        console.log(racingNumber + " is doing a practice start");
        return true;
    }

    // Detect if car is in parc ferme
    // If the car has stopped anywhere in the final sector and the 'race' has 'finished'
    if (
        sessionType === "Race" &&
        sessionStatus === "Finished" &&
        lastSectorSegments.some(
            (segment: { Status: number }) => segment.Status !== 0
        )
    ) {
        console.log(racingNumber + " is in parc ferme");
        return true;
    }

    return false;
}
