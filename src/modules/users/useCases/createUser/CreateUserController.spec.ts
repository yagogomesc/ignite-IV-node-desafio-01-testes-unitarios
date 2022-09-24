import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
        name: "User Test",
        email: "user1@test.com",
        password: "1234"
    });

    expect(response.status).toBe(201)
  })

  it("should not be able to create a user with an existent email", async () => {
    const response = await request(app).post("/api/v1/users").send({
        name: "User Test2",
        email: "user1@test.com",
        password: "1234"
    });

    expect(response.status).toBe(400)
  })
})