import { ChainStreamClient, CreateTokenInputDex } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DefiResource {
  @ResourceTemplate({
    name: 'pumpfunCreate',
    description: `Create a new token on Pump.fun via the DEX create token API.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-create-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/defi/pumpfun/create/{chain}',
  })
  async pumpfunCreate(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.createToken(chain, {
        dex: CreateTokenInputDex.pumpfun,
        userAddress: '',
        name: '',
        symbol: '',
      });
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to create Pump.fun token', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'moonshotCreate',
    description: `Create a new token on Moonshot via the DEX create token API.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-create-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/defi/moonshot/create/{chain}',
  })
  async moonshotCreate(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.createToken(chain, {
        dex: CreateTokenInputDex.moonshot,
        userAddress: '',
        name: '',
        symbol: '',
      });
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to create Moonshot token', message: error.message }, null, 2) }],
      };
    }
  }
}
