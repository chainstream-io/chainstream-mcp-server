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
export class BlockchainTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getBlockchainList',
    description: 'Get list of supported blockchains',
    // parameters: z.object({}),
    annotations: {
      title: 'Blockchain List Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getBlockchainList() {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

      const dexClient = new DexClient(accessToken);

      const blockchains = await dexClient.blockchain.getSupportedBlockchains();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                blockchains,
                count: blockchains?.length ?? 0,
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
            type: 'json',
            json: {
              success: false,
              error: 'Failed to get blockchain list',
              message: error.message,
              message_all: error,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      };
      
    }
  }

  @Tool({
    name: 'getBlockchainLatestBlock',
    description: 'Get the latest block information for a specific blockchain',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
    }),
    annotations: {
      title: 'Blockchain Latest Block Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getBlockchainLatestBlock({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

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
        throw new Error(`Unsupported chain: ${chain}`);
      }

      const dexClient = new DexClient(accessToken);

      const latestBlock = await dexClient.blockchain.getLatestBlock({
        chain: chain as SupportedChain,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                latestBlock,
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
                error: 'Failed to get latest block information',
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
