import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TransactionPrompt {
  @Prompt({
    name: 'getTransactionGuide',
    description: 'Provide a step-by-step guide for sending a transaction on a chain, including gas estimation and security tips.',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      to: z.string().describe('Recipient address'),
      value: z.string().describe('Amount to send (in wei/smallest unit)'),
    }),
  })
  getTransactionGuide({ chain, to, value }) {
    return {
      description: 'Transaction sending guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to send ${value} tokens to ${to} on ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll guide you through sending ${value} tokens to ${to} on ${chain}.

**Transaction Sending Guide:**

1. **Address Verification**: Double-check the recipient address (${to})
2. **Amount Confirmation**: Verify the amount (${value}) is correct
3. **Gas Estimation**: Ensure you have enough gas for the transaction
4. **Network Selection**: Confirm you're on the correct network (${chain})
5. **Transaction Review**: Always review transaction details before confirming

**Security Tips:**
- Never share your private key
- Use hardware wallets for large amounts
- Verify the recipient address multiple times
- Start with small test transactions
- Keep your wallet software updated

**Gas Optimization:**
- Use gas estimation tools
- Consider network congestion
- Set appropriate gas limits
- Monitor gas prices

Let me help you send this transaction safely using the sendTransaction tool.`,
          },
        },
      ],
    };
  }
}
