import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Tool } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';
import { z } from 'zod';
import { Request } from 'express';

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

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK getToken method with validated chain
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
              chain: chain,
              tokenAddress: tokenAddress,
              tokenInfo: tokenInfo,
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
              chain: chain,
              tokenAddress: tokenAddress,
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

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Validate parameters
      if (limit && (limit < 1 || limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }

      if (sort && !['asc', 'desc'].includes(sort)) {
        throw new Error('Sort must be either "asc" or "desc"');
      }

      if (sortBy && !['marketCapInUsd', 'liquidityInUsd', 'priceInUsd', 'holderCount', 'h24VolumeInUsd', 'h24Transactions', 'tokenCreatedAt'].includes(sortBy)) {
        throw new Error(`Invalid sortBy field: ${sortBy}`);
      }

      // Build search parameters
      const searchParams: any = {
        chains: [chain as SupportedChain],
        q: query,
      };

      // Add optional parameters
      if (limit) searchParams.limit = limit;
      if (sort) searchParams.sort = sort;
      if (sortBy) searchParams.sortBy = sortBy;
      if (protocols) searchParams.protocols = protocols;
      if (cursor) searchParams.cursor = cursor;

      // Call SDK search method with all parameters
      const searchResults = await dexClient.token.search(searchParams);

      // Limit results to maximum 10 items
      const limitedResults = Array.isArray(searchResults.data) ? searchResults.data.slice(0, 10) : searchResults.data;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain: chain,
              query: query,
              results: limitedResults,
              totalCount: searchResults.total,
              returnedCount: limitedResults.length,
              searchParams: {
                limit,
                sort,
                sortBy,
                protocols,
                cursor
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
              error: 'Failed to search tokens',
              chain: chain,
              query: query,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
}
