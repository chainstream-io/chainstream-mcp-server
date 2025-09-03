import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported duration types
type Duration = '1m' | '5m' | '1h' | '4h' | '24h';

// Define supported sort fields for ranking
type RankingSortByField = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class RankingResource {
  @ResourceTemplate({
    name: 'getHotTokens',
    description: `Get hot tokens ranking by chain and duration with advanced filters.

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

**Supported Durations**:
- 1m (1 minute)
- 5m (5 minutes) 
- 1h (1 hour)
- 4h (4 hours)
- 24h (24 hours)

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v1-ranking-chain-hottokens-duration`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/hot-tokens/{chain}/{duration}',
  })
  async getHotTokens(req: Request, { uri, chain, duration }) {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];
    try {
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

      // Parse query parameters from URL
      const url = new URL(uri);
      const sortByParam = url.searchParams.get('sortBy');
      const sortBy = sortByParam as RankingSortByField | undefined;
      const sortDirectionParam = url.searchParams.get('sortDirection');
      const sortDirection = sortDirectionParam as 'ASC' | 'DESC' | undefined;
      const filterByParam = url.searchParams.get('filterBy');
      const filterBy = filterByParam ? JSON.parse(filterByParam) : undefined;

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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
            text: JSON.stringify({
              chain: chain,
              duration: duration,
              hotTokens: limitedHotTokens,
              totalCount: Array.isArray(hotTokens) ? hotTokens.length : 1,
              returnedCount: Array.isArray(hotTokens) ? Math.min(hotTokens.length, 10) : 1,
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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
            text: JSON.stringify({
              error: 'Failed to get hot tokens',
              chain: chain,
              duration: duration,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
}
