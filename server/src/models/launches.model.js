const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 0;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date("December 27, 2030"),
    target: "Kepler-442 b",
    customers: ["Kimrama", "NASA"],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

async function existsLaunchID(launchID) {
    return await launchesDatabase.findOne({ flightNumber: launchID });
}
async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}
async function getAllLaunches() {
    return await launchesDatabase.find(
        {},
        {
            _id: 0,
            __v: 0,
        }
    );
}

async function saveLaunch(launch) {
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
        throw new Error("No matching planet found");
    }
    await launchesDatabase.findOneAndUpdate(
        {
            flightNumber: launch.flightNumber,
        },
        launch,
        {
            upsert: true,
        }
    );
}

async function scheduleNewLaunch(launch) {
    const newLaunch = Object.assign(launch, {
        customer: ["Kimrama", "NASA"],
        upcoming: true,
        success: true,
        flightNumber: (await getLatestFlightNumber()) + 1,
    });
    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             flightNumber: latestFlightNumber,
//             customer: ["Kimrama", "NASA"],
//             upcoming: true,
//             success: true,
//         })
//     );
// }

async function abortLaunchByID(launchID) {
    const aborted = await launchesDatabase.updateOne(
        {
            flightNumber: launchID,
        },
        {
            success: false,
            upcoming: false,
        }
    );

    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    existsLaunchID,
    abortLaunchByID,
    scheduleNewLaunch,
};
