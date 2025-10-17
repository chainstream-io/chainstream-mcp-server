import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WalletPrompt {
  constructor() {}

  @Prompt({
    name: 'wallet-balance-guide',
    description:
      'Query the balance of a wallet on a specific chain, including native and token balances.',
    parameters: z.object({
      walletAddress: z.string().describe('Wallet address to check balance'),
      chain: z
        .string()
        .describe(
          'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)',
        ),
    }),
  })
  getWalletBalanceGuide({ walletAddress, chain }) {
    return {
      description: 'Wallet balance query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me check the balance of wallet ${walletAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will help you check the wallet balance. Here's what I can do:

1. **Balance Check**: Query the current balance of the specified wallet address
2. **Multi-chain Support**: Check balance across different blockchain networks
3. **Token Balances**: View native token and other token balances
4. **Real-time Data**: Get up-to-date balance information

Please use the getBalance tool to retrieve the wallet balance information.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'wallet-analysis-strategy',
    description:
      'Generate wallet analysis strategies (balance monitoring, portfolio, history, risk) for different timeframes.',
    parameters: z.object({
      analysisType: z
        .enum([
          'balance-monitoring',
          'portfolio-tracking',
          'transaction-history',
          'risk-assessment',
        ])
        .describe('Analysis type'),
      timeFrame: z
        .enum(['current', 'daily', 'weekly', 'monthly'])
        .describe('Time frame for analysis'),
    }),
  })
  getWalletAnalysisStrategy({ analysisType, timeFrame }) {
    const strategies = {
      'balance-monitoring': {
        current:
          'Monitor current wallet balance for immediate decision making.',
        daily: 'Track daily balance changes to identify patterns.',
        weekly: 'Analyze weekly balance trends for medium-term planning.',
        monthly: 'Review monthly balance evolution for long-term strategy.',
      },
      'portfolio-tracking': {
        current: 'Assess current portfolio composition and allocation.',
        daily: 'Track daily portfolio value changes and rebalancing needs.',
        weekly: 'Monitor weekly portfolio performance and risk metrics.',
        monthly:
          'Evaluate monthly portfolio growth and strategy effectiveness.',
      },
      'transaction-history': {
        current: 'Review recent transactions for immediate verification.',
        daily: 'Analyze daily transaction patterns and volume.',
        weekly: 'Track weekly transaction trends and frequency.',
        monthly:
          'Assess monthly transaction behavior and optimization opportunities.',
      },
      'risk-assessment': {
        current: 'Evaluate current wallet security and risk exposure.',
        daily: 'Monitor daily risk indicators and security alerts.',
        weekly: 'Assess weekly risk trends and mitigation strategies.',
        monthly: 'Review monthly risk profile and long-term security planning.',
      },
    };

    const strategy = strategies[analysisType][timeFrame];

    return {
      description: 'Wallet analysis strategy guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to analyze my wallet using ${analysisType} method, focusing on ${timeFrame} timeframe.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: strategy,
          },
        },
      ],
    };
  }
}
