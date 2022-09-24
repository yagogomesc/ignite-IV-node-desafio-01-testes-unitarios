import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get the balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get the user account balance", async () => {
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

    await createStatementUseCase.execute({
      user_id: authUser.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 60,
      description: "Withdrawing 60",
    });

    const result = await getBalanceUseCase.execute({
      user_id: authUser.user.id as string
    });

    expect(result).toHaveProperty("balance");
    expect(result.balance).toBeGreaterThan(0);
  });

  it("should not be able to get the account balance from an inexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "testId"
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});