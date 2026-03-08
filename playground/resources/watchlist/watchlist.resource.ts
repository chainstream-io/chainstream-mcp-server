import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WatchlistResource {
  @ResourceTemplate({
    name: 'watchlistAdd',
    description: `Add a wallet address to the watchlist. Only addresses in the watchlist have PnL data available.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/watchlist/v2/watchlist-chain-walletaddress-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/watchlist/add/{chain}/{walletAddress}',
  })
  async watchlistAdd(req: Request, { uri, chain, walletAddress }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.watchlist.watchlistAdd(chain, walletAddress);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, walletAddress, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to add to watchlist', message: error.message }, null, 2) }],
      };
    }
  }
}
