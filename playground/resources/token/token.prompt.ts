import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TokenPrompt {
  constructor() {}

  @Prompt({
    name: 'token-research-guide',
    description: 'Analyze a single token’s fundamentals, market data, and investment outlook.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenResearchGuide({ tokenAddress, chain }) {
    return {
      description: 'Token research analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me research token ${tokenAddress} on chain ${chain}.`,
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
    name: 'tokens-research-guide',
    description: 'Compare multiple tokens on a chain, including fundamentals, market data, and trading stats.',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
      sortBy: z.string().optional().describe('Sort field, e.g. marketData.marketCapInUsd'),
      sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction'),
    }),
  })
  getTokensResearchGuide({ chain, tokenAddresses, sortBy, sortDirection }) {
    return {
      description: 'Multi-token research analysis guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me research multiple tokens [${tokenAddresses}] on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will provide comprehensive research for multiple tokens including:
  - Basic information (name, symbol, supply)
  - Market data (price, market cap, TVL)
  - Trading stats (volume, trades, buyers/sellers)
  - Sorting and filtering by chosen fields
  
  Please use the getTokens tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-search-strategy',
    description: 'Generate token search strategies based on search type and investment goals.',
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

  // 获取 Token Metadata
  @Prompt({
    name: 'token-metadata-guide',
    description: 'Fetch detailed on-chain metadata for a token, including name, symbol, decimals, creators, and social linkssss.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenMetadataGuide({ tokenAddress, chain }) {
    return {
      description: 'Token metadata fetch guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch metadata for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve the token metadata including:
- Name, symbol, decimals
- Metadata address
- Token creators and verification
- Image/logo URL
- Social media links
- Extra attributes (program, authorities, standards, etc.)
- Creation date and description

Please use the getTokenMetadata tool to fetch the actual data from the API.`,
          },
        },
      ],
    };
  }

  @Prompt({
    name: 'tokens-metadata-guide',
    description: 'Retrieve metadata for multiple tokens, including identifiers, creators, and social information.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
  })
  getTokensMetadataGuide({ chain, tokenAddresses }) {
    return {
      description: 'Multi-token metadata fetch guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch metadata for tokens [${tokenAddresses}] on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve metadata for multiple tokens including:
  - Name, symbol, decimals
  - Metadata address
  - Token creators and verification
  - Image/logo URL
  - Social media links
  - Extra attributes (program, authorities, standards, etc.)
  - Creation date and description
  
  Please use the getTokensMetadata tool to fetch the actual data from the API.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-liquidity-pools',
    description: 'List all liquidity pools that include a given token, with pool details and TVL.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenLiquidityPools({ tokenAddress, chain }) {
    return {
      description: 'Token liquidity pool query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please help me find all liquidity pools that include token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve all liquidity pools that contain this token on the specified chain. This includes:
  - Pool address
  - Protocol name and family
  - Token pair (A/B)
  - TVL (Total Value Locked) in USD and native token
  - Associated program and image
  
  Please use the getTokenLiquidityPools tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-stats-guide',
    description: 'Retrieve trading statistics for a token, including price, volume, and trader activity.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenStatsGuide({ tokenAddress, chain }) {
    return {
      description: 'Token statistics query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide statistical data for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve token statistics including:
  - Price movements across timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h)
  - Buy/sell volumes and counts
  - Trader activity and trade counts
  - High/low/open/close prices
  - Price change ratios
  
  Please use the getTokenStats tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'tokens-stats-guide',
    description: 'Fetch comparative trading statistics for multiple tokens on a chain.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
  })
  getTokensStatsGuide({ chain, tokenAddresses }) {
    return {
      description: 'Multi-token statistics query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide statistical data for tokens [${tokenAddresses}] on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve statistics for multiple tokens including:
  - Price movements across timeframes (1m, 5m, 15m, 30m, 1h, 4h, 24h)
  - Buy/sell volumes and counts
  - Trader activity and trade counts
  - High/low/open/close prices
  - Price change ratios
  
  Please use the getTokensStats tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-holders-guide',
    description: 'List all holders of a token, including wallet addresses, balances, and supply share.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
    }),
  })
  getTokenHoldersGuide({ tokenAddress, chain }) {
    return {
      description: 'Token holders query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the holders of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the list of wallets holding this token, including:
  - Wallet address
  - Holding amount
  - USD value
  - Percentage of total supply
  
  Please use the getTokenHolders tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-holders-multi-guide',
    description: 'Fetch token holding details for specific wallet addresses.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      tokenAddress: z.string().describe('Token contract address'),
      walletAddresses: z.string().describe('Comma-separated list of wallet addresses'),
    }),
  })
  getTokenHoldersMultiGuide({ chain, tokenAddress, walletAddresses }) {
    return {
      description: 'Multi-wallet holders query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch holders information for token ${tokenAddress} on chain ${chain} for wallets [${walletAddresses}].`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve holders information including:
  - Wallet address
  - Amount held
  - Amount in USD
  - Percentage of total supply
  
  Please use the getTokenHoldersMulti tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-candles-guide',
    description: 'Fetch OHLC candlestick data for a token at a given resolution.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      resolution: z.enum(['1s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '12h', '1d']).describe('Time resolution for candle data'),
      from: z.string().optional().describe('Start timestamp (Unix epoch in milliseconds)'),
      to: z.string().optional().describe('End timestamp (Unix epoch in milliseconds)'),
      limit: z.string().optional().describe('Number of results per page'),
    }),
  })
  getTokenCandlesGuide({ tokenAddress, chain, resolution, from, to, limit }) {
    return {
      description: 'Token price candles query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the ${resolution} price candles for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's price candles including:
  - Open, High, Low, Close prices
  - Volume and timestamp
  - Resolution: ${resolution}
  ${from ? `- From: ${new Date(Number(from)).toISOString()}` : ''}
  ${to ? `- To: ${new Date(Number(to)).toISOString()}` : ''}
  ${limit ? `- Limit: ${limit}` : ''}
  
  Please use the getTokenCandles tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-top-holders-guide',
    description: 'Retrieve the top 20 token holders ranked by balance and supply share.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
    }),
  })
  getTokenTopHoldersGuide({ tokenAddress, chain }) {
    return {
      description: 'Token top holders query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the top 20 holders of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the top 20 holders of this token, including:
  - Wallet address
  - Holding amount
  - USD value
  - Percentage of total supply
  
  Please use the getTokenTopHolders tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-market-data-guide',
    description: 'Fetch market metrics for a token, including supply, market cap, holders, and TVL.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
    }),
  })
  getTokenMarketDataGuide({ tokenAddress, chain }) {
    return {
      description: 'Token market data query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the market data of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's market data including:
  - Total supply
  - Market cap (USD & native token)
  - Top 10 & Top 100 holdings ratios
  - Number of holders
  - Price in USD & native token
  - TVL (Total Value Locked)
  - Developer team holdings
  
  Please use the getTokenMarketData tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'tokens-market-data-guide',
    description: 'Retrieve market metrics for multiple tokens, including supply, cap, and holder ratios.',
    parameters: z.object({
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      tokenAddresses: z.string().describe('Comma-separated list of token addresses'),
    }),
  })
  getTokensMarketDataGuide({ chain, tokenAddresses }) {
    return {
      description: 'Multi-token market data query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch market data for tokens [${tokenAddresses}] on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve market data for multiple tokens including:
  - Total supply
  - Market cap (USD & native token)
  - Top 10 & Top 100 holdings ratios
  - Number of holders
  - Price in USD & native token
  - TVL (Total Value Locked)
  
  Please use the getTokensMarketData tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-prices-guide',
    description: 'Fetch historical price data for a token with pagination support.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
    }),
  })
  getTokenPricesGuide({ tokenAddress, chain, cursor, limit, direction }) {
    return {
      description: 'Token historical prices query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the historical price data for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's historical price data including:
  - Price in USD
  - Price in native token
  - Timestamp
  - Pagination info (cursor, hasNext, hasPrev)
  
  Please use the getTokenPrices tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
 
  @Prompt({
    name: 'token-price-by-time-guide',
    description: 'Retrieve token price at a specific timestamp in USD and native token.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      timestamp: z.string().describe('Timestamp for price query (Unix epoch in seconds)'),
    }),
  })
  getTokenPriceByTimeGuide({ tokenAddress, chain, timestamp }) {
    return {
      description: 'Token price by time query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the price of token ${tokenAddress} on chain ${chain} at timestamp ${timestamp}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's price at the given timestamp, including:
  - Price in USD
  - Price in native token
  - Exact timestamp
  
  Please use the getTokenPriceByTime tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-creation-guide',
    description: 'Retrieve token creation details, including block, transaction, and timestamp.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
    }),
  })
  getTokenCreationGuide({ tokenAddress, chain }) {
    return {
      description: 'Token creation information query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the creation information of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's creation information including:
  - Block height, slot, and hash
  - Block timestamp
  - Transaction signature
  - Creation type
  
  Please use the getTokenCreation tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-mint-burn-guide',
    description: 'Fetch mint and burn operations for a token, with block and transaction details.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
      type: z.enum(['all', 'mint', 'burn']).describe('Type of operation to filter'),
    }),
  })
  getTokenMintBurnGuide({ tokenAddress, chain, cursor, limit, direction, type }) {
    return {
      description: 'Token mint and burn query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the ${type} operations for token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's mint and burn information including:
  - Block details (height, slot, hash, timestamp)
  - Transaction signature
  - Operation type (mint or burn)
  - Pagination info (cursor, hasNext, hasPrev)
  
  Please use the getTokenMintBurn tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'token-security-guide',
    description: 'Retrieve token security attributes, including authorities, permissions, and liquidity risks.',
    parameters: z.object({
      tokenAddress: z.string().describe('Token contract address'),
      chain: z.string().describe(
        'Chain name (supported aliases: solana→sol, binance→bsc, bnb->bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'
      ),
    }),
  })
  getTokenSecurityGuide({ tokenAddress, chain }) {
    return {
      description: 'Token security information query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me the security information of token ${tokenAddress} on chain ${chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token's security information including:
  - Authorities and permissions
  - Freezable, mintable, closable status
  - Holder distribution
  - Metadata and trusted token status
  - DEX liquidity and trading info
  
  Please use the getTokenSecurity tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'token-list-filtered-guide',
    description: 'Fetch a filtered and sorted list of tokens on a chain, with pagination and range filters.',
    parameters: z.object({
      chain: z.string().describe('Chain name (sol, base, bsc, polygon, arbitrum, optimism, avalanche, ethereum, zksync, sui)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of results per page (1-100)'),
      direction: z.enum(['next', 'prev']).optional().describe('Pagination direction'),
      sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
      sortBy: z.string().optional().describe('Sort by field, e.g. h24VolumeInUsd'),
    }),
  })
  getTokenListFilteredGuide({ chain, cursor, limit, direction, sort, sortBy }) { //TODO
    return {
      description: 'Token list (filtered) query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please show me a filtered token list on chain ${chain}, sorted by ${sortBy || 'h24VolumeInUsd'} in ${sort || 'desc'} order.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Sure! I will retrieve the token list with filters, including:
  - Pagination (cursor, limit, direction)
  - Sorting (sort, sortBy)
  - Range filters (volume, price change, trades, buyers, sellers, etc.)
  
  Please use the getTokenListFiltered tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
}
