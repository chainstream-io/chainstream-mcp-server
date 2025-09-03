import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';
import { SwapRouteInputDexEnum, SwapRouteInputSwapModeEnum } from '@chainstream-io/sdk/dist/openapi/models/SwapRouteInput';
import { SwapInputDexEnum, SwapInputSwapModeEnum } from '@chainstream-io/sdk/dist/openapi/models/SwapInput';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported DEX types
type SupportedDex = 'jupiter' | 'kyberswap' | 'raydium' | 'pumpfun' | 'moonshot' | 'candy' | 'launchpad';

@Injectable({ scope: Scope.REQUEST })
export class DexResource {
  @ResourceTemplate({
    name: 'getRoute',
    description: `Get the best trading route between two tokens on a specific chain.

🔐 **Authentication Required**: See playground/resources/README.md for ChainStream API authentication details.

**Supported Chains**: 
- sol (Solana)
- base (Base)
- bsc (Binance Smart Chain)
- polygon (Polygon)
- arbitrum (Arbitrum)
- optimism (Optimism)
- avalanche (Avalanche)
- ethereum (Ethereum)
- zksync (zkSync)
- sui (Sui)

**Chain Aliases**: You can also use these alternative names:
- solana → sol
- binance → bsc
- matic → polygon
- arb → arbitrum
- op → optimism
- avax → avalanche
- eth → ethereum

**Supported DEXes**: 
- jupiter (default for route finding)
- kyberswap
- raydium
- pumpfun
- moonshot
- candy
- launchpad

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/dex/v1-dex-route`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/route/{chain}/{fromToken}/{toToken}',
  })
  async getRoute(req: any, { uri, chain, fromToken, toToken }) {
    // Parse query parameters from URL first to make them available in catch block
    const url = new URL(uri);
    const amountParam = url.searchParams.get('amount');
    const amount = amountParam || '0';
    const slippageParam = url.searchParams.get('slippage');
    const slippage = slippageParam ? parseFloat(slippageParam) : 20;
    const walletAddress = url.searchParams.get('walletAddress') || '0x0000000000000000000000000000000000000000';
    const dexParam = url.searchParams.get('dex');
    const dex = dexParam || 'jupiter'; // Default to Jupiter for route finding

    try {
      // Get accessToken from request headers
      const accessToken = req.headers?.get?.('Authorization')?.split(' ')[1] || req.headers?.authorization?.split(' ')[1];

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

      // Call SDK route method - correct format: dexClient.dex.route(config)
      const routeInfo = await dexClient.dex.route({
        chain: chain as SupportedChain,
        swapRouteInput: {
          dex: dex as SwapRouteInputDexEnum,
          userAddress: walletAddress,
          amount: amount,
          swapMode: 'ExactIn' as SwapRouteInputSwapModeEnum,
          slippage: slippage,
          inputMint: fromToken,
          outputMint: toToken,
        }
      });

      return {
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
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

  @ResourceTemplate({
    name: 'executeSwap',
    description: `Execute a token swap on a specific chain using the best available route.

🔐 **Authentication Required**: See playground/resources/README.md for ChainStream API authentication details.

**Supported Chains**: 
- sol (Solana)
- base (Base)
- bsc (Binance Smart Chain)
- polygon (Polygon)
- arbitrum (Arbitrum)
- optimism (Optimism)
- avalanche (Avalanche)
- ethereum (Ethereum)
- zksync (zkSync)
- sui (Sui)

**Chain Aliases**: You can also use these alternative names:
- solana → sol
- binance → bsc
- matic → polygon
- arb → arbitrum
- op → optimism
- avax → avalanche
- eth → ethereum

**Supported DEXes**: 
- jupiter
- kyberswap
- raydium (default for swap execution)
- pumpfun
- moonshot
- candy
- launchpad

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/dex/v1-dex-swap`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/swap/{chain}/{fromToken}/{toToken}',
  })
  async executeSwap(req: any, { uri, chain, fromToken, toToken }) {
    // Parse query parameters from URL first to make them available in catch block
    const url = new URL(uri);
    const amountParam = url.searchParams.get('amount');
    const amount = amountParam || '0';
    const slippageParam = url.searchParams.get('slippage');
    const slippage = slippageParam ? parseFloat(slippageParam) : 20;
    const walletAddress = url.searchParams.get('walletAddress');
    const dexParam = url.searchParams.get('dex');
    const dex = dexParam || 'raydium'; // Default to Raydium for swap execution

    try {
      // Get accessToken from request headers
      const accessToken = req.headers?.get?.('Authorization')?.split(' ')[1] || req.headers?.authorization?.split(' ')[1];

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

      if (!walletAddress) {
        throw new Error('Wallet address is required for swap execution');
      }

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK swap method - correct format: dexClient.dex.swap(config)
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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
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
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
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
