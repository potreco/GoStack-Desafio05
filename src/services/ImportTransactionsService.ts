import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

interface TransactionLines {
  title: string;
  category: string;
  type: 'income' | 'outcome';
  value: number;
}
interface Request {
  file: string;
}

class ImportTransactionsService {
  async loadCSV(filePath: string): Promise<TransactionLines[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines = [] as TransactionLines[];

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      };

      lines.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  async execute({ file }: Request): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, file);

    const lines = await this.loadCSV(csvFilePath);

    const createTransaction = new CreateTransactionService();

    const transactions: Array<Transaction> = [];

    for (const line of lines) {
      const { title, type, value, category } = line;

      const transaction = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
