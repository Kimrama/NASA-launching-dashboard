const requese = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetData } = require("../../models/planets.model");
describe("Launches API", () => {
    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetData();
    });
    afterAll(async () => {
        await mongoDisconnect();
    });

    describe("Test GET /launches", () => {
        test("It should response with 200 success", async () => {
            const response = await requese(app)
                .get("/v1/launches")
                .expect("Content-Type", /json/)
                .expect(200);
        });
    });

    describe("Test POST /launches", () => {
        const completeLaunchData = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "January 4, 2028",
        };

        const launchDataWithoutTheDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
        };

        const launchDataWithInvalidDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: "Kepler-62 f",
            launchDate: "January 4, 2028 abc",
        };

        test("It should respose with 201 created ", async () => {
            const response = await requese(app)
                .post("/v1/launches")
                .send(completeLaunchData)
                .expect("Content-Type", /json/)
                .expect(201);

            const requestDate = new Date(
                completeLaunchData.launchDate
            ).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutTheDate);
        });

        test("It should catch missing require property", async () => {
            const response = await requese(app)
                .post("/v1/launches")
                .send(launchDataWithoutTheDate)
                .expect("Content-Type", /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: "Missing require launch property",
            });
        });

        test("It should catch invalid date", async () => {
            const response = await requese(app)
                .post("/v1/launches")
                .send(launchDataWithInvalidDate)
                .expect("Content-Type", /json/)
                .expect(400);
            expect(response.body).toStrictEqual({
                error: "invalid launch date",
            });
        });
    });
});
