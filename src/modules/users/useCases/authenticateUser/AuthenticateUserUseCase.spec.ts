import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate an user", () => {
    beforeEach(()=> {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    });

    it("should be able to authenticate an user", async () => {
        const user = {
            name: 'User Test',
            email: 'user@test.com',
            password: '1234',
        }

        await createUserUseCase.execute(user)

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password,
        })

        expect(result).toHaveProperty('token');
    });

    it("should not be able to authenticate a non-existent user", () => {
        expect(async () => {
            await authenticateUserUseCase.execute({
            email: "user2@test.com",
            password: "1234",
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
    
    it("should not be able to authenticate a user with incorrect password", () => {
        expect(async () => {
            const user = {
            name: "User Test",
            email: "user@test.com",
            password: "1234",
            };
            await createUserUseCase.execute(user);

            await authenticateUserUseCase.execute({
            email: user.email,
            password: "12345",
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
})