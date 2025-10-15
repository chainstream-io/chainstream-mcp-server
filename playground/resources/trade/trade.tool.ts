import { DexClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported duration types
type Duration = '1m' | '5m' | '1h' | '4h' | '24h';

// Define supported sort fields for ranking
type RankingSortByField = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class TradeTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getTradeList',
    description: 'Get a list of transactions on a specific chain with filters and pagination',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
      tokenAddress: z.string().optional(),
      walletAddress: z.string().optional(),
      poolAddress: z.string().optional(),
      type: z.enum(['BUY', 'SELL']).optional(),
      beforeTimestamp: z.number().optional(),
      afterTimestamp: z.number().optional(),
      beforeBlockHeight: z.number().optional(),
      afterBlockHeight: z.number().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      direction: z.enum(['next', 'prev']).optional(),
    }),
    annotations: {
      title: 'Trade List Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTradeList(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.trade.getTrades(params);
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                ...params,
                result,
                count: result?.data?.length ?? 0,
                pagination: {
                  hasNext: result?.hasNext,
                  hasPrev: result?.hasPrev,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                  total: result?.total,
                },
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
                error: 'Failed to get trade list',
                ...params,
                message: (error as any).message,
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
  
  @Tool({
    name: 'getTradeTopTraders',
    description: 'Get top traders for a specific token on a chain',
    parameters: z.object({
      chain: z.string(),
      tokenAddress: z.string(),
      timeFrame: z.string().optional(),
      sortType: z.string().optional(),
      sortBy: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.enum(['next', 'prev']).optional(),
    }),
    annotations: {
      title: 'Top Trader Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTradeTopTraders(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.trade.getTopTraders({
        chain: params.chain,
        tokenAddress: params.tokenAddress,
        timeFrame: params.timeFrame,
        sortType: params.sortType,
        sortBy: params.sortBy,
        cursor: params.cursor,
        limit: params.limit ? Number(params.limit) : undefined,
        direction: params.direction,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                ...params,
                result,
                count: result?.data?.length ?? 0,
                pagination: {
                  hasNext: result?.hasNext,
                  hasPrev: result?.hasPrev,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                  total: result?.total,
                },
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
                error: 'Failed to get top traders',
                ...params,
                message: (error as any).message,
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
  
  @Tool({
    name: 'getTradeGainersLosers',
    description: 'Get top gainers and losers on a specific chain',
    parameters: z.object({
      chain: z.string(),
      type: z.string().optional(),
      sortBy: z.string().optional(),
      sortType: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.enum(['next', 'prev']).optional(),
    }),
    annotations: {
      title: 'Gainers/Losers Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTradeGainersLosers(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.trade.getGainersLosers({
        chain: params.chain,
        type: params.type || '1W',
        sortBy: params.sortBy || 'PnL',
        sortType: params.sortType || 'desc',
        cursor: params.cursor || '',
        limit: params.limit ? Number(params.limit) : 10,
        direction: params.direction || 'next',
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                ...params,
                result,
                count: result?.data?.length ?? 0,
                pagination: {
                  hasNext: result?.hasNext,
                  hasPrev: result?.hasPrev,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                  total: result?.total,
                },
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
                error: 'Failed to get gainers/losers',
                ...params,
                message: (error as any).message,
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
  
  @Tool({
    name: 'getTradeActivityList',
    description: 'Query token activities including trades, liquidity, and red packet events',
    parameters: z.object({
      chain: z.enum([
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui',
      ]),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.string().optional(),
      tokenAddress: z.string().optional(),
      walletAddress: z.string().optional(),
      poolAddress: z.string().optional(),
      beforeTimestamp: z.string().optional(),
      afterTimestamp: z.string().optional(),
      beforeBlockHeight: z.string().optional(),
      afterBlockHeight: z.string().optional(),
      type: z.string().optional(),
    }),
    annotations: {
      title: 'Trade Activity List Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTradeActivityList(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.trade.getActivities({
        chain: params.chain,
        cursor: params.cursor || '',
        limit: params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20,
        direction: params.direction || 'next',
        tokenAddress: params.tokenAddress || undefined,
        walletAddress: params.walletAddress || undefined,
        poolAddress: params.poolAddress || undefined,
        beforeTimestamp: params.beforeTimestamp ? Number(params.beforeTimestamp) : undefined,
        afterTimestamp: params.afterTimestamp ? Number(params.afterTimestamp) : undefined,
        beforeBlockHeight: params.beforeBlockHeight ? Number(params.beforeBlockHeight) : undefined,
        afterBlockHeight: params.afterBlockHeight ? Number(params.afterBlockHeight) : undefined,
        type: params.type || undefined,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain: params.chain,
                filters: params,
                result,
                count: result?.data?.length ?? 0,
                pagination: {
                  total: result?.total,
                  hasNext: result?.hasNext,
                  hasPrev: result?.hasPrev,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                },
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
                error: 'Failed to fetch token activities',
                chain: params.chain,
                message: (error as any).message,
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
