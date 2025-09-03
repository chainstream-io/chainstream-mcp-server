import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported sort fields
type SortByField = 'marketCapInUsd' | 'liquidityInUsd' | 'priceInUsd' | 'holderCount' | 'h24VolumeInUsd' | 'h24Transactions' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class TokenResource {
  @ResourceTemplate({
    name: 'getToken',
    description: `Get token information by chain and address.

🔐 **Authentication Required**: See playground/resources/README.md for ChainStream API authentication details.

**Supported Chains**: 
- sol (Solana)
- base (Base)
- bsc (Binance Smart Chain)
- polygon (Polygon)
- arbitrum (Arbitrum)
- optimism (Optimism)
- avalanche (Avalanche)
- ethereum (Ethereum)
- zksync (zkSync)
- sui (Sui)

**Chain Aliases**: You can also use these alternative names:
- solana → sol
- binance → bsc
- matic → polygon
- arb → arbitrum
- op → optimism
- avax → avalanche
- eth → ethereum

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1-token-search`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/{chain}/{tokenAddress}',
  })
  async getToken(req: Request, { uri, chain, tokenAddress }) {
    try {
      // Get accessToken from request headers
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];

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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
            text: JSON.stringify({
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

  @ResourceTemplate({
    name: 'searchTokens',
    description: `Search tokens by chain and query with advanced filters.

🔐 **Authentication Required**: See playground/resources/README.md for ChainStream API authentication details.

**Supported Chains**: 
- sol (Solana)
- base (Base)
- bsc (Binance Smart Chain)
- polygon (Polygon)
- arbitrum (Arbitrum)
- optimism (Optimism)
- avalanche (Avalanche)
- ethereum (Ethereum)
- zksync (zkSync)
- sui (Sui)

**Chain Aliases**: You can also use these alternative names:
- solana → sol
- binance → bsc
- matic → polygon
- arb → arbitrum
- op → optimism
- avax → avalanche
- eth → ethereum

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1-token-search`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/search/{chain}/{query}',
  })
  async searchTokens(req: Request, { uri, chain, query }) {
    try {
      // Get accessToken from request headers
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];

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

      // Parse query parameters from URL
      const url = new URL(uri);
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam) : undefined;
      const sortParam = url.searchParams.get('sort');
      const sort = sortParam as 'asc' | 'desc' | undefined;
      const sortByParam = url.searchParams.get('sortBy');
      const sortBy = sortByParam as SortByField | undefined;
      const protocolsParam = url.searchParams.get('protocols');
      const protocols = protocolsParam ? protocolsParam.split(',') : undefined;
      const cursor = url.searchParams.get('cursor') || undefined;

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
        q: decodeURIComponent(query), // Decode URL encoded query parameter
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
        contents: [
          {
            uri: uri, // Required by MCP protocol
            mimeType: 'application/json',
            text: JSON.stringify({
              chain: chain,
              query: decodeURIComponent(query),
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
        contents: [
          {
            uri: uri, // Required by MCP protocol
            mimeType: 'application/json',
            text: JSON.stringify({
              error: 'Failed to search tokens',
              chain: chain,
              query: decodeURIComponent(query),
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
}
