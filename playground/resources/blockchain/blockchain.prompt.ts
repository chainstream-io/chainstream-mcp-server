import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class BlockchainPrompt {
  constructor() {}

  @Prompt({
    name: 'blockchain-list-guide',
    description: 'Fetch and describe the full list of supported blockchains, including symbol, name, explorer URL, and chain ID.',
    parameters: z.object({}),
  })
  getBlockchainListGuide() {
    return {
      description: 'Blockchain list query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Please fetch the list of supported blockchains.',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve the list of supported blockchains including:
  - Blockchain symbol (e.g., SOL, ETH, BSC)
  - Blockchain name (e.g., Solana, Ethereum, Binance Smart Chain)
  - Explorer URL
  - Chain ID
  
  Please use the getBlockchainList tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'blockchain-latest-block-guide',
    description: 'Retrieve the latest block details for a given blockchain, including block hash and block height.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported: sol, base, bsc, polygon, arbitrum, optimism, avalanche, ethereum, zksync, sui)'
      ),
    }),
  })
  getBlockchainLatestBlockGuide({ chain }) {
    return {
      description: 'Blockchain latest block query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch the latest block information for chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve the latest block information including:
  - Latest block hash
  - Last valid block height
  
  Please use the getBlockchainLatestBlock tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
}