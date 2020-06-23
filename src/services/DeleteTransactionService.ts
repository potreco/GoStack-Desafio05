// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const repo = getCustomRepository(TransactionsRepository);

    const transaction = await repo.findOne({ id });

    if (!transaction) {
      throw new AppError('Essa transação não existe', 400);
    }

    await repo.remove(transaction);
  }
}

export default DeleteTransactionService;
