import { ChainStreamClient, EstimateGasLimitInput } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class TransactionResource {
  @ResourceTemplate({
    name: 'sendTransaction',
    description: `Send a signed transaction on a specific chain.

🔐 **Authentication Required**

**Supported Chains**: sol, eth, bsc

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/data/transaction/v2/transaction-send`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/transaction/send/{chain}/{to}',
  })
  async sendTransaction(req: Request, { uri, chain, to }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const signedTx = url.searchParams.get('signedTx');
      if (!signedTx) {
        throw new Error('Signed transaction is required for transaction sending');
      }

      const client = new ChainStreamClient(accessToken);
      const transactionResult = await client.transaction.send(chain, { signedTx });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                to,
                signedTx,
                transactionResult,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to send transaction',
                chain,
                to,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'getGasPrice',
    description: `Get the current gas price for an EVM chain.

🔐 **Authentication Required**

**Supported Chains**: bsc, eth

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/data/transaction/v2/transaction-gas-price-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/transaction/gas-price/{chain}',
  })
  async getGasPrice(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const client = new ChainStreamClient(accessToken);
      const gasPrice = await client.transaction.getGasPrice(chain);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                gasPrice,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to get gas price',
                chain,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }

  @ResourceTemplate({
    name: 'estimateGasLimit',
    description: `Estimate the gas limit for a transaction on an EVM chain.

🔐 **Authentication Required**

**Supported Chains**: bsc, eth

**API Documentation**: https://docs.chainstream.io/en/api-reference/endpoint/data/transaction/v2/transaction-estimate-gas-limit`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/transaction/estimate-gas-limit/{chain}',
  })
  async estimateGasLimit(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) {
        throw new Error('Access token is required.');
      }

      const url = new URL(uri);
      const to = url.searchParams.get('to');
      const from = url.searchParams.get('from');
      if (!to || !from) {
        throw new Error('"to" and "from" addresses are required');
      }

      const data = url.searchParams.get('data') || '0x';
      const value = url.searchParams.get('value') || undefined;

      const estimateGasLimitInput: EstimateGasLimitInput = { from, to, data, value };

      const client = new ChainStreamClient(accessToken);
      const result = await client.transaction.getGasLimit(chain, estimateGasLimitInput);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                chain,
                estimateGasLimitInput,
                result,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                error: 'Failed to estimate gas limit',
                chain,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}
