import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  category: string;
  type: 'income' | 'outcome';
  value: number;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const repositoryTransaction = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await repositoryTransaction.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError(
        'Você não tem saldo suficiente para fazer essa transação.',
        400,
      );
    }

    let categoryDB = await categoryRepository.findOne({
      title: category,
    });

    if (!categoryDB) {
      categoryDB = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryDB);
    }

    const transaction = await repositoryTransaction.create({
      title,
      type,
      value,
      category_id: categoryDB.id,
    });

    await repositoryTransaction.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
