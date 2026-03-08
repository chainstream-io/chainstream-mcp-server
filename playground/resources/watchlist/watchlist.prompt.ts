import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WatchlistPrompt {
  @Prompt({
    name: 'watchlist-guide',
    description: 'Guide for using the watchlist feature to enable PnL tracking for wallet addresses.',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
      walletAddress: z.string().describe('Wallet address'),
    }),
  })
  getWatchlistGuide({ chain, walletAddress }) {
    return {
      description: 'Watchlist usage guide',
      messages: [
        { role: 'user', content: { type: 'text', text: `I want to track PnL for wallet ${walletAddress} on ${chain}.` } },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To track PnL for a wallet, you must first add it to the watchlist:

1. **Add to Watchlist**: Use the watchlistAdd tool with chain "${chain}" and wallet address "${walletAddress}"
2. **Wait for Processing**: PnL data calculation starts after the address is added
3. **Query PnL**: Once processed, use wallet PnL tools (getPnl, getPnlDetails, getPnlByToken) to retrieve profit/loss data

Note: Only addresses in the watchlist have PnL data available. The calculation may take a few minutes after adding.`,
          },
        },
      ],
    };
  }
}
