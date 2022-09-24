import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get a statement operation", async () => {
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

    const statementInfo = await getStatementOperationUseCase.execute({
        user_id: authUser.user.id as string,
        statement_id: statement.id as string
    });

    expect(statementInfo).toHaveProperty('id')
  });

  it("should not be able to get a statement operation for an inexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "userTest",
        statement_id: "statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get an inexistent statement operation", () => {
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

        await getStatementOperationUseCase.execute({
            user_id: authUser.user.id as string,
            statement_id: "statementTest",
        });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});