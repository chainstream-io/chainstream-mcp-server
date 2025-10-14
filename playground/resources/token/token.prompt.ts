import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TokenPrompt {
  constructor() {}

  @Prompt({
    name: 'token-research-guide',
    description: 'Token research and analysis guide',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenResearchGuide({ tokenAddress, chain }) {
    return {
      description: 'Token research analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me research token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will provide comprehensive token research analysis including:
1. Basic information analysis (name, symbol, total supply, etc.)
2. Price and market cap analysis
3. Trading volume analysis
4. Technical indicators assessment
5. Risk assessment
6. Investment recommendations

Please use the getToken tool to get detailed information.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'token-search-strategy',
    description: 'Token search strategy guide',
    parameters: z.object({
      searchType: z.enum(['by-name', 'by-symbol', 'by-category', 'trending']).describe('Search type'),
      investmentGoal: z.enum(['short-term', 'long-term', 'yield-farming', 'governance']).describe('Investment goal'),
    }),
  })
  getTokenSearchStrategy({ searchType, investmentGoal }) {
    const strategies = {
      'by-name': {
        'short-term': 'Search tokens by name suitable for short-term trading, focus on liquidity and volatility.',
        'long-term': 'Search tokens by name with long-term value, focus on fundamentals.',
        'yield-farming': 'Search tokens by name suitable for farming, focus on yield rates.',
        'governance': 'Search governance tokens by name, focus on voting rights and community activity.',
      },
      'by-symbol': {
        'short-term': 'Search popular trading tokens by symbol.',
        'long-term': 'Search well-known project tokens by symbol.',
        'yield-farming': 'Search farming tokens by symbol.',
        'governance': 'Search governance tokens by symbol.',
      },
      'by-category': {
        'short-term': 'Search hot sector tokens by category.',
        'long-term': 'Search promising sector tokens by category.',
        'yield-farming': 'Search farming sector tokens by category.',
        'governance': 'Search governance sector tokens by category.',
      },
      'trending': {
        'short-term': 'Focus on short-term opportunities in trending tokens.',
        'long-term': 'Analyze long-term value of trending tokens.',
        'yield-farming': 'Look for farming opportunities in trends.',
        'governance': 'Focus on governance tokens in trends.',
      },
    };

    const strategy = strategies[searchType][investmentGoal];

    return {
      description: 'Token search strategy guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to search tokens using ${searchType} method, my investment goal is ${investmentGoal}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: strategy,
          },
        },
      ],
    };
  }

  // 获取 Token Metadata
  @Prompt({
    name: 'token-metadata-guide',
    description: 'Guide to fetch token metadata information',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenMetadataGuide({ tokenAddress, chain }) {
    return {
      description: 'Token metadata fetch guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch metadata for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve the token metadata including:
- Name, symbol, decimals
- Metadata address
- Token creators and verification
- Image/logo URL
- Social media links
- Extra attributes (program, authorities, standards, etc.)
- Creation date and description

Please use the getTokenMetadata tool to fetch the actual data from the API.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'token-liquidity-pools',
    description: 'Get all liquidity pools containing the specified token',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenLiquidityPools({ tokenAddress, chain }) {
    return {
      description: 'Token liquidity pool query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me find all liquidity pools that include token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve all liquidity pools that contain this token on the specified chain. This includes:
  - Pool address
  - Protocol name and family
  - Token pair (A/B)
  - TVL (Total Value Locked) in USD and native token
  - Associated program and image
  
  Please use the getTokenLiquidityPools tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-stats-guide',
    description: 'Guide to fetch token statistics across multiple timeframes',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenStatsGuide({ tokenAddress, chain }) {
    return {
      description: 'Token statistics query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide statistical data for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve token statistics including:
  - Price movements across timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h)
  - Buy/sell volumes and counts
  - Trader activity and trade counts
  - High/low/open/close prices
  - Price change ratios
  
  Please use the getTokenStats tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-holders-guide',
    description: 'Guide to fetch holders of a token',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenHoldersGuide({ tokenAddress, chain }) {
    return {
      description: 'Token holders query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the holders of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the list of wallets holding this token, including:
  - Wallet address
  - Holding amount
  - USD value
  - Percentage of total supply
  
  Please use the getTokenHolders tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-candles-guide',
    description: 'Guide to fetch token price candles (OHLC data)',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      resolution: z.enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d']).describe('Time resolution for candle data'),
      from: z.string().optional().describe('Start timestamp (Unix epoch in milliseconds)'),
      to: z.string().optional().describe('End timestamp (Unix epoch in milliseconds)'),
      limit: z.string().optional().describe('Number of results per page'),
    }),
  })
  getTokenCandlesGuide({ tokenAddress, chain, resolution, from, to, limit }) {
    return {
      description: 'Token price candles query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the ${resolution} price candles for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's price candles including:
  - Open, High, Low, Close prices
  - Volume and timestamp
  - Resolution: ${resolution}
  ${from ? `- From: ${new Date(Number(from)).toISOString()}` : ''}
  ${to ? `- To: ${new Date(Number(to)).toISOString()}` : ''}
  ${limit ? `- Limit: ${limit}` : ''}
  
  Please use the getTokenCandles tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  
  
}
