const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        require: true,
    },
    mission: {
        type: String,
        require: true,
    },
    rocket: {
        type: String,
        require: true,
    },
    launchDate: {
        type: Date,
        require: true,
    },
    target: {
        type: String,
    },
    upcoming: {
        type: Boolean,
        require: true,
    },
    success: {
        type: Boolean,
        require: true,
    },
    customers: [String],
});

//connect launchesSchema with the "launches" collection
module.exports = mongoose.model("Launch", launchesSchema);
