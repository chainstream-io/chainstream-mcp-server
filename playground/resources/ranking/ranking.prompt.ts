import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class RankingPrompt {
  constructor() {}

  @Prompt({
    name: 'hot-tokens-analysis',
    description: 'Analyze trending tokens on a chain within a timeframe, covering price, volume, sentiment, risks, and investment tips.',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      timeframe: z.string().describe('Time range'),
    }),
  })
  getHotTokensAnalysis({ chainId, timeframe }) {
    return {
      description: 'Hot tokens trend analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please analyze hot tokens trends on chain ${chainId} within ${timeframe} time range and provide investment advice.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will provide comprehensive hot tokens analysis including:
1. Price trend analysis
2. Trading volume changes
3. Market sentiment assessment
4. Risk assessment
5. Investment recommendations

Please use the getHotTokens tool to get the latest data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'ranking-new-tokens-guide',
    description: 'Fetch the latest 100 newly launched tokens on a chain, with metadata, market data, and social info.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
    }),
  })
  getRankingNewTokensGuide({ chain }) {
    return {
      description: 'New token ranking query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch the latest tokens on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve the latest 100 tokens including:
  - Name, symbol, address, metadata
  - Market data and stats
  - Social media and launchpad info
  
  Please use the getRankingNewTokens tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'ranking-stocks-tokens-guide',
    description: 'Retrieve tokens that represent or track stock assets on a chain, with market and metadata details.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
    }),
  })
  getRankingStocksTokensGuide({ chain }) {
    return {
      description: 'Stock token ranking query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch stock-related tokens on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve tokens that represent or track stock assets, including:
  - Token name, symbol, address
  - Market data and trading stats
  - Social media and metadata
  - Launchpad and protocol info
  
  Please use the getRankingStocksTokens tool to fetch the actual data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'ranking-finalstretch-tokens-guide',
    description: 'Fetch tokens in their final stretch phase on a chain, including stats, metadata, and protocol info.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
    }),
  })
  getRankingFinalStretchTokensGuide({ chain }) {
    return {
      description: 'FinalStretch token ranking query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch finalStretch tokens on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve tokens in their final stretch phase, including:
  - Token name, symbol, address
  - Market data and trading stats
  - Social media and metadata
  - Launchpad and protocol info
  
  Please use the getRankingFinalStretchTokens tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'ranking-migrated-tokens-guide',
    description: 'Retrieve tokens that have migrated to new protocols or pools, with migration metadata and market stats.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
    }),
  })
  getRankingMigratedTokensGuide({ chain }) {
    return {
      description: 'Migrated token ranking query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch migrated tokens on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve tokens that have migrated to new protocols or pools, including:
  - Token name, symbol, address
  - Migration metadata and destination
  - Market data and trading stats
  - Social media and launchpad info
  
  Please use the getRankingMigratedTokens tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
}
