import {
  ChainStreamClient,
  CreateTokenInputDex,
  QuoteDex,
  SwapInputDex,
  SwapInputSwapMode,
  SwapRouteInputDex,
  SwapRouteInputSwapMode,
} from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DexResource {
  @ResourceTemplate({
    name: 'getDexList',
    description: `Get list of DEXs on specified blockchains including program address, protocol family, logo, and pagination metadata.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/dex/v2/dex-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/list?chains={chains}&limit={limit}&dexProgram={dexProgram}',
  })
  async getDexList(req: Request, { uri }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const url = new URL(uri);
      const chains = url.searchParams.getAll('chains');
      const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
      const dexProgram = url.searchParams.get('dexProgram') || undefined;

      const client = new ChainStreamClient(accessToken);
      const dexList = await client.dex.listDex({ chains, limit, dexProgram });

      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result: dexList, count: dexList?.data?.length ?? 0, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get DEX list', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getQuote',
    description: `Get a swap quote for a token pair on a specific chain.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-quote-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/quote/{chain}?dex={dex}&inputMint={inputMint}&outputMint={outputMint}&amount={amount}&slippage={slippage}',
  })
  async getQuote(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const url = new URL(uri);
      const dex = url.searchParams.get('dex') as QuoteDex;
      const inputMint = url.searchParams.get('inputMint');
      const outputMint = url.searchParams.get('outputMint');
      const amount = url.searchParams.get('amount');
      const slippage = Number(url.searchParams.get('slippage'));

      if (!dex || !inputMint || !outputMint || !amount) {
        throw new Error('dex, inputMint, outputMint, and amount are required.');
      }

      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.quote(chain, { dex, inputMint, outputMint, amount, slippage });

      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get quote', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getRoute',
    description: `Calculate the best route for a token swap with price impact and fees.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-route-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/route/{chain}',
  })
  async getRoute(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.route(chain, {
        dex: SwapRouteInputDex.jupiter,
        userAddress: '',
        amount: '0',
        swapMode: SwapRouteInputSwapMode.ExactIn,
        slippage: 1,
      });

      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get route', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'swap',
    description: `Execute a token swap on a specific chain.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-swap-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/swap/{chain}',
  })
  async swap(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.swap(chain, {
        dex: SwapInputDex.jupiter,
        userAddress: '',
        amount: '0',
        swapMode: SwapInputSwapMode.ExactIn,
        slippage: 1,
      });

      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to execute swap', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'createToken',
    description: `Create a new token on a DEX.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/defi/dex/v2/dex-chain-create-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/create-token/{chain}',
  })
  async createToken(req: Request, { uri, chain }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const result = await client.dex.createToken(chain, {
        dex: CreateTokenInputDex.pumpfun,
        userAddress: '',
        name: '',
        symbol: '',
      });

      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to create token', message: error.message }, null, 2) }],
      };
    }
  }
}
