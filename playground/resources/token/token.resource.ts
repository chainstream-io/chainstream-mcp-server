import {
  ChainStreamClient,
  PageDirection,
  Resolution,
  SearchSortBy,
  SortDirection,
  TokenField,
  TokenListSortField,
  TokenTraderTag,
} from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TokenResource {
  @ResourceTemplate({
    name: 'getToken',
    description: `Get token information by chain and address.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/{chain}/{tokenAddress}',
  })
  async getToken(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const tokenInfo = await client.token.getToken(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, tokenInfo, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokens',
    description: `Get details of multiple tokens including market data, stats, and filters.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-multi-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/multi/{chain}?tokenAddresses={tokenAddresses}&sortBy={sortBy}&sortDirection={sortDirection}',
  })
  async getTokens(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const tokenAddresses = url.searchParams.get('tokenAddresses') ?? '';
      const sortBy = (url.searchParams.get('sortBy') || undefined) as TokenField | undefined;
      const sortDirection = (url.searchParams.get('sortDirection') || undefined) as SortDirection | undefined;
      const filterBy = url.searchParams.get('filterBy') || undefined;

      const client = new ChainStreamClient(accessToken);
      const tokensInfo = await client.token.getTokens(chain, {
        tokenAddresses,
        sortBy,
        sortDirection,
        filterBy,
      });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddresses, sortBy, sortDirection, filterBy, tokensInfo, count: tokensInfo?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get multiple token details', chain, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'searchTokens',
    description: `Search tokens by chain and query with advanced filters.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-search-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/search/{chain}/{query}',
  })
  async searchTokens(req: Request, { uri, chain, query }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam) : undefined;
      const sort = (url.searchParams.get('sort') || undefined) as SortDirection | undefined;
      const sortBy = (url.searchParams.get('sortBy') || undefined) as SearchSortBy | undefined;
      const protocolsParam = url.searchParams.get('protocols');
      const protocols = protocolsParam ? protocolsParam.split(',') : undefined;
      const cursor = url.searchParams.get('cursor') || undefined;

      const client = new ChainStreamClient(accessToken);
      const searchResults = await client.token.search({
        chains: [chain],
        q: decodeURIComponent(query),
        limit,
        sort,
        sortBy,
        protocols,
        cursor,
      });

      const limitedResults = Array.isArray(searchResults.data)
        ? searchResults.data.slice(0, 10)
        : searchResults.data;

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                query: decodeURIComponent(query),
                results: limitedResults,
                returnedCount: limitedResults.length,
                hasNext: searchResults.hasNext,
                countsByProtocols: searchResults.countsByProtocols,
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
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { error: 'Failed to search tokens', chain, query: decodeURIComponent(query), message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenMetadata',
    description: `Get detailed metadata of a token by chain and address.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-metadata-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/metadata/{chain}/{tokenAddress}',
  })
  async getTokenMetadata(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const metadata = await client.token.getMetadata(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, metadata, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token metadata', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokensMetadata',
    description: `Get metadata for multiple tokens by chain and addresses.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-metadata-multi-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/metadata/multi/{chain}?tokenAddresses={tokenAddresses}',
  })
  async getTokensMetadata(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const tokenAddresses = url.searchParams.get('tokenAddresses');
      if (!tokenAddresses) {
        throw new Error('tokenAddresses is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const metadataMap = await client.token.getMetadataMulti(chain, { tokenAddresses });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddresses, metadata: metadataMap, count: Object.keys(metadataMap || {}).length, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get multiple token metadata', chain, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenLiquidityPools',
    description: `Get all liquidity pools containing the specified token.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-pools-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/pools/{chain}/{tokenAddress}',
  })
  async getTokenLiquidityPools(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const pools = await client.token.getPools(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, pools, poolCount: Array.isArray(pools) ? pools.length : 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token liquidity pools', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenStats',
    description: `Get token statistics across multiple timeframes including price, volume, trades, and trader activity.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-stats-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/stats/{chain}/{tokenAddress}',
  })
  async getTokenStats(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const stats = await client.token.getStats(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, stats, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token statistics', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokensStats',
    description: `Get statistics for multiple tokens across multiple timeframes.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-stats-multi-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/stats/multi/{chain}?tokenAddresses={tokenAddresses}',
  })
  async getTokensStats(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const tokenAddresses = url.searchParams.get('tokenAddresses');
      if (!tokenAddresses) {
        throw new Error('tokenAddresses is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const statsMap = await client.token.getStatsMulti(chain, { tokenAddresses });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddresses, stats: statsMap, count: Object.keys(statsMap || {}).length, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get multiple token statistics', chain, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenHolders',
    description: `Get holders of a token including wallet address, amount, USD value, and percentage.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-holders-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/holders/{chain}/{tokenAddress}',
  })
  async getTokenHolders(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const holders = await client.token.getHolders(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, holders, holderCount: holders?.data?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token holders', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenHoldersMulti',
    description: `Get holders information for multiple wallet addresses of a token.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-holders-multi-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/holders/multi/{chain}/{tokenAddress}?walletAddresses={walletAddresses}',
  })
  async getTokenHoldersMulti(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const walletAddresses = url.searchParams.get('walletAddresses');
      if (!walletAddresses) {
        throw new Error('walletAddresses is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const holders = await client.token.getHoldersMulti(chain, tokenAddress, { walletAddresses });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, walletAddresses, holders, count: holders?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get holders information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenCandles',
    description: `Get token price candles including OHLC data and volume.

🔐 Authentication Required

**Query Parameters**: resolution (1s, 15s, 30s, 1m, 5m, 15m, 1h, 4h, 12h, 1d), from/to (Unix timestamps in ms), limit (max 1000)

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-candles-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/candles/{chain}/{tokenAddress}?resolution={resolution}&from={from}&to={to}&limit={limit}',
  })
  async getTokenCandles(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const resolution = url.searchParams.get('resolution') as Resolution;
      const fromParam = url.searchParams.get('from');
      const toParam = url.searchParams.get('to');
      const limitParam = url.searchParams.get('limit');
      const from = fromParam !== null ? parseInt(fromParam, 10) : undefined;
      const to = toParam !== null ? parseInt(toParam, 10) : undefined;
      const limit = limitParam !== null ? parseInt(limitParam, 10) : undefined;

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getCandles(chain, tokenAddress, { resolution, from, to, limit });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, resolution, from, to, limit, candles, candleCount: Array.isArray(candles) ? candles.length : 0, sample: candles?.[0], timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token price candles', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenTopHolders',
    description: `Get the top 20 holders of a token including wallet address, amount, USD value, and percentage.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-topholders-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/topHolders/{chain}/{tokenAddress}',
  })
  async getTokenTopHolders(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const topHolders = await client.token.getTopHolders(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, topHolders, holderCount: topHolders?.data?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token top holders', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-marketdata-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/marketData/{chain}/{tokenAddress}',
  })
  async getTokenMarketData(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const marketData = await client.token.getMarketData(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, marketData, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token market data', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokensMarketData',
    description: `Get market data for multiple tokens including supply, market cap, holdings ratios, holders, price, and TVL.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-marketdata-multi-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/marketData/multi/{chain}?tokenAddresses={tokenAddresses}',
  })
  async getTokensMarketData(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const tokenAddresses = url.searchParams.get('tokenAddresses');
      if (!tokenAddresses) {
        throw new Error('tokenAddresses is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const marketDataMap = await client.token.getMarketDataMulti(chain, { tokenAddresses });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddresses, marketData: marketDataMap, count: Object.keys(marketDataMap || {}).length, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get multiple token market data', chain, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-prices-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/prices/{chain}/{tokenAddress}?cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getTokenPrices(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const prices = await client.token.getPrices(chain, tokenAddress, { cursor, limit, direction });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, cursor, limit, direction, prices, count: prices?.data?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token prices', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**Query Parameters**: timestamp (Unix epoch in seconds)

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-price-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/price/{chain}/{tokenAddress}?timestamp={timestamp}',
  })
  async getTokenPriceByTime(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const timestamp = url.searchParams.get('timestamp');
      if (!timestamp) {
        throw new Error('Timestamp is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const price = await client.token.getPriceByTime(chain, tokenAddress, { timestamp: parseInt(timestamp) });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, timestamp, price, timestampISO: new Date(parseInt(timestamp) * 1000).toISOString(), queryTime: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token price by time', chain, tokenAddress, message: error.message, queryTime: new Date().toISOString() },
              null,
              2,
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

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-creation-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/creation/{chain}/{tokenAddress}',
  })
  async getTokenCreation(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const creation = await client.token.getCreation(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, creation, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token creation information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**Query Parameters**: cursor, limit (1-100), direction (next|prev), type (all|mint|burn)

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-mintandburn-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/mintAndBurn/{chain}/{tokenAddress}?cursor={cursor}&limit={limit}&direction={direction}&type={type}',
  })
  async getTokenMintBurn(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;
      const typeParam = url.searchParams.get('type');
      const type = typeParam === 'mint' || typeParam === 'burn' || typeParam === 'all' ? typeParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const mintBurn = await client.token.getMintAndBurn(chain, tokenAddress, { cursor, limit, direction, type: type ?? 'all' });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, cursor, limit, direction, type, mintBurn, count: mintBurn?.data?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token mint and burn information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-security-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/security/{chain}/{tokenAddress}',
  })
  async getTokenSecurity(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const security = await client.token.getSecurity(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, security, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token security information', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
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

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-list-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/list/{chain}?cursor={cursor}&limit={limit}&direction={direction}&sort={sort}&sortBy={sortBy}',
  })
  async getTokenListFiltered(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') || undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;
      const sort = (url.searchParams.get('sort') || undefined) as SortDirection | undefined;
      const sortBy = (url.searchParams.get('sortBy') || undefined) as TokenListSortField | undefined;

      const client = new ChainStreamClient(accessToken);
      const list = await client.token.listToken(chain, { cursor, limit, direction, sort, sortBy });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, filters: { cursor, limit, direction, sort, sortBy }, list, count: list?.data?.length ?? 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get filtered token list', chain, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getDevTokens',
    description: `Get all tokens created by a developer address.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-dev-devaddress-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/dev/{chain}/{devAddress}?cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getDevTokens(req: Request, { uri, chain, devAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const devTokens = await client.token.getDevTokens(chain, devAddress, { cursor, limit, direction });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, devAddress, devTokens, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get developer tokens', chain, devAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenTraders',
    description: `Get traders by tag for a token (fresh, sandwich, bundle, sniper, dev, pro, insider).

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-traders-tag-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/traders/{chain}/{tokenAddress}/{tag}?cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getTokenTraders(req: Request, { uri, chain, tokenAddress, tag }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const traders = await client.token.getTokenTraders(chain, tokenAddress, tag, { cursor, limit, direction });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, tag, traders, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token traders', chain, tokenAddress, tag, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenLiquiditySnapshots',
    description: `Get token liquidity snapshots over time.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-liquidity-snapshots-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/liquidity-snapshots/{chain}/{tokenAddress}?time={time}&cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getTokenLiquiditySnapshots(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const timeParam = url.searchParams.get('time');
      const time = timeParam ? parseInt(timeParam) : undefined;
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const snapshots = await client.token.getTokenLiquiditySnapshots(chain, tokenAddress, { time, cursor, limit, direction });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, snapshots, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token liquidity snapshots', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenTransfers',
    description: `Get token transfer history.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-transfers-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/transfers/{chain}/{tokenAddress}?cursor={cursor}&limit={limit}&direction={direction}',
  })
  async getTokenTransfers(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const cursor = url.searchParams.get('cursor') ?? undefined;
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam !== null ? parseInt(limitParam) : undefined;
      const directionParam = url.searchParams.get('direction');
      const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

      const client = new ChainStreamClient(accessToken);
      const transfers = await client.token.getTokenTransfers(chain, tokenAddress, { cursor, limit, direction });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, transfers, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token transfers', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTokenTransferTotal',
    description: `Get token transfer total count.

🔐 Authentication Required

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-tokenaddress-transfer-total-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/token/transfer-total/{chain}/{tokenAddress}',
  })
  async getTokenTransferTotal(req: Request, { uri, chain, tokenAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const transferTotal = await client.token.getTokenTransferTotal(chain, tokenAddress);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, tokenAddress, transferTotal, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get token transfer total', chain, tokenAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getPairCandles',
    description: `Get pair candlestick data (OHLC) for a token pair.

🔐 Authentication Required

**Query Parameters**: resolution (1s, 15s, 30s, 1m, 5m, 15m, 1h, 4h, 12h, 1d)

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-pair-candles-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/pair-candles/{chain}/{pair}?resolution={resolution}',
  })
  async getPairCandles(req: Request, { uri, chain, pair }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const resolution = url.searchParams.get('resolution') as Resolution;

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getPairCandles(chain, pair, { resolution });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, pair, resolution, candles, candleCount: Array.isArray(candles) ? candles.length : 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get pair candles', chain, pair, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getPoolCandles',
    description: `Get pool candlestick data (OHLC) for a specific liquidity pool.

🔐 Authentication Required

**Query Parameters**: resolution (1s, 15s, 30s, 1m, 5m, 15m, 1h, 4h, 12h, 1d)

**API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/token/v2/token-chain-pooladdress-pool-candles-get`,
    mimeType: 'application/json',
    uriTemplate:
      'mcp://dex/token/pool-candles/{chain}/{poolAddress}?resolution={resolution}',
  })
  async getPoolCandles(req: Request, { uri, chain, poolAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const resolution = url.searchParams.get('resolution') as Resolution;

      const client = new ChainStreamClient(accessToken);
      const candles = await client.token.getPoolCandles(chain, poolAddress, { resolution });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              { chain, poolAddress, resolution, candles, candleCount: Array.isArray(candles) ? candles.length : 0, timestamp: new Date().toISOString() },
              null,
              2,
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
              { error: 'Failed to get pool candles', chain, poolAddress, message: error.message, timestamp: new Date().toISOString() },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}
