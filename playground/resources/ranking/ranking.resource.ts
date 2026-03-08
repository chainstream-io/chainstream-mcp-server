import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class RankingResource {
  @ResourceTemplate({
    name: 'getHotTokens',
    description: `Get hot tokens ranking by chain and duration with advanced filters.

🔐 **Authentication Required**

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

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v2/ranking-chain-hottokens-duration`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/hot-tokens/{chain}/{duration}',
  })
  async getHotTokens(req: Request, { uri, chain, duration }) {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];
    try {
      if (!accessToken) {
        throw new Error(
          'Access token is required. Please provide a valid JWT token.',
        );
      }

      const client = new ChainStreamClient(accessToken);

      const url = new URL(uri);
      const sortByParam = url.searchParams.get('sortBy') || undefined;
      const sortDirectionParam =
        url.searchParams.get('sortDirection') || undefined;
      const filterByParam = url.searchParams.get('filterBy');
      const filterBy = filterByParam ? JSON.parse(filterByParam) : undefined;

      const params: any = {};
      if (sortByParam) params.sortBy = sortByParam;
      if (sortDirectionParam) params.sortDirection = sortDirectionParam;
      if (filterBy) params.filterBy = filterBy;

      const hotTokens = await client.ranking.getHotTokens(
        chain,
        duration,
        params,
      );

      const limitedHotTokens = Array.isArray(hotTokens)
        ? hotTokens.slice(0, 10)
        : hotTokens;

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                duration,
                hotTokens: limitedHotTokens,
                totalCount: Array.isArray(hotTokens) ? hotTokens.length : 1,
                returnedCount: Array.isArray(hotTokens)
                  ? Math.min(hotTokens.length, 10)
                  : 1,
                searchParams: {
                  sortBy: sortByParam,
                  sortDirection: sortDirectionParam,
                  filterBy,
                },
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
              {
                error: 'Failed to get hot tokens',
                chain,
                duration,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getRankingNewTokens',
    description: `Get the latest 100 tokens on a specific chain.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v2/ranking-chain-newTokens-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/newTokens/{chain}',
  })
  async getRankingNewTokens(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const result = await client.ranking.getNewTokens(chain);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                result,
                count: result?.length ?? 0,
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
              {
                error: 'Failed to get new token rankings',
                chain,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getRankingStocksTokens',
    description: `Get stock-related tokens on a specific chain.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v2/ranking-chain-stocks-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/stocks/{chain}',
  })
  async getRankingStocksTokens(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const result = await client.ranking.getStocksTokens(chain);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                result,
                count: result?.length ?? 0,
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
              {
                error: 'Failed to get stock token rankings',
                chain,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getRankingFinalStretchTokens',
    description: `Get finalStretch tokens on a specific chain.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v2/ranking-chain-finalStretch-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/finalStretch/{chain}',
  })
  async getRankingFinalStretchTokens(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const result = await client.ranking.getFinalStretchTokens(chain);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                result,
                count: result?.length ?? 0,
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
              {
                error: 'Failed to get finalStretch token rankings',
                chain,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getRankingMigratedTokens',
    description: `Get migrated tokens on a specific chain.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/ranking/v2/ranking-chain-migrated-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ranking/migrated/{chain}',
  })
  async getRankingMigratedTokens(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const result = await client.ranking.getMigratedTokens(chain);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                result,
                count: result?.length ?? 0,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error: unknown) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get migrated token rankings',
                chain,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}
