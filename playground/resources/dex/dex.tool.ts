import { DexClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported DEX types
type SupportedDex = 'jupiter' | 'kyberswap' | 'raydium' | 'pumpfun' | 'moonshot' | 'candy' | 'launchpad';

@Injectable({ scope: Scope.REQUEST })
export class DexTool {
  constructor(@Inject(REQUEST) private request: Request) { }

  @Tool({
    name: 'getDexList',
    description: 'Get list of DEXs on specified blockchains',
    parameters: z.object({
      chains: z.array(z.string()).describe('List of chain names'),
      limit: z.number().min(1).max(100).optional().describe('Number of results per page'),
      dexProgram: z.string().optional().describe('DEX program address'),
    }),
    annotations: {
      title: 'DEX List Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getDexList({ chains, limit, dexProgram }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
  
      const dexList = await dexClient.dex.list({
        chains,
        limit,
        dexProgram,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chains,
                limit,
                dexProgram,
                result: dexList,
                count: dexList?.data?.length ?? 0,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to get DEX list',
                chains,
                dexProgram,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
}
