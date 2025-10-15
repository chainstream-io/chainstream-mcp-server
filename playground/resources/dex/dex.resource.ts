import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported DEX types
type SupportedDex = 'jupiter' | 'kyberswap' | 'raydium' | 'pumpfun' | 'moonshot' | 'candy' | 'launchpad';

@Injectable({ scope: Scope.REQUEST })
export class DexResource {

  @ResourceTemplate({
    name: 'getDexList',
    description: `Get list of DEXs on specified blockchains including program address, protocol family, logo, and pagination metadata.
  
  🔐 Authentication Required
  
  **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/dex/v1/dex-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/list?chains={chains}&limit={limit}&dexProgram={dexProgram}',
  })
  async getDexList(req: Request, { uri }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }
  
      const url = new URL(uri);
      const chains = url.searchParams.getAll('chains');
      const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
      const dexProgram = url.searchParams.get('dexProgram') || undefined;
  
      const dexClient = new DexClient(accessToken);
  
      const dexList = await dexClient.dex.listDex({
        chains,
        limit,
        dexProgram,
      });
  
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chains,
                limit,
                dexProgram,
                result: dexList,
                count: dexList?.data?.length ?? 0,
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
                error: 'Failed to get DEX list',
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
