import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '../../../dist';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class RankingPrompt {
  constructor() {}

  @Prompt({
    name: 'hot-tokens-analysis',
    description: 'Analyze hot tokens trends and investment advice',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      timeframe: z.string().describe('Time range'),
    }),
  })
  getHotTokensAnalysis({ chainId, timeframe }) {
    return {
      description: 'Hot tokens trend analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please analyze hot tokens trends on chain ${chainId} within ${timeframe} time range and provide investment advice.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will provide comprehensive hot tokens analysis including:
1. Price trend analysis
2. Trading volume changes
3. Market sentiment assessment
4. Risk assessment
5. Investment recommendations

Please use the getHotTokens tool to get the latest data.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'trending-tokens-guide',
    description: 'Trending tokens investment guide',
    parameters: z.object({
      userLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('User experience level'),
      riskTolerance: z.enum(['low', 'medium', 'high']).describe('Risk tolerance'),
    }),
  })
  getTrendingTokensGuide({ userLevel, riskTolerance }) {
    const guides = {
      beginner: {
        low: 'Focus on mainstream tokens, avoid high volatility assets.',
        medium: 'Can consider emerging tokens but maintain portfolio diversification.',
        high: 'Can try trending tokens but recommend small investments.',
      },
      intermediate: {
        low: 'Focus on trending tokens with solid fundamentals.',
        medium: 'Can participate in hot trends while managing risks.',
        high: 'Can actively track trends but set stop losses.',
      },
      advanced: {
        low: 'Use technical analysis to select quality trending tokens.',
        medium: 'Combine fundamental and technical analysis for trends.',
        high: 'Can participate in high-risk, high-reward trend investments.',
      },
    };

    const guide = guides[userLevel][riskTolerance];

    return {
      description: 'Trending tokens investment guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `As a ${userLevel} user, my risk tolerance is ${riskTolerance}, please provide trending tokens investment advice.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: guide,
          },
        },
      ],
    };
  }
}
