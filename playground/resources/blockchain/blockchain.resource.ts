import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class BlockchainResource {
  @ResourceTemplate({
    name: 'getBlockchainList',
    description: `Get list of supported blockchains including symbol, name, explorer URL, and chain ID.
        
        🔐 Authentication Required
        
        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/blockchain/v2/blockchain-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/blockchain/list',
  })
  async getBlockchainList(req: Request, { uri }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const blockchains = await client.blockchain.getSupportedBlockchains();

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
                error: 'Failed to get blockchain list',
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
    name: 'getBlockchainLatestBlock',
    description: `Get the latest block information for a specific blockchain including block hash and last valid block height.
        
        🔐 Authentication Required
        
        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/blockchain/v2/blockchain-chain-latest_block-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/blockchain/latest_block/{chain}',
  })
  async getBlockchainLatestBlock(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const latestBlock = await client.blockchain.getLatestBlock(chain);

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
                error: 'Failed to get latest block information',
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
