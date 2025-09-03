import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Tool } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';
import { z } from 'zod';
import { Request } from 'express';
import { SwapRouteInputDexEnum, SwapRouteInputSwapModeEnum } from '@chainstream-io/sdk/dist/openapi/models/SwapRouteInput';
import { SwapInputDexEnum, SwapInputSwapModeEnum } from '@chainstream-io/sdk/dist/openapi/models/SwapInput';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported DEX types
type SupportedDex = 'jupiter' | 'kyberswap' | 'raydium' | 'pumpfun' | 'moonshot' | 'candy' | 'launchpad';

@Injectable({ scope: Scope.REQUEST })
export class DexTool {
  constructor(@Inject(REQUEST) private request: Request) { }

  @Tool({
    name: 'getRoute',
    description: 'Get the best trading route between two tokens on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      fromToken: z.string().describe('Source token address'),
      toToken: z.string().describe('Destination token address'),
      amount: z.string().describe('Amount to swap (in wei/smallest unit)'),
      slippage: z.number().min(0.1).max(50).optional().describe('Slippage tolerance in percentage (0.1-50, default: 20)'),
      walletAddress: z.string().describe('User wallet address for route calculation'),
      dex: z.enum(['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad']).optional().describe('DEX to use for route finding (default: jupiter)'),
    }),
    annotations: {
      title: 'DEX Route Finder Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRoute({ chain, fromToken, toToken, amount, slippage = 20, walletAddress, dex = 'jupiter' }) {
    try {
      // Get accessToken from request headers
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;

      // Validate accessToken
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }

      // Validate chain parameter
      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      // Validate DEX parameter
      const supportedDexes: SupportedDex[] = ['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad'];
      if (!supportedDexes.includes(dex as SupportedDex)) {
        throw new Error(`Unsupported DEX: ${dex}. Supported DEXes: ${supportedDexes.join(', ')}`);
      }

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK route method
      const routeInfo = await dexClient.dex.route({
        chain: chain as SupportedChain,
        swapRouteInput: {
          dex: dex as SwapRouteInputDexEnum,
          userAddress: walletAddress || '1nc1nerator11111111111111111111111111111111',
          amount: amount,
          swapMode: 'ExactIn' as SwapRouteInputSwapModeEnum,
          slippage: slippage,
          inputMint: fromToken,
          outputMint: toToken,
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain: chain,
              fromToken,
              toToken,
              amount,
              slippage: `${slippage}%`,
              dex: dex,
              routeInfo: routeInfo,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to get route information',
              chain: chain,
              fromToken,
              toToken,
              amount,
              dex: dex,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'executeSwap',
    description: 'Execute a token swap on a specific chain using the best available route',
    parameters: z.object({
      chain: z.string().describe('Chain name (supported aliases: solana→sol, binance→bsc, matic→polygon, arb→arbitrum, op→optimism, avax→avalanche, eth→ethereum)'),
      fromToken: z.string().describe('Source token address'),
      toToken: z.string().describe('Destination token address'),
      amount: z.string().describe('Amount to swap (in wei/smallest unit)'),
      slippage: z.number().min(0.1).max(50).optional().describe('Slippage tolerance in percentage (0.1-50, default: 20)'),
      walletAddress: z.string().describe('User wallet address for the swap'),
      privateKey: z.string().optional().describe('Private key for transaction signing (optional if using wallet connect)'),
      dex: z.enum(['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad']).optional().describe('DEX to use for swap execution (default: raydium)'),
    }),
    annotations: {
      title: 'DEX Swap Execution Tool',
      destructiveHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  })
  async executeSwap({ chain, fromToken, toToken, amount, slippage = 20, walletAddress, privateKey, dex = 'raydium' }) {
    try {
      // Get accessToken from request headers
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;

      // Validate accessToken
      if (!accessToken) {
        throw new Error('Access token is required. Please provide a valid JWT token.');
      }

      // Validate chain parameter
      const supportedChains: SupportedChain[] = ['sol', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'ethereum', 'zksync', 'sui'];
      if (!supportedChains.includes(chain as SupportedChain)) {
        throw new Error(`Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`);
      }

      // Validate DEX parameter
      const supportedDexes: SupportedDex[] = ['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad'];
      if (!supportedDexes.includes(dex as SupportedDex)) {
        throw new Error(`Unsupported DEX: ${dex}. Supported DEXes: ${supportedDexes.join(', ')}`);
      }

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK swap method
      const swapResult = await dexClient.dex.swap({
        chain: chain as SupportedChain,
        swapInput: {
          dex: dex as SwapInputDexEnum,
          userAddress: walletAddress,
          amount: amount,
          swapMode: 'ExactIn' as SwapInputSwapModeEnum,
          slippage: slippage,
          inputMint: fromToken,
          outputMint: toToken,
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              chain: chain,
              fromToken,
              toToken,
              amount,
              slippage: `${slippage}%`,
              dex: dex,
              walletAddress,
              swapResult: swapResult,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to execute swap',
              chain: chain,
              fromToken,
              toToken,
              amount,
              dex: dex,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
}
