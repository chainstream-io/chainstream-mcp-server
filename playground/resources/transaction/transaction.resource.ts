import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';
import { DexClient } from '@chainstream-io/sdk';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

@Injectable({ scope: Scope.REQUEST })
export class TransactionResource {
  @ResourceTemplate({
    name: 'sendTransaction',
    description: `Send a transaction on a specific chain.

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

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/transaction/v1-transaction-send`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://transaction/send/{chain}/{to}',
  })
  async sendTransaction(req: any, { uri, chain, to }) {
    try {
      // Get accessToken from request headers - use the same pattern as other resources
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

      // Parse query parameters from URL
      const url = new URL(uri);
      const signedTx = url.searchParams.get('signedTx');

      if (!signedTx) {
        throw new Error('Signed transaction is required for transaction sending');
      }

      // Initialize DexClient with provided accessToken
      const dexClient = new DexClient(accessToken);

      // Call SDK transaction.send method - correct format: dexClient.transaction.send(config)
      const transactionResult = await dexClient.transaction.send({
        chain: chain as SupportedChain,
        sendTxInput: {
          signedTx: signedTx,
        }
      });

      return {
        contents: [
          {
            uri: uri, // Required by MCP protocol - must match the requested URI
            mimeType: 'application/json',
            text: JSON.stringify({
              chain: chain,
              to,
              signedTx: signedTx,
              transactionResult: transactionResult,
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
              error: 'Failed to send transaction',
              chain: chain,
              to,
              message: error.message,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }
}
