import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create a statement", () => {
    beforeEach(() => {
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to create a deposit", async () => {
        const user = {
            name: "User Test",
            email: "user@test.com",
            password: "1234",
        };

        await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password,
        });

        const statement = await createStatementUseCase.execute({
            user_id: authUser.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 200,
            description: "Depositing 200",
        });

        expect(statement).toHaveProperty('id');
        expect(statement.amount).toEqual(200);
    });

    it("should be able to create a withdraw", async () => {
        const user = {
            name: "User Test",
            email: "user@test.com",
            password: "1234",
        };

        await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password,
        });

        await createStatementUseCase.execute({
            user_id: authUser.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 200,
            description: "Depositing 200",
        });

        const statement = await createStatementUseCase.execute({
            user_id: authUser.user.id as string,
            type: OperationType.WITHDRAW,
            amount: 60,
            description: "Withdrawing 60",
          });

        expect(statement).toHaveProperty('id');
    });

    it("should not be able to create a statement for an inexistent user", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "userTest",
                type: OperationType.DEPOSIT,
                amount: 100,
                description: "Depositing 100",
            });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

    it("should not be able to withdraw when user has insufficient funds", () => {
        expect(async () => {
            const user = {
                name: "User Test",
                email: "user@test.com",
                password: "1234",
            };
    
            await createUserUseCase.execute(user);
    
            const authUser = await authenticateUserUseCase.execute({
                email: user.email,
                password: user.password,
            });
    
            await createStatementUseCase.execute({
                user_id: authUser.user.id as string,
                type: OperationType.DEPOSIT,
                amount: 100,
                description: "Depositing 100",
            });
    
            await createStatementUseCase.execute({
                user_id: authUser.user.id as string,
                type: OperationType.WITHDRAW,
                amount: 160,
                description: "Withdrawing 160",
            });
    
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    })
})