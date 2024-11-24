const {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchID,
    abortLaunchByID,
} = require("../../models/launches.model");

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if (
        !launch.mission ||
        !launch.rocket ||
        !launch.launchDate ||
        !launch.target
    ) {
        return res.status(400).json({
            error: "Missing require launch property",
        });
    }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
        return res.status(400).json({ error: "invalid launch date" });
    }

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchID = Number(req.params.id);

    if (!(await existsLaunchID(launchID))) {
        return res.status(404).json({
            error: "Launch not found",
        });
    }
    const aborted = await abortLaunchByID(launchID);
    if (!aborted) {
        return res.status(400).json({ error: "launch not aborted" });
    }
    return res.status(200).json({ ok: true });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};