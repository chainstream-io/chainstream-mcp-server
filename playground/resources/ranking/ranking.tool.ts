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
export class RankingTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getHotTokens',
    description: 'Get hot tokens ranking by chain and duration with advanced filters',
    parameters: z.object({
      chain: z.enum(['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui']).describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      duration: z.enum(['1m', '5m', '1h', '4h', '24h']).describe('Time duration for ranking (1m=1 minute, 5m=5 minutes, 1h=1 hour, 4h=4 hours, 24h=24 hours)'),
      sortBy: z.enum(['marketData.priceInUsd', 'stats.priceChangeRatioInUsd1m', 'stats.priceChangeRatioInUsd5m', 'stats.priceChangeRatioInUsd1h', 'stats.priceChangeRatioInUsd4h', 'stats.priceChangeRatioInUsd24h', 'marketData.marketCapInUsd', 'marketData.tvlInUsd', 'marketData.top10HoldingsRatio', 'marketData.top100HoldingsRatio', 'marketData.holders', 'stats.trades1m', 'stats.trades5m', 'stats.trades1h', 'stats.trades4h', 'stats.trades24h', 'stats.traders1m', 'stats.traders5m', 'stats.traders1h', 'stats.traders4h', 'stats.traders24h', 'stats.volumesInUsd1m', 'stats.volumesInUsd5m', 'stats.volumesInUsd1h', 'stats.volumesInUsd4h', 'stats.volumesInUsd24h', 'tokenCreatedAt']).optional().describe('Sort field for ranking'),
      sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (ASC or DESC)'),
      filterBy: z.any().optional().describe('Filter criteria object'),

    }),
    annotations: {
      title: 'Hot Tokens Ranking Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getHotTokens({ chain, duration, sortBy, sortDirection, filterBy }) {
    try {
      // Get accessToken from request headers
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;

      // Validate accessToken
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }

      // Validate chain parameter
      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      // Validate duration parameter
      const supportedDurations: Duration[] = ['1m', '5m', '1h', '4h', '24h'];
      if (!supportedDurations.includes(duration as Duration)) {
        throw new Error(`Unsupported duration: ${duration}. Supported durations: ${supportedDurations.join(', ')}`);
      }
      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Validate parameters
      if (sortBy && !['marketData.priceInUsd', 'stats.priceChangeRatioInUsd1m', 'stats.priceChangeRatioInUsd5m', 'stats.priceChangeRatioInUsd1h', 'stats.priceChangeRatioInUsd4h', 'stats.priceChangeRatioInUsd24h', 'marketData.marketCapInUsd', 'marketData.tvlInUsd', 'marketData.top10HoldingsRatio', 'marketData.top100HoldingsRatio', 'marketData.holders', 'stats.trades1m', 'stats.trades5m', 'stats.trades1h', 'stats.trades4h', 'stats.trades24h', 'stats.traders1m', 'stats.traders5m', 'stats.traders1h', 'stats.traders4h', 'stats.traders24h', 'stats.volumesInUsd1m', 'stats.volumesInUsd5m', 'stats.volumesInUsd1h', 'stats.volumesInUsd4h', 'stats.volumesInUsd24h', 'tokenCreatedAt'].includes(sortBy)) {
        throw new Error(`Invalid sortBy field: ${sortBy}`);
      }

      if (sortDirection && !['ASC', 'DESC'].includes(sortDirection)) {
        throw new Error('SortDirection must be either "ASC" or "DESC"');
      }

      // Build search parameters
      const searchParams: any = {
        chain: chain as SupportedChain,
        duration: duration as Duration,
      };

      // Add optional parameters
      if (sortBy) searchParams.sortBy = sortBy;
      if (sortDirection) searchParams.sortDirection = sortDirection;
      if (filterBy) searchParams.filterBy = filterBy;

      // Call SDK getHotTokens method with all parameters
      const hotTokens = await dexClient.ranking.getHotTokens(searchParams);

      // Limit results to maximum 10 items
      const limitedHotTokens = Array.isArray(hotTokens) ? hotTokens.slice(0, 10) : hotTokens;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain: chain,
              duration: duration,
              hotTokens: limitedHotTokens,
              totalCount: hotTokens.length,
              returnedCount: limitedHotTokens.length,
              searchParams: {
                sortBy,
                sortDirection,
                filterBy
              },
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to get hot tokens',
              chain: chain,
              duration: duration,
              message: (error as any).message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getRankingNewTokens',
    description: 'Get the latest 100 tokens on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
    }),
    annotations: {
      title: 'New Token Ranking Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRankingNewTokens({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.ranking.getNewTokens({ chain });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                result,
                count: result?.length ?? 0,
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
                error: 'Failed to get new token rankings',
                chain,
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
    name: 'getRankingStocksTokens',
    description: 'Get stock-related tokens on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
    }),
    annotations: {
      title: 'Stock Token Ranking Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRankingStocksTokens({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.ranking.getStocksTokens({ chain });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                result,
                count: result?.length ?? 0,
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
                error: 'Failed to get stock token rankings',
                chain,
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
    name: 'getRankingFinalStretchTokens',
    description: 'Get finalStretch tokens on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
    }),
    annotations: {
      title: 'FinalStretch Token Ranking Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRankingFinalStretchTokens({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.ranking.getFinalStretchTokens({ chain });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                result,
                count: result?.length ?? 0,
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
                error: 'Failed to get finalStretch token rankings',
                chain,
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
    name: 'getRankingMigratedTokens',
    description: 'Get migrated tokens on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
    }),
    annotations: {
      title: 'Migrated Token Ranking Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRankingMigratedTokens({ chain }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.ranking.getMigratedTokens({ chain });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                result,
                count: result?.length ?? 0,
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
                error: 'Failed to get migrated token rankings',
                chain,
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
