import supertest from "supertest";
import app from "../../src/app";

const api = supertest(app);
const BASE_URL = "/auth";

describe("POST", () => {
    describe("/auth/register", () => {
        it("should return status code 201", async () => {
            await api.post(BASE_URL + "/register").expect(201);
        });

        it("should return json format data", async () => {
            await api
                .post(BASE_URL + "/register")
                .expect("Content-Type", /json/);
        });
    });
});
