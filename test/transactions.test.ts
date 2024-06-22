import { execSync } from 'child_process';
import { after } from 'node:test';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { app } from '../src/app';

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  test('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    });

    expect(response.statusCode).toEqual(201);
  });

  test('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie') || [''];

    const response = await request(app.server).get('/transactions').set('Cookie', cookies);

    expect(response.statusCode).toEqual(200);
    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ]);
  });

  test('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie') || [''];

    const transactionList = await request(app.server).get('/transactions').set('Cookie', cookies);

    const transactionId = transactionList.body.transactions[0].id;

    const response = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(response.statusCode).toEqual(200);
    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    );
  });

  test('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie') || [''];

    await request(app.server).post('/transactions').set('Cookie', cookies).send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies);

    console.log(summaryResponse.body);

    expect(summaryResponse.statusCode).toEqual(200);
    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      }),
    );
  });
});
