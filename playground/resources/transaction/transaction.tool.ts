import { ChainStreamClient, EstimateGasLimitInput } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TransactionTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'sendTransaction',
    description: 'Send a signed transaction on a specific chain',
    parameters: z.object({
      chain: z.enum(['sol', 'bsc', 'eth']).describe('Chain symbol'),
      signedTx: z.string().describe('Base64 encoded signed transaction'),
    }),
    annotations: {
      title: 'Transaction Sending Tool',
      destructiveHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  })
  async sendTransaction({ chain, signedTx }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const transactionResult = await client.transaction.send(chain, { signedTx });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                signedTx,
                transactionResult,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Failed to send transaction',
                chain,
                signedTx,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getGasPrice',
    description: 'Get the current gas price for an EVM chain',
    parameters: z.object({
      chain: z.enum(['bsc', 'eth']).describe('EVM chain symbol'),
    }),
    annotations: {
      title: 'Gas Price Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getGasPrice({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const gasPrice = await client.transaction.getGasPrice(chain);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                gasPrice,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Failed to get gas price',
                chain,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'estimateGasLimit',
    description: 'Estimate the gas limit for a transaction on an EVM chain',
    parameters: z.object({
      chain: z.enum(['bsc', 'eth']).describe('EVM chain symbol'),
      from: z.string().describe('Sender address'),
      to: z.string().describe('Destination address'),
      data: z.string().describe('Transaction data (hex encoded)'),
      value: z.string().optional().describe('Value to send in wei (hex string)'),
    }),
    annotations: {
      title: 'Gas Limit Estimation Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async estimateGasLimit({ chain, from, to, data, value }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

      const input: EstimateGasLimitInput = { from, to, data, value };

      const client = new ChainStreamClient(accessToken);
      const result = await client.transaction.getGasLimit(chain, input);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                input,
                result,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Failed to estimate gas limit',
                chain,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}
