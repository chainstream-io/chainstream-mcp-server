import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

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

  @ResourceTemplate({
    name: 'getTokenMetadata',
    description: `Get detailed metadata of a token by chain and address.
  
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
  
  **Chain Aliases**: 
  - solana → sol
  - binance → bsc
  - matic → polygon
  - arb → arbitrum
  - op → optimism
  - avax → avalanche
  - eth → ethereum
  
  **API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-metadata-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/metadata/{chain}/{tokenAddress}',
  })
  async getTokenMetadata(req: Request, { uri, chain, tokenAddress }) {
    try {
      // Get accessToken from request headers
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }
  
      // Validate chain parameter
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);
  
      // Call SDK metadata method
      const metadata = await dexClient.token.getMetadata({
        chain: chain as SupportedChain,
        tokenAddress: tokenAddress,
      });
  
      return {
        contents: [
          {
            uri: uri, // Required by MCP protocol
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri: uri, // Required by MCP protocol
            mimeType: 'application/json',
            text: JSON.stringify({
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

  @ResourceTemplate({
    name: 'getTokenLiquidityPools',
    description: `Get all liquidity pools containing the specified token.
  
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
  
  **Chain Aliases**: 
  - solana → sol
  - binance → bsc
  - matic → polygon
  - arb → arbitrum
  - op → optimism
  - avax → avalanche
  - eth → ethereum
  
  **API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-pools-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/pools/{chain}/{tokenAddress}',
  })
  async getTokenLiquidityPools(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const pools = await dexClient.token.getPools({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
  
  @ResourceTemplate({
    name: 'getTokenStats',
    description: `Get token statistics across multiple timeframes including price, volume, trades, and trader activity.
  
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
  
  **Chain Aliases**: 
  - solana → sol
  - binance → bsc
  - matic → polygon
  - arb → arbitrum
  - op → optimism
  - avax → avalanche
  - eth → ethereum
  
  **API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-stats-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/stats/{chain}/{tokenAddress}',
  })
  async getTokenStats(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const stats = await dexClient.token.getStats({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
  
  @ResourceTemplate({
    name: 'getTokenHolders',
    description: `Get holders of a token including wallet address, amount, USD value, and percentage.
  
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
  
  **Chain Aliases**: 
  - solana → sol
  - binance → bsc
  - matic → polygon
  - arb → arbitrum
  - op → optimism
  - avax → avalanche
  - eth → ethereum
  
  **API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-holders-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/holders/{chain}/{tokenAddress}',
  })
  async getTokenHolders(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }
  
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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

  @ResourceTemplate({
    name: 'getTokenCandles',
    description: `Get token price candles including OHLC data and volume.
  
  🔐 Authentication Required
  
  **Query Parameters**:
  - resolution: 1s, 15s, 30s, 1m, 5m, 15m, 1h, 4h, 12h, 1d
  - from/to: Unix timestamps in ms
  - limit: max 1000
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1-token-candles`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/candles/{chain}/{tokenAddress}?resolution={resolution}&from={from}&to={to}&limit={limit}',
  })
  async getTokenCandles(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const url = new URL(uri);
      const resolution = url.searchParams.get('resolution') as any;
      const fromParam = url.searchParams.get('from');
      const toParam = url.searchParams.get('to');
      const limitParam = url.searchParams.get('limit');
      const from = fromParam !== null ? parseInt(fromParam, 10) : undefined;
      const to = toParam !== null ? parseInt(toParam, 10) : undefined;
      const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: 'Failed to get token price candles',
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
  
  @ResourceTemplate({
    name: 'getTokenTopHolders',
    description: `Get the top 20 holders of a token including wallet address, amount, USD value, and percentage.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-topholders-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/topHolders/{chain}/{tokenAddress}',
  })
  async getTokenTopHolders(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const topHolders = await dexClient.token.getTopHolders({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                topHolders,
                holderCount: topHolders?.total ?? 0,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token top holders',
                chain,
                tokenAddress,
                message: error.message,
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
  

  @ResourceTemplate({
    name: 'getTokenMarketData',
    description: `Get the market data of a token including supply, market cap, holdings ratios, holders, price, TVL, and dev team info.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-marketdata-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/marketData/{chain}/{tokenAddress}',
  })
  async getTokenMarketData(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const marketData = await dexClient.token.getMarketData({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                marketData,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token market data',
                chain,
                tokenAddress,
                message: error.message,
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
  

  @ResourceTemplate({
    name: 'getTokenPrices',
    description: `Get historical price data for a token including USD price, native price, and timestamp.
  
  🔐 Authentication Required
  
  **Query Parameters**:
  - cursor: pagination cursor
  - limit: number of results per page (1-100)
  - direction: next | prev
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-prices-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/prices/{chain}/{tokenAddress}?cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getTokenPrices(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null && limitParam !== undefined ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = (directionParam === 'next' || directionParam === 'prev') ? directionParam : undefined;

      const dexClient = new DexClient(accessToken);
      const prices = await dexClient.token.getPrices({
        chain: chain as SupportedChain,
        tokenAddress,
        cursor,
        limit,
        direction,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                cursor,
                limit,
                direction,
                prices,
                count: prices?.data?.length ?? 0,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token prices',
                chain,
                tokenAddress,
                message: error.message,
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
  

  @ResourceTemplate({
    name: 'getTokenPriceByTime',
    description: `Get token price at a specific timestamp including USD price, native price, and timestamp.
  
  🔐 Authentication Required
  
  **Query Parameters**:
  - timestamp: Unix epoch in seconds
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-price-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/price/{chain}/{tokenAddress}?timestamp={timestamp}',
  })
  async getTokenPriceByTime(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const url = new URL(uri);
      const timestamp = url.searchParams.get('timestamp');
      if (!timestamp) {
        throw new Error('Timestamp is required.');
      }
  
      const dexClient = new DexClient(accessToken);
  
      const price = await dexClient.token.getPriceByTime({
        chain: chain as SupportedChain,
        tokenAddress,
        timestamp: parseInt(timestamp),
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                timestamp,
                price,
                timestampISO: new Date(parseInt(timestamp) * 1000).toISOString(),
                queryTime: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token price by time',
                chain,
                tokenAddress,
                message: error.message,
                queryTime: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
 
  
  @ResourceTemplate({
    name: 'getTokenCreation',
    description: `Get token creation information including block details, timestamp, transaction signature, and type.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-creation-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/creation/{chain}/{tokenAddress}',
  })
  async getTokenCreation(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const creation = await dexClient.token.getCreation({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                creation,
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
        contents: [
          {
            uri,  
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token creation information',
                chain,
                tokenAddress,
                message: error.message,
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
  
  @ResourceTemplate({
    name: 'getTokenMintBurn',
    description: `Get mint and burn information for a token including block details, transaction signature, and type.
  
  🔐 Authentication Required
  
  **Query Parameters**:
  - cursor: pagination cursor
  - limit: number of results per page (1-100)
  - direction: next | prev
  - type: all | mint | burn
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-mintandburn-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/mintAndBurn/{chain}/{tokenAddress}?cursor={cursor}&limit={limit}&direction={direction}&type={type}',
  })
  async getTokenMintBurn(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;
      const typeParam = url.searchParams.get('type');
      const type = typeParam === 'mint' || typeParam === 'burn' || typeParam === 'all' ? typeParam : undefined;

      const dexClient = new DexClient(accessToken);
  
      const mintBurn = await dexClient.token.getMintAndBurn({
        chain: chain as SupportedChain,
        tokenAddress,
        cursor,
        limit,
        direction,
        type: (type as 'mint' | 'burn' | 'all') ?? 'all',
      });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                cursor,
                limit,
                direction,
                type,
                mintBurn,
                count: mintBurn?.data?.length ?? 0,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token mint and burn information',
                chain,
                tokenAddress,
                message: error.message,
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
  
  @ResourceTemplate({
    name: 'getTokenSecurity',
    description: `Get token security information including authorities, permissions, holder distribution, metadata, and DEX liquidity.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-tokenaddress-security-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/security/{chain}/{tokenAddress}',
  })
  async getTokenSecurity(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const dexClient = new DexClient(accessToken);
  
      const security = await dexClient.token.getSecurity({
        chain: chain as SupportedChain,
        tokenAddress,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                tokenAddress,
                security,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get token security information',
                chain,
                tokenAddress,
                message: error.message,
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
  
  @ResourceTemplate({
    name: 'getTokenListFiltered',
    description: `Get filtered token list with range conditions, supporting pagination, sorting, and min/max filters.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/token/v1/token-chain-list-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/list/{chain}?cursor={cursor}&limit={limit}&direction={direction}&sort={sort}&sortBy={sortBy}',
  })
  async getTokenListFiltered(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const supportedChains: SupportedChain[] = [
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'
      ];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}`);
      }
  
      const url = new URL(uri);
      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
  
      const dexClient = new DexClient(accessToken);
  
      const list = await dexClient.token.getTokenList({
        chain: chain as SupportedChain,
        ...query,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                filters: query,
                list,
                count: list?.data?.length ?? 0,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get filtered token list',
                chain,
                message: error.message,
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
