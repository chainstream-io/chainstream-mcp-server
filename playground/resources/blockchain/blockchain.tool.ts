import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class BlockchainTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getBlockchainList',
    description: 'Get list of supported blockchains',
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

      const client = new ChainStreamClient(accessToken);
      const blockchains = await client.blockchain.getSupportedBlockchains();

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
      chain: z.string().describe('Chain symbol (sol, eth, bsc)'),
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

      const client = new ChainStreamClient(accessToken);
      const latestBlock = await client.blockchain.getLatestBlock(chain);

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
