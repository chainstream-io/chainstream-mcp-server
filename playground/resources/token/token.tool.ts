import { DexClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported sort fields
type SortByField = 'marketCapInUsd' | 'liquidityInUsd' | 'priceInUsd' | 'holderCount' | 'h24VolumeInUsd' | 'h24Transactions' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class TokenTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getToken',
    description: 'Get token information by chain and address',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Information Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getToken({ chain, tokenAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');

      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      const dexClient = new DexClient(accessToken);
      const tokenInfo = await dexClient.token.getToken({
        chain: chain as SupportedChain,
        tokenAddress: tokenAddress
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              tokenInfo,
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
              error: 'Failed to get token information',
              chain,
              tokenAddress,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'searchTokens',
    description: 'Search tokens by chain and query',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      query: z.string().min(1).describe('Search keyword'),
      category: z.string().optional().describe('Token category (optional)'),
      limit: z.number().min(1).max(100).optional().describe('Result limit (1-100)'),
    }),
    annotations: {
      title: 'Token Search Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async searchTokens({ chain, query, category, limit, sort, sortBy, protocols, cursor }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');

      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      const dexClient = new DexClient(accessToken);

      if (limit && (limit < 1 || limit > 100)) throw new Error('Limit must be between 1 and 100');
      if (sort && !['asc', 'desc'].includes(sort)) throw new Error('Sort must be either "asc" or "desc"');
      if (sortBy && !['marketCapInUsd', 'liquidityInUsd', 'priceInUsd', 'holderCount', 'h24VolumeInUsd', 'h24Transactions', 'tokenCreatedAt'].includes(sortBy)) {
        throw new Error(`Invalid sortBy field: ${sortBy}`);
      }

      const searchParams: any = { chains: [chain as SupportedChain], q: query };
      if (limit) searchParams.limit = limit;
      if (sort) searchParams.sort = sort;
      if (sortBy) searchParams.sortBy = sortBy;
      if (protocols) searchParams.protocols = protocols;
      if (cursor) searchParams.cursor = cursor;

      const searchResults = await dexClient.token.search(searchParams);
      const limitedResults = Array.isArray(searchResults.data) ? searchResults.data.slice(0, 10) : searchResults.data;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              query,
              results: limitedResults,
              totalCount: searchResults.total,
              returnedCount: limitedResults.length,
              searchParams: { limit, sort, sortBy, protocols, cursor },
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
              error: 'Failed to search tokens',
              chain,
              query,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  //获取 Token Metadata 新增
  @Tool({
    name: 'getTokenMetadata',
    description: 'Get detailed token metadata by chain and address',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Metadata Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenMetadata({ chain, tokenAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');

      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      const dexClient = new DexClient(accessToken);
      const metadata = await dexClient.token.getMetadata({
        chain: chain as SupportedChain,
        tokenAddress: tokenAddress
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              metadata,
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
              error: 'Failed to get token metadata',
              chain,
              tokenAddress,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenLiquidityPools',
    description: 'Get all liquidity pools containing the specified token',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Liquidity Pools Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenLiquidityPools({ chain, tokenAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      // 调用 SDK 的 getPools 方法（假设 SDK 已封装）
      const pools = await dexClient.token.getPools({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              pools,
              poolCount: Array.isArray(pools) ? pools.length : 0,
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
              error: 'Failed to get token liquidity pools',
              chain,
              tokenAddress,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getTokenStats',
    description: 'Get token statistics across multiple timeframes',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Statistics Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenStats({ chain, tokenAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      // 调用 SDK 的 getStats 方法（假设 SDK 已封装）
      const stats = await dexClient.token.getStats({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              stats,
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
              error: 'Failed to get token statistics',
              chain,
              tokenAddress,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getTokenHolders',
    description: 'Get holders of a token by chain and address',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Holders Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenHolders({ chain, tokenAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required. Please provide a valid JWT token.');
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const holders = await dexClient.token.getHolders({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              holders,
              holderCount: holders?.total ?? 0,
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
              error: 'Failed to get token holders',
              chain,
              tokenAddress,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenCandles',
    description: 'Get token price candles (OHLC data)',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
      tokenAddress: z.string().describe('Token contract address'),
      resolution: z.enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d']).describe('Time resolution'),
      from: z.number().optional().describe('Start timestamp (Unix epoch in ms)'),
      to: z.number().optional().describe('End timestamp (Unix epoch in ms)'),
      limit: z.number().min(1).max(1000).optional().describe('Number of results per page'),
    }),
    annotations: {
      title: 'Token Candles Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenCandles({ chain, tokenAddress, resolution, from, to, limit }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const candles = await dexClient.token.getCandles({
        chain: chain as SupportedChain,
        tokenAddress,
        resolution,
        _from: from,
        to,
        limit,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain,
              tokenAddress,
              resolution,
              from,
              to,
              limit,
              candles,
              candleCount: Array.isArray(candles) ? candles.length : 0,
              sample: candles?.[0],
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
              error: 'Failed to get token price candles',
              chain,
              tokenAddress,
              resolution,
              from,
              to,
              limit,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
  

}
