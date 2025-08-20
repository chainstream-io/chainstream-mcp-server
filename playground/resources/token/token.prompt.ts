import { Injectable, Scope } from '@nestjs/common';
import { Prompt } from '../../../src';
import { z } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class TokenPrompt {
  constructor() {}

  @Prompt({
    name: 'token-research-guide',
    description: 'Token research and analysis guide',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chainId: z.string().describe('Chain ID'),
    }),
  })
  getTokenResearchGuide({ tokenAddress, chainId }) {
    return {
      description: 'Token research analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me research token ${tokenAddress} on chain ${chainId}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will provide comprehensive token research analysis including:
1. Basic information analysis (name, symbol, total supply, etc.)
2. Price and market cap analysis
3. Trading volume analysis
4. Technical indicators assessment
5. Risk assessment
6. Investment recommendations

Please use the getToken tool to get detailed information.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'token-search-strategy',
    description: 'Token search strategy guide',
    parameters: z.object({
      searchType: z.enum(['by-name', 'by-symbol', 'by-category', 'trending']).describe('Search type'),
      investmentGoal: z.enum(['short-term', 'long-term', 'yield-farming', 'governance']).describe('Investment goal'),
    }),
  })
  getTokenSearchStrategy({ searchType, investmentGoal }) {
    const strategies = {
      'by-name': {
        'short-term': 'Search tokens by name suitable for short-term trading, focus on liquidity and volatility.',
        'long-term': 'Search tokens by name with long-term value, focus on fundamentals.',
        'yield-farming': 'Search tokens by name suitable for farming, focus on yield rates.',
        'governance': 'Search governance tokens by name, focus on voting rights and community activity.',
      },
      'by-symbol': {
        'short-term': 'Search popular trading tokens by symbol.',
        'long-term': 'Search well-known project tokens by symbol.',
        'yield-farming': 'Search farming tokens by symbol.',
        'governance': 'Search governance tokens by symbol.',
      },
      'by-category': {
        'short-term': 'Search hot sector tokens by category.',
        'long-term': 'Search promising sector tokens by category.',
        'yield-farming': 'Search farming sector tokens by category.',
        'governance': 'Search governance sector tokens by category.',
      },
      'trending': {
        'short-term': 'Focus on short-term opportunities in trending tokens.',
        'long-term': 'Analyze long-term value of trending tokens.',
        'yield-farming': 'Look for farming opportunities in trends.',
        'governance': 'Focus on governance tokens in trends.',
      },
    };

    const strategy = strategies[searchType][investmentGoal];

    return {
      description: 'Token search strategy guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to search tokens using ${searchType} method, my investment goal is ${investmentGoal}.`,
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
