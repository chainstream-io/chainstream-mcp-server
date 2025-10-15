import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported sort fields
type SortByField = 'marketCapInUsd' | 'liquidityInUsd' | 'priceInUsd' | 'holderCount' | 'h24VolumeInUsd' | 'h24Transactions' | 'tokenCreatedAt';

type SortByFields = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class TradeResource {

    @ResourceTemplate({
        name: 'getTradeList',
        description: `Get a list of transactions on a specific chain with filters and pagination.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/trade/v1/trade-chain-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/trade/list/{chain}?tokenAddress={tokenAddress}&walletAddress={walletAddress}&poolAddress={poolAddress}&type={type}&beforeTimestamp={beforeTimestamp}&afterTimestamp={afterTimestamp}&beforeBlockHeight={beforeBlockHeight}&afterBlockHeight={afterBlockHeight}&cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getTradeList(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const queryParams = {
            tokenAddress: url.searchParams.get('tokenAddress') || undefined,
            walletAddress: url.searchParams.get('walletAddress') || undefined,
            poolAddress: url.searchParams.get('poolAddress') || undefined,
            type: url.searchParams.get('type') || undefined,
            beforeTimestamp: url.searchParams.get('beforeTimestamp') ? Number(url.searchParams.get('beforeTimestamp')) : undefined,
            afterTimestamp: url.searchParams.get('afterTimestamp') ? Number(url.searchParams.get('afterTimestamp')) : undefined,
            beforeBlockHeight: url.searchParams.get('beforeBlockHeight') ? Number(url.searchParams.get('beforeBlockHeight')) : undefined,
            afterBlockHeight: url.searchParams.get('afterBlockHeight') ? Number(url.searchParams.get('afterBlockHeight')) : undefined,
            cursor: url.searchParams.get('cursor') || undefined,
            limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined,
            direction: url.searchParams.get('direction') || undefined,
          };

          const dexClient = new DexClient(accessToken);

          // Ensure direction param is only 'next' | 'prev' | undefined
          let directionParam = queryParams.direction;
          if (directionParam !== 'next' && directionParam !== 'prev') {
            directionParam = undefined;
          }

          const result = await dexClient.trade.getTrades({
            ...queryParams,
            direction: directionParam,
            chain: chain as SupportedChain,
          });

          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    ...queryParams,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get trade list',
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
      
      @ResourceTemplate({
        name: 'getTradeTopTraders',
        description: `Get top traders for a specific token on a chain.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/trade/v1/trade-chain-top-traders-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/trade/topTraders/{chain}?tokenAddress={tokenAddress}&timeFrame={timeFrame}&sortType={sortType}&sortBy={sortBy}&cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getTradeTopTraders(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const tokenAddress = url.searchParams.get('tokenAddress');
          if (!tokenAddress) {
            throw new Error('tokenAddress is required.');
          }
      
          // ✅ 设置默认值，确保类型安全
          const timeFrame = url.searchParams.get('timeFrame') || '30m';
          const sortType = url.searchParams.get('sortType') || 'desc';
          const sortBy = url.searchParams.get('sortBy') || 'volume';
          const cursor = url.searchParams.get('cursor') || '';
          const direction = url.searchParams.get('direction') || 'next';
          const limit = url.searchParams.get('limit')
            ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 10)
            : 10;
      
          const dexClient = new DexClient(accessToken);
      
          const result = await dexClient.trade.getTopTraders(
            {
              chain: chain as SupportedChain,
              tokenAddress,
              timeFrame,
              sortType,
              sortBy,
              cursor,
              direction: direction as 'next' | 'prev' | undefined,
              limit,
            }
          );
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    tokenAddress,
                    timeFrame,
                    sortType,
                    sortBy,
                    cursor,
                    direction,
                    limit,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get top traders',
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
      
      @ResourceTemplate({
        name: 'getTradeGainersLosers',
        description: `Get top gainers and losers on a specific chain.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/trade/v1/trade-chain-gainers-losers-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/trade/gainers-losers/{chain}?type={type}&sortBy={sortBy}&sortType={sortType}&cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getTradeGainersLosers(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const queryParams = {
            type: url.searchParams.get('type') || '1W',
            sortBy: url.searchParams.get('sortBy') || 'PnL',
            sortType: url.searchParams.get('sortType') || 'desc',
            cursor: url.searchParams.get('cursor') || '',
            limit: url.searchParams.get('limit') ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 10) : 10,
            direction: url.searchParams.get('direction') || 'next',
          };

          const dexClient = new DexClient(accessToken);

          // Ensure 'direction' is typed correctly as "next" | "prev" | undefined
          const { direction, ...restQueryParams } = queryParams;
          const typedDirection = (direction === "next" || direction === "prev") ? direction : undefined;

          const result = await dexClient.trade.getGainersLosers({
            chain: chain as SupportedChain,
            ...restQueryParams,
            direction: typedDirection,
          });

          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    ...queryParams,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get gainers/losers',
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