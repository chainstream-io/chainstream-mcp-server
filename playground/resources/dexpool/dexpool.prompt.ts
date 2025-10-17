import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DexpoolPrompt {
  constructor() {}

  @Prompt({
    name: 'dexpool-detail-guide',
    description: 'Retrieve detailed information for a specific DEX pool, including token pair, protocol, TVL, and chain data.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported: sol, base, bsc, polygon, arbitrum, optimism, avalanche, ethereum, zksync, sui)'
      ),
      poolAddress: z.string().describe('DEX pool address'),
    }),
  })
  getDexpoolDetailGuide({ chain, poolAddress }) {
    return {
      description: 'DEX pool detail query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch detailed information for DEX pool ${poolAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve detailed information for the DEX pool including:
  - Token A and B addresses
  - DEX program and protocol family
  - Protocol name and logo
  - TVL in USD and native token
  - Chain and pool address
  
  Please use the getDexpoolDetail tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
}