import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('${id}', 'User Test', 'user@test.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get the user account balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "1234",
    })

    const { token } = responseToken.body;

    await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 600,
      description: "Depositing 600",
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 200,
      description: "Depositing 200",
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    const response = await request(app).get("/api/v1/statements/balance").set({
        Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
  });

  it("should not be able to get the account balance from an inexistent user", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toBe(401)
  })
});