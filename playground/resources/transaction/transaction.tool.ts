import { DexClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain =
  | 'sol'
  | 'base'
  | 'bsc'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'avalanche'
  | 'ethereum'
  | 'zksync'
  | 'sui';

@Injectable({ scope: Scope.REQUEST })
export class TransactionTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'sendTransaction',
    description: 'Send a transaction on a specific chain',
    parameters: z.object({
      chain: z
        .string()
        .describe(
          'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)',
        ),
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
      // Get accessToken from request headers
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;

      // Validate accessToken
      if (!accessToken) {
        throw new Error(
          'Access token is required. Please provide a valid JWT token.',
        );
      }

      // Validate chain parameter
      const supportedChains: SupportedChain[] = [
        'sol',
        'base',
        'bsc',
        'polygon',
        'arbitrum',
        'optimism',
        'avalanche',
        'ethereum',
        'zksync',
        'sui',
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(
          `Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`,
        );
      }

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK transaction.send method - correct format: dexClient.transaction.send(config)
      const transactionResult = await dexClient.transaction.send({
        chain: chain as SupportedChain,
        sendTxInput: {
          signedTx: signedTx,
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain: chain,
                signedTx: signedTx,
                transactionResult: transactionResult,
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
                chain: chain,
                signedTx: signedTx,
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
