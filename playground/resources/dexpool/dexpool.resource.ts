import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported sort fields
type SortByField = 'marketCapInUsd' | 'liquidityInUsd' | 'priceInUsd' | 'holderCount' | 'h24VolumeInUsd' | 'h24Transactions' | 'tokenCreatedAt';

type SortByFields = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class DexpoolResource {
    @ResourceTemplate({
        name: 'getDexpoolDetail',
        description: `Get detailed information about a specific DEX pool including tokens, protocol, TVL, and image.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/dexpool/v1/dexpools-chain-pooladdress-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/dexpool/detail/{chain}/{poolAddress}',
      })
      async getDexpoolDetail(req: Request, { uri, chain, poolAddress }) {
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
      
          const poolDetail = await dexClient.dexpool.getDexpool({
            chain: chain as SupportedChain,
            poolAddress,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    poolAddress,
                    poolDetail,
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
                    error: 'Failed to get DEX pool detail',
                    chain,
                    poolAddress,
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