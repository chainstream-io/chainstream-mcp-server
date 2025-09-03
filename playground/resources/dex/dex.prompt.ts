import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '../../../dist';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class DexPrompt {
  constructor() {}

  @Prompt({
    name: 'getRouteAnalysis',
    description: 'Analyze and explain the best trading route between two tokens, including gas costs, slippage, and alternative routes',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      fromToken: z.string().describe('Source token address or symbol'),
      toToken: z.string().describe('Destination token address or symbol'),
      amount: z.string().describe('Amount of tokens to swap'),
    }),
  })
  getRouteAnalysis({ chain, fromToken, toToken, amount }) {
    return {
      description: 'DEX route analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to analyze the best trading route from ${fromToken} to ${toToken} on ${chain} for ${amount} tokens.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll help you analyze the best trading route from ${fromToken} to ${toToken} on ${chain} for ${amount} tokens.

To get the optimal route, I'll use the DEX route finder tool which will:
1. Calculate the best path through available DEX protocols
2. Estimate gas costs and fees
3. Consider slippage tolerance
4. Provide alternative routes if available

Let me fetch this information for you using the getRoute tool.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'getSwapGuide',
    description: 'Provide a comprehensive guide for executing a token swap, including safety tips and best practices',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      fromToken: z.string().describe('Source token address or symbol'),
      toToken: z.string().describe('Destination token address or symbol'),
      amount: z.string().describe('Amount of tokens to swap'),
    }),
  })
  getSwapGuide({ chain, fromToken, toToken, amount }) {
    return {
      description: 'Token swap execution guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to execute a swap from ${fromToken} to ${toToken} on ${chain} for ${amount} tokens.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I'll guide you through executing a swap from ${fromToken} to ${toToken} on ${chain} for ${amount} tokens.

**Swap Execution Guide:**

1. **Route Analysis**: First, let's find the best trading route using the getRoute tool
2. **Slippage Protection**: Set appropriate slippage tolerance (recommended: 1-3%)
3. **Gas Estimation**: Ensure you have enough gas for the transaction
4. **Wallet Security**: Use a secure wallet and never share private keys
5. **Transaction Confirmation**: Always review transaction details before confirming

**Safety Tips:**
- Double-check token addresses
- Verify the swap amount and expected output
- Use reputable DEX protocols
- Consider using a test transaction first

Let me help you execute this swap safely using the executeSwap tool.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'dex-trading-strategy',
    description: 'DEX trading strategy guide based on market conditions and user preferences',
    parameters: z.object({
      tradingStyle: z.enum(['conservative', 'moderate', 'aggressive']).describe('Trading style preference'),
      marketCondition: z.enum(['bull', 'bear', 'sideways', 'volatile']).describe('Current market condition'),
      timeHorizon: z.enum(['short-term', 'medium-term', 'long-term']).describe('Investment time horizon'),
    }),
  })
  getDexTradingStrategy({ tradingStyle, marketCondition, timeHorizon }) {
    const strategies = {
      'conservative': {
        'bull': 'Focus on established tokens with high liquidity, use low slippage settings, consider DCA approach.',
        'bear': 'Reduce position sizes, focus on stablecoins, use limit orders to avoid market impact.',
        'sideways': 'Range trading with tight stop-losses, focus on high-volume pairs.',
        'volatile': 'Reduce exposure, use small position sizes, focus on major pairs only.',
      },
      'moderate': {
        'bull': 'Balance between established and emerging tokens, moderate slippage tolerance.',
        'bear': 'Selective buying opportunities, focus on fundamentally strong projects.',
        'sideways': 'Swing trading approach, moderate position sizes.',
        'volatile': 'Increased position monitoring, dynamic slippage adjustment.',
      },
      'aggressive': {
        'bull': 'Higher risk tolerance, explore new tokens, higher slippage tolerance.',
        'bear': 'Contrarian approach, aggressive accumulation of quality assets.',
        'sideways': 'Active trading, leverage opportunities in both directions.',
        'volatile': 'High-frequency trading, dynamic route optimization.',
      },
    };

    const strategy = strategies[tradingStyle][marketCondition];

    return {
      description: 'DEX trading strategy guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to develop a ${tradingStyle} trading strategy for ${marketCondition} market conditions with ${timeHorizon} time horizon.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `${strategy}

**Additional Considerations for ${timeHorizon} trading:**
${timeHorizon === 'short-term' ? '- Focus on technical analysis and quick execution' : ''}
${timeHorizon === 'medium-term' ? '- Balance technical and fundamental analysis' : ''}
${timeHorizon === 'long-term' ? '- Emphasize fundamental analysis and project research' : ''}

Let me help you implement this strategy using the appropriate DEX tools.`,
          },
        },
      ],
    };
  }
}
