import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TradePrompt {
  constructor() {}

  @Prompt({
    name: 'trade-list-guide',
    description:
      'Fetch a list of trades on a chain, filterable by token, wallet, pool, type, time, or block height.',
    parameters: z.object({
      chain: z.string(),
      tokenAddress: z.string().optional(),
      walletAddress: z.string().optional(),
      poolAddress: z.string().optional(),
      type: z.enum(['BUY', 'SELL']).optional(),
      beforeTimestamp: z.string().optional(),
      afterTimestamp: z.string().optional(),
      beforeBlockHeight: z.string().optional(),
      afterBlockHeight: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.enum(['next', 'prev']).optional(),
    }),
  })
  getTradeListGuide(params) {
    return {
      description: 'Trade list query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch trades on chain ${params.chain}${params.tokenAddress ? ` for token ${params.tokenAddress}` : ''}${params.walletAddress ? ` by wallet ${params.walletAddress}` : ''}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve transaction data including:
  - Token and side token details
  - Trade type, amount, price, and USD value
  - Block height, timestamp, and signature
  - Pool and DEX metadata
  - Pagination info (cursor, hasNext, hasPrev)
  
  Please use the getTradeList tool to fetch the actual data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'trade-top-traders-guide',
    description:
      'Retrieve top traders for a token on a chain, with volume, trade count, and sorting options.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token address to query top traders'),
      timeFrame: z
        .string()
        .optional()
        .describe('Time frame (e.g., 30m, 1h, 24h)'),
      sortType: z.string().optional().describe('Sort type (asc or desc)'),
      sortBy: z
        .string()
        .optional()
        .describe('Sort field (e.g., volume, trade)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Max number of results (1–10)'),
      direction: z
        .enum(['next', 'prev'])
        .optional()
        .describe('Pagination direction'),
    }),
  })
  getTradeTopTradersGuide(params) {
    return {
      description: 'Top trader query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch top traders for token ${params.tokenAddress} on chain ${params.chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve top traders including:
  - Wallet address and trader type (e.g., whale)
  - Trade count and volume (buy/sell)
  - Sorting and pagination metadata
  
  Please use the getTradeTopTraders tool to fetch the actual data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'trade-gainers-losers-guide',
    description:
      'Fetch top gaining and losing tokens on a chain, based on PnL, volume, and timeframe.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
      type: z.string().optional().describe('Time frame type (e.g., 1W, 24h)'),
      sortBy: z.string().optional().describe('Sort field (e.g., PnL, volume)'),
      sortType: z.string().optional().describe('Sort order (asc or desc)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Max number of results (1–10)'),
      direction: z
        .enum(['next', 'prev'])
        .optional()
        .describe('Pagination direction'),
    }),
  })
  getTradeGainersLosersGuide(params) {
    return {
      description: 'Gainers/Losers token query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch top gainers and losers on chain ${params.chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve tokens with the highest price increases and decreases, including:
  - Token address and PnL
  - Trade count and volume
  - Sorting and pagination metadata
  
  Please use the getTradeGainersLosers tool to fetch the actual data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'trade-activity-list-guide',
    description:
      'Query token-related activities (trades, liquidity, red packets) with multiple filters and pagination.',
    parameters: z.object({
      chain: z.string().describe('Blockchain network (e.g., sol, eth, bsc)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z
        .string()
        .optional()
        .describe('Number of results per page (1–100)'),
      direction: z
        .string()
        .optional()
        .describe('Pagination direction (next or prev)'),
      tokenAddress: z.string().optional().describe('Token address to query'),
      walletAddress: z.string().optional().describe('Wallet address to query'),
      poolAddress: z.string().optional().describe('Pool address to filter'),
      beforeTimestamp: z
        .string()
        .optional()
        .describe('Start timestamp (Unix epoch in ms)'),
      afterTimestamp: z
        .string()
        .optional()
        .describe('End timestamp (Unix epoch in ms)'),
      beforeBlockHeight: z
        .string()
        .optional()
        .describe('Filter before block height'),
      afterBlockHeight: z
        .string()
        .optional()
        .describe('Filter after block height'),
      type: z
        .string()
        .optional()
        .describe('Activity type (e.g., BUY, SELL, RED_PACKET_CLAIM)'),
    }),
  })
  getTradeActivityListGuide(params) {
    return {
      description: 'Trade activity query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch token activities on chain ${params.chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve token-related activities including:
  - Trades, liquidity events, and red packet actions
  - Filterable by wallet, token, pool, time, block, and type
  
  Please use the getTradeActivityList tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
}
