const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 0;

const SPACE_X_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    const response = await axios.post(SPACE_X_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1,
                    },
                },
                {
                    path: "payloads",
                    select: {
                        customers: 1,
                    },
                },
            ],
        },
    });

    if (response.status !== 200) {
        console.log("Problem downloading launch data");
        throw new Error("Launch data download fail");
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc["payloads"];
        const customers = payloads.flatMap((payload) => {
            return payload["customers"];
        });

        const launch = {
            flightNumber: launchDoc["flight_number"],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            upcoming: launchDoc["upcoming"],
            success: launchDoc["success"],
            customers,
        };
        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat",
    });

    if (firstLaunch) {
        console.log("Launch data alreadu load");
    } else {
        populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchID(launchID) {
    return await findLaunch({ flightNumber: launchID });
}
async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}
async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find(
            {},
            {
                _id: 0,
                __v: 0,
            }
        )
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
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
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
        throw new Error("No matching planet found");
    }

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
    loadLaunchData,
};
