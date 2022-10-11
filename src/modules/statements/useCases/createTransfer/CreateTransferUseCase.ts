import { container, inject, injectable } from "tsyringe";

import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

interface IRequest {
  receiverUserId: string;
  senderUserId: string;
  amount: number;
  description: string;
}

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    TRANSFER = 'transfer',
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    receiverUserId,
    senderUserId,
    amount,
    description,
  }: IRequest): Promise<void> {
    if (amount <= 0) {
      throw new AppError("Amount should be greater than 0.");
    }

    const receiverUser = await this.usersRepository.findById(receiverUserId);

    if (!receiverUser) {
      throw new AppError("Receiver user not found");
    }

    const senderUser = await this.usersRepository.findById(senderUserId);

    if (!senderUser) {
      throw new AppError("Sender user not found");
    }

    const createStatementUseCase = container.resolve(CreateStatementUseCase);

    await createStatementUseCase.execute({
      amount: amount * -1,
      description,
      type: OperationType.TRANSFER,
      user_id: senderUser.id as string,
    });

    await createStatementUseCase.execute({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: receiverUser.id as string,
    });
  }
}

export { CreateTransferUseCase };