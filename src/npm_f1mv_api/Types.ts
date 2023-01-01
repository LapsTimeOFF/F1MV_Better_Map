type Config = {
    host: string;
    port: number | string;
};

type Topic =
    | "ArchiveStatus"
    | "AudioStreams"
    | "CarData"
    | "ChampionshipPrediction"
    | "ContentStreams"
    | "DriverList"
    | "ExtrapolatedClock"
    | "Heartbeat"
    | "LapCount"
    | "LapSeries"
    | "PitLaneTimeCollection"
    | "Position"
    | "RaceControlMessages"
    | "SessionData"
    | "SessionInfo"
    | "SessionStatus"
    | "TeamRadio"
    | "TimingAppData"
    | "TimingData"
    | "TimingStats"
    | "TopThree"
    | "TrackStatus"
    | "WeatherData"
    | "WeatherDataSeries";

type ClockTopic = "paused" | "systemTime" | "trackTime" | "liveTimingStartTime";

type DriverList = {
    RacingNumber: string;
    BroadcastName: string;
    FullName: string;
    Tla: string;
    Line: number;
    TeamName:
        | "Red Bull Racing"
        | "Ferrari"
        | "Mercedes"
        | "McLaren"
        | "Aston Martin"
        | "AlphaTauri"
        | "Alpine"
        | "Haas F1 Team"
        | "Alfa Romeo"
        | "Williams";
    TeamColour: string;
    FirstName: string;
    LastName: string;
    Reference: string;
    HeadshotUrl: string;
    CountryCode: string;
};

type Position = {
    Position: Array<{
        Timestamp: string;
        Entries: object
    }>
}

type Driver_Position = {
    Status: "OnTrack";
    X: number;
    Y: number;
    Z: number;
}

export { Config, Topic, ClockTopic, DriverList, Driver_Position, Position };
