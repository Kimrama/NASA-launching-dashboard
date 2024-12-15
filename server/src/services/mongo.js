const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL =
    "mongodb+srv://nasa-api:CbTVcZ0q6OrulX9D@nasacluster.b8cae.mongodb.net/nasa?retryWrites=true&w=majority";

mongoose.connection.once("open", () => {
    console.log("MongoDB connection ready");
});

mongoose.connection.on("error", (err) => {
    console.log(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}
async function mongoDisconnect() {
    await mongoose.disconnect();
}
module.exports = { mongoConnect, mongoDisconnect };
