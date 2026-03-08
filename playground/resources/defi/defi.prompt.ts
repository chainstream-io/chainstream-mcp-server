import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DefiPrompt {
  @Prompt({
    name: 'defi-token-creation-guide',
    description: 'Guide for creating tokens on DeFi platforms like Pump.fun and Moonshot.',
    parameters: z.object({
      platform: z.enum(['pumpfun', 'moonshot']).describe('DeFi platform'),
    }),
  })
  getDefiTokenCreationGuide({ platform }) {
    const guides = {
      pumpfun: `To create a token on Pump.fun:
1. Prepare your token metadata (name, symbol, description, image)
2. If you have an image, upload it to IPFS first using the presign tool
3. Use the pumpfunCreateToken tool with chain "sol", name, symbol, creator address
4. The response will contain a serialized transaction to sign
5. Sign and submit the transaction using the sendTransaction tool`,
      moonshot: `To create a token on Moonshot:
1. Prepare your token metadata (name, symbol, description, image)
2. If you have an image, upload it to IPFS first using the presign tool
3. Use the moonshotCreateToken tool with chain "sol", name, symbol, creator address
4. The response will contain a serialized transaction to sign
5. Sign and submit the transaction using the sendTransaction tool`,
    };

    return {
      description: 'DeFi token creation guide',
      messages: [
        { role: 'user', content: { type: 'text', text: `How do I create a token on ${platform}?` } },
        { role: 'assistant', content: { type: 'text', text: guides[platform] } },
      ],
    };
  }
}
