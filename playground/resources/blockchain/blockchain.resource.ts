import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported sort fields
type SortByField = 'marketCapInUsd' | 'liquidityInUsd' | 'priceInUsd' | 'holderCount' | 'h24VolumeInUsd' | 'h24Transactions' | 'tokenCreatedAt';

type SortByFields = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class BlockchainResource {

    @ResourceTemplate({
        name: 'getBlockchainList',
        description: `Get list of supported blockchains including symbol, name, explorer URL, and chain ID.
        
        🔐 Authentication Required
        
        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/blockchain/v1/blockchain-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/blockchain/list',
        })
        async getBlockchainList(req: Request, { uri }) {
        try {
            const accessToken = req.headers.get('Authorization')?.split(' ')[1];
            if (!accessToken) {
            throw new Error('Access token is required.');
            }
        
            const dexClient = new DexClient(accessToken);
        
            const blockchains = await dexClient.blockchain.getSupportedBlockchains();
        
            return {
            contents: [
                {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                    {
                    blockchains,
                    count: blockchains?.length ?? 0,
                    timestamp: new Date().toISOString(),
                    },
                    null,
                    2
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
                    error: 'Failed to get blockchain list',
                    message: (error as any).message,
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
        name: 'getBlockchainLatestBlock',
        description: `Get the latest block information for a specific blockchain including block hash and last valid block height.
        
        🔐 Authentication Required
        
        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/blockchain/v1/blockchain-chain-latest_block-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/blockchain/latest_block/{chain}',
        })
        async getBlockchainLatestBlock(req: Request, { uri, chain }) {
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
        
            const latestBlock = await dexClient.blockchain.getLatestBlock({
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
                    latestBlock,
                    timestamp: new Date().toISOString(),
                    },
                    null,
                    2
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
                    error: 'Failed to get latest block information',
                    chain,
                    message: (error as any).message,
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