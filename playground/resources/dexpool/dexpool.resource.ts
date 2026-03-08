import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DexpoolResource {
  @ResourceTemplate({
    name: 'getDexpoolDetail',
    description: `Get detailed information about a specific DEX pool including tokens, protocol, TVL, and image.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/dexpool/v2/dexpools-chain-pooladdress-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/dexpool/detail/{chain}/{poolAddress}',
  })
  async getDexpoolDetail(req: Request, { uri, chain, poolAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const poolDetail = await client.dexpool.getDexpool(chain, poolAddress);

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
                error: 'Failed to get DEX pool detail',
                chain,
                poolAddress,
                message: error.message,
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
    name: 'getDexpoolSnapshots',
    description: `Get historical snapshots for a specific DEX pool.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/dexpool/v2/dexpools-chain-pooladdress-snapshots-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/dexpool/snapshots/{chain}/{poolAddress}',
  })
  async getDexpoolSnapshots(req: Request, { uri, chain, poolAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const params: Record<string, any> = {};
      const time = url.searchParams.get('time');
      if (time) params.time = Number(time);
      const cursor = url.searchParams.get('cursor');
      if (cursor) params.cursor = cursor;
      const limit = url.searchParams.get('limit');
      if (limit) params.limit = Number(limit);
      const direction = url.searchParams.get('direction');
      if (direction) params.direction = direction;

      const client = new ChainStreamClient(accessToken);
      const snapshots = await client.dexpool.getDexpoolSnapshots(
        chain,
        poolAddress,
        Object.keys(params).length > 0 ? params : undefined,
      );

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                poolAddress,
                snapshots,
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
                error: 'Failed to get DEX pool snapshots',
                chain,
                poolAddress,
                message: error.message,
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
