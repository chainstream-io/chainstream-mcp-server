import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TokenTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getToken',
    description: 'Get token information by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const tokenInfo = await client.token.getToken(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, tokenInfo, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokens',
    description: 'Get details of multiple tokens by chain and addresses',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
      sortBy: z.string().optional().describe('Sort field'),
      sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction'),
      filterBy: z
        .array(
          z.object({
            field: z.string().describe('Filter field name'),
            min: z.string().optional().describe('Minimum value'),
            max: z.string().optional().describe('Maximum value'),
          }),
        )
        .optional()
        .describe('Filter conditions'),
    }),
    annotations: {
      title: 'Multi-Token Detail Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokens({ chain, tokenAddresses, sortBy, sortDirection, filterBy }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const tokensInfo = await client.token.getTokens(chain, {
        tokenAddresses,
        sortBy,
        sortDirection,
        filterBy,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddresses, sortBy, sortDirection, filterBy, tokensInfo, count: tokensInfo?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get multiple token details', chain, tokenAddresses, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'searchTokens',
    description: 'Search tokens by chain and query',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      query: z.string().min(1).describe('Search keyword'),
      category: z.string().optional().describe('Token category'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);

      const searchParams: any = { chains: [chain], q: query };
      if (limit) searchParams.limit = limit;
      if (sort) searchParams.sort = sort;
      if (sortBy) searchParams.sortBy = sortBy;
      if (protocols) searchParams.protocols = protocols;
      if (cursor) searchParams.cursor = cursor;

      const searchResults = await client.token.search(searchParams);
      const limitedResults = Array.isArray(searchResults.data)
        ? searchResults.data.slice(0, 10)
        : searchResults.data;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                query,
                results: limitedResults,
                hasNext: searchResults.hasNext,
                returnedCount: limitedResults.length,
                searchParams: { limit, sort, sortBy, protocols, cursor },
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
              { success: false, error: 'Failed to search tokens', chain, query, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenMetadata',
    description: 'Get detailed token metadata by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const metadata = await client.token.getMetadata(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, metadata, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token metadata', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokensMetadata',
    description: 'Get detailed metadata for multiple tokens by chain and addresses',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
    annotations: {
      title: 'Multi-Token Metadata Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokensMetadata({ chain, tokenAddresses }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const metadataMap = await client.token.getMetadataMulti(chain, { tokenAddresses });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddresses, metadata: metadataMap, count: Object.keys(metadataMap || {}).length, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get multiple token metadata', chain, tokenAddresses, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenLiquidityPools',
    description: 'Get all liquidity pools containing the specified token',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const pools = await client.token.getPools(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, pools, poolCount: Array.isArray(pools) ? pools.length : 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token liquidity pools', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenStats',
    description: 'Get token statistics across multiple timeframes',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const stats = await client.token.getStats(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, stats, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token statistics', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokensStats',
    description: 'Get statistics for multiple tokens across multiple timeframes',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
    annotations: {
      title: 'Multi-Token Statistics Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokensStats({ chain, tokenAddresses }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const statsMap = await client.token.getStatsMulti(chain, { tokenAddresses });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddresses, stats: statsMap, count: Object.keys(statsMap || {}).length, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get multiple token statistics', chain, tokenAddresses, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenHolders',
    description: 'Get holders of a token by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const holders = await client.token.getHolders(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, holders, holderCount: holders?.data?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token holders', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenHoldersMulti',
    description: 'Get holders information for multiple wallet addresses of a token',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      walletAddresses: z.string().describe('Comma-separated list of wallet addresses'),
    }),
    annotations: {
      title: 'Multi-Wallet Token Holders Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenHoldersMulti({ chain, tokenAddress, walletAddresses }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const holders = await client.token.getHoldersMulti(chain, tokenAddress, { walletAddresses });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, walletAddresses, holders, count: holders?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get holders information', chain, tokenAddress, walletAddresses, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenCandles',
    description: 'Get token price candles (OHLC data)',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      resolution: z
        .enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d'])
        .describe('Time resolution'),
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
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getCandles(chain, tokenAddress, { resolution, from, to, limit });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, resolution, from, to, limit, candles, candleCount: Array.isArray(candles) ? candles.length : 0, sample: candles?.[0], timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token price candles', chain, tokenAddress, resolution, from, to, limit, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenTopHolders',
    description: 'Get the top 20 holders of a token by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Top Holders Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenTopHolders({ chain, tokenAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const topHolders = await client.token.getTopHolders(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, topHolders, holderCount: topHolders?.data?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token top holders', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenMarketData',
    description: 'Get the market data of a token by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Market Data Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenMarketData({ chain, tokenAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const marketData = await client.token.getMarketData(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, marketData, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token market data', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokensMarketData',
    description: 'Get market data for multiple tokens by chain and addresses',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
    annotations: {
      title: 'Multi-Token Market Data Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokensMarketData({ chain, tokenAddresses }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const marketDataMap = await client.token.getMarketDataMulti(chain, { tokenAddresses });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddresses, marketData: marketDataMap, count: Object.keys(marketDataMap || {}).length, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get multiple token market data', chain, tokenAddresses, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenPrices',
    description: 'Get historical price data for a token',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'Token Prices Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenPrices({ chain, tokenAddress, cursor, limit, direction }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const prices = await client.token.getPrices(chain, tokenAddress, {
        cursor,
        limit: limit ? parseInt(limit) : undefined,
        direction,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, cursor, limit, direction, prices, count: prices?.data?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token prices', chain, tokenAddress, cursor, limit, direction, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenPriceByTime',
    description: 'Get token price at a specific timestamp',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      timestamp: z.string().describe('Timestamp for price query (Unix epoch in seconds)'),
    }),
    annotations: {
      title: 'Token Price by Time Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenPriceByTime({ chain, tokenAddress, timestamp }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const price = await client.token.getPriceByTime(chain, tokenAddress, { timestamp: parseInt(timestamp) });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, timestamp, price, timestampISO: new Date(parseInt(timestamp) * 1000).toISOString(), queryTime: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token price by time', chain, tokenAddress, timestamp, message: error.message, queryTime: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenCreation',
    description: 'Get token creation information by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Creation Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenCreation({ chain, tokenAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const creation = await client.token.getCreation(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, creation, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token creation information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenMintBurn',
    description: 'Get mint and burn information for a token',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
      type: z.enum(['all', 'mint', 'burn']).describe('Type of operation to filter'),
    }),
    annotations: {
      title: 'Token Mint and Burn Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenMintBurn({ chain, tokenAddress, cursor, limit, direction, type }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const mintBurn = await client.token.getMintAndBurn(chain, tokenAddress, {
        cursor,
        limit: limit ? parseInt(limit) : undefined,
        direction,
        type,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, cursor, limit, direction, type, mintBurn, count: mintBurn?.data?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token mint and burn information', chain, tokenAddress, cursor, limit, direction, type, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenSecurity',
    description: 'Get token security information by chain and address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Security Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenSecurity({ chain, tokenAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const security = await client.token.getSecurity(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, security, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token security information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenListFiltered',
    description: 'Get filtered token list with range conditions',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
      sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
      sortBy: z.string().optional().describe('Sort by field'),

      min_h24_volume_in_usd: z.string().optional(),
      max_h24_volume_in_usd: z.string().optional(),
      min_h24_price_change_ratio: z.string().optional(),
      max_h24_price_change_ratio: z.string().optional(),
      min_h24_buys: z.string().optional(),
      max_h24_buys: z.string().optional(),
      min_h24_sells: z.string().optional(),
      max_h24_sells: z.string().optional(),
      min_h24_trades: z.string().optional(),
      max_h24_trades: z.string().optional(),
      min_h24_buyers: z.string().optional(),
      max_h24_buyers: z.string().optional(),
      min_h24_sellers: z.string().optional(),
      max_h24_sellers: z.string().optional(),
      min_h24_buy_volume_in_usd: z.string().optional(),
      max_h24_buy_volume_in_usd: z.string().optional(),
      min_h24_sell_volume_in_usd: z.string().optional(),
      max_h24_sell_volume_in_usd: z.string().optional(),

      min_h4_volume_in_usd: z.string().optional(),
      max_h4_volume_in_usd: z.string().optional(),
      min_h4_price_change_ratio: z.string().optional(),
      max_h4_price_change_ratio: z.string().optional(),
      min_h4_buys: z.string().optional(),
      max_h4_buys: z.string().optional(),
      min_h4_sells: z.string().optional(),
      max_h4_sells: z.string().optional(),
      min_h4_trades: z.string().optional(),
      max_h4_trades: z.string().optional(),
      min_h4_buyers: z.string().optional(),
      max_h4_buyers: z.string().optional(),
      min_h4_sellers: z.string().optional(),
      max_h4_sellers: z.string().optional(),
      min_h4_buy_volume_in_usd: z.string().optional(),
      max_h4_buy_volume_in_usd: z.string().optional(),
      min_h4_sell_volume_in_usd: z.string().optional(),
      max_h4_sell_volume_in_usd: z.string().optional(),

      min_h1_volume_in_usd: z.string().optional(),
      max_h1_volume_in_usd: z.string().optional(),
      min_h1_price_change_ratio: z.string().optional(),
      max_h1_price_change_ratio: z.string().optional(),
      min_h1_buys: z.string().optional(),
      max_h1_buys: z.string().optional(),
      min_h1_sells: z.string().optional(),
      max_h1_sells: z.string().optional(),
      min_h1_trades: z.string().optional(),
      max_h1_trades: z.string().optional(),
      min_h1_buyers: z.string().optional(),
      max_h1_buyers: z.string().optional(),
      min_h1_sellers: z.string().optional(),
      max_h1_sellers: z.string().optional(),
      min_h1_buy_volume_in_usd: z.string().optional(),
      max_h1_buy_volume_in_usd: z.string().optional(),
      min_h1_sell_volume_in_usd: z.string().optional(),
      max_h1_sell_volume_in_usd: z.string().optional(),

      min_m30_volume_in_usd: z.string().optional(),
      max_m30_volume_in_usd: z.string().optional(),
      min_m30_price_change_ratio: z.string().optional(),
      max_m30_price_change_ratio: z.string().optional(),
      min_m30_buys: z.string().optional(),
      max_m30_buys: z.string().optional(),
      min_m30_sells: z.string().optional(),
      max_m30_sells: z.string().optional(),
      min_m30_trades: z.string().optional(),
      max_m30_trades: z.string().optional(),
      min_m30_buyers: z.string().optional(),
      max_m30_buyers: z.string().optional(),
      min_m30_sellers: z.string().optional(),
      max_m30_sellers: z.string().optional(),
      min_m30_buy_volume_in_usd: z.string().optional(),
      max_m30_buy_volume_in_usd: z.string().optional(),
      min_m30_sell_volume_in_usd: z.string().optional(),
      max_m30_sell_volume_in_usd: z.string().optional(),

      min_m15_volume_in_usd: z.string().optional(),
      max_m15_volume_in_usd: z.string().optional(),
      min_m15_price_change_ratio: z.string().optional(),
      max_m15_price_change_ratio: z.string().optional(),
      min_m15_buys: z.string().optional(),
      max_m15_buys: z.string().optional(),
      min_m15_sells: z.string().optional(),
      max_m15_sells: z.string().optional(),
      min_m15_trades: z.string().optional(),
      max_m15_trades: z.string().optional(),
      min_m15_buyers: z.string().optional(),
      max_m15_buyers: z.string().optional(),
      min_m15_sellers: z.string().optional(),
      max_m15_sellers: z.string().optional(),
      min_m15_buy_volume_in_usd: z.string().optional(),
      max_m15_buy_volume_in_usd: z.string().optional(),
      min_m15_sell_volume_in_usd: z.string().optional(),
      max_m15_sell_volume_in_usd: z.string().optional(),

      min_m5_volume_in_usd: z.string().optional(),
      max_m5_volume_in_usd: z.string().optional(),
      min_m5_price_change_ratio: z.string().optional(),
      max_m5_price_change_ratio: z.string().optional(),
      min_m5_buys: z.string().optional(),
      max_m5_buys: z.string().optional(),
      min_m5_sells: z.string().optional(),
      max_m5_sells: z.string().optional(),
      min_m5_trades: z.string().optional(),
      max_m5_trades: z.string().optional(),
      min_m5_buyers: z.string().optional(),
      max_m5_buyers: z.string().optional(),
      min_m5_sellers: z.string().optional(),
      max_m5_sellers: z.string().optional(),
      min_m5_buy_volume_in_usd: z.string().optional(),
      max_m5_buy_volume_in_usd: z.string().optional(),
      min_m5_sell_volume_in_usd: z.string().optional(),
      max_m5_sell_volume_in_usd: z.string().optional(),

      min_m1_volume_in_usd: z.string().optional(),
      max_m1_volume_in_usd: z.string().optional(),
      min_m1_price_change_ratio: z.string().optional(),
      max_m1_price_change_ratio: z.string().optional(),
      min_m1_buys: z.string().optional(),
      max_m1_buys: z.string().optional(),
      min_m1_sells: z.string().optional(),
      max_m1_sells: z.string().optional(),
      min_m1_trades: z.string().optional(),
      max_m1_trades: z.string().optional(),
      min_m1_buyers: z.string().optional(),
      max_m1_buyers: z.string().optional(),
      min_m1_sellers: z.string().optional(),
      max_m1_sellers: z.string().optional(),
      min_m1_buy_volume_in_usd: z.string().optional(),
      max_m1_buy_volume_in_usd: z.string().optional(),
      min_m1_sell_volume_in_usd: z.string().optional(),
      max_m1_sell_volume_in_usd: z.string().optional(),
    }),
    annotations: {
      title: 'Token List Filtered Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenListFiltered(params) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const { chain, ...query } = params;

      const client = new ChainStreamClient(accessToken);
      const list = await client.token.listToken(chain, query);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, filters: query, list, count: list?.data?.length ?? 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get filtered token list', message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getDevTokens',
    description: 'Get all tokens created by a developer address',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      devAddress: z.string().describe('Developer wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Number of results per page'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'Developer Tokens Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getDevTokens({ chain, devAddress, cursor, limit, direction }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const devTokens = await client.token.getDevTokens(chain, devAddress, { cursor, limit, direction });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, devAddress, devTokens, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get developer tokens', chain, devAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenTraders',
    description: 'Get traders by tag for a token',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      tag: z.enum(['fresh', 'sandwich', 'bundle', 'sniper', 'dev', 'pro', 'insider']).describe('Trader tag'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Number of results per page'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'Token Traders Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenTraders({ chain, tokenAddress, tag, cursor, limit, direction }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const traders = await client.token.getTokenTraders(chain, tokenAddress, tag, { cursor, limit, direction });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, tag, traders, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token traders', chain, tokenAddress, tag, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenLiquiditySnapshots',
    description: 'Get token liquidity snapshots over time',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      time: z.string().optional().describe('Timestamp filter'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Number of results per page'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'Token Liquidity Snapshots Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenLiquiditySnapshots({ chain, tokenAddress, time, cursor, limit, direction }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const snapshots = await client.token.getTokenLiquiditySnapshots(chain, tokenAddress, { time, cursor, limit, direction });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, snapshots, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token liquidity snapshots', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenTransfers',
    description: 'Get token transfer history',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Number of results per page'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'Token Transfers Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenTransfers({ chain, tokenAddress, cursor, limit, direction }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const transfers = await client.token.getTokenTransfers(chain, tokenAddress, { cursor, limit, direction });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, transfers, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token transfers', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getTokenTransferTotal',
    description: 'Get token transfer total count',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'Token Transfer Total Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getTokenTransferTotal({ chain, tokenAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const transferTotal = await client.token.getTokenTransferTotal(chain, tokenAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, tokenAddress, transferTotal, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get token transfer total', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getPairCandles',
    description: 'Get pair candlestick data (OHLC) for a token pair',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      pair: z.string().describe('Token pair (format: TOKENA-TOKENB)'),
      resolution: z
        .enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d'])
        .describe('Time resolution'),
    }),
    annotations: {
      title: 'Pair Candles Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getPairCandles({ chain, pair, resolution }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getPairCandles(chain, pair, { resolution });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, pair, resolution, candles, candleCount: Array.isArray(candles) ? candles.length : 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get pair candles', chain, pair, resolution, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getPoolCandles',
    description: 'Get pool candlestick data (OHLC) for a specific liquidity pool',
    parameters: z.object({
      chain: z.string().describe('Blockchain chain symbol (e.g., sol, eth, bsc)'),
      poolAddress: z.string().describe('Liquidity pool address'),
      resolution: z
        .enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d'])
        .describe('Time resolution'),
    }),
    annotations: {
      title: 'Pool Candles Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getPoolCandles({ chain, poolAddress, resolution }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getPoolCandles(chain, poolAddress, { resolution });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { success: true, chain, poolAddress, resolution, candles, candleCount: Array.isArray(candles) ? candles.length : 0, timestamp: new Date().toISOString() },
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
              { success: false, error: 'Failed to get pool candles', chain, poolAddress, resolution, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}
