import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WatchlistTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'watchlistAdd',
    description: 'Add a wallet address to the watchlist. Required before PnL data becomes available for the address.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g. sol, eth, bsc)'),
      walletAddress: z.string().describe('Wallet address to add to watchlist'),
    }),
    annotations: { title: 'Watchlist Add Address', destructiveHint: false, readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  })
  async watchlistAdd({ chain, walletAddress }) {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.watchlist.watchlistAdd(chain, walletAddress);
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, chain, walletAddress, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Failed to add to watchlist', message: error.message }, null, 2) }],
      };
    }
  }
}
