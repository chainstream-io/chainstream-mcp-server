import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DexTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  private getClient(): ChainStreamClient {
    const accessToken = this.request.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new Error('Access token is required.');
    return new ChainStreamClient(accessToken);
  }

  private success(data: any) {
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, ...data, timestamp: new Date().toISOString() }, null, 2) }] };
  }

  private fail(error: string, message: string) {
    return { content: [{ type: 'text', text: JSON.stringify({ success: false, error, message, timestamp: new Date().toISOString() }, null, 2) }] };
  }

  @Tool({
    name: 'getDexList',
    description: 'Get list of DEXs on specified blockchains',
    parameters: z.object({
      chains: z.array(z.string()).optional().describe('List of chain names'),
      limit: z.number().min(1).max(100).optional().describe('Number of results per page'),
      dexProgram: z.string().optional().describe('DEX program address'),
    }),
    annotations: { title: 'DEX List Query Tool', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getDexList({ chains, limit, dexProgram }) {
    try {
      const client = this.getClient();
      const dexList = await client.dex.listDex({ chains, limit, dexProgram });
      return this.success({ chains, limit, dexProgram, result: dexList, count: dexList?.data?.length ?? 0 });
    } catch (error: any) {
      return this.fail('Failed to get DEX list', error.message);
    }
  }

  @Tool({
    name: 'getQuote',
    description: 'Get a swap quote for a token pair on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g. sol, eth, bsc)'),
      dex: z.enum(['raydium', 'pumpfun']).describe('DEX protocol to use'),
      inputMint: z.string().describe('Input token mint address'),
      outputMint: z.string().describe('Output token mint address'),
      amount: z.string().describe('Amount to swap'),
      slippage: z.number().describe('Slippage tolerance (0-100)'),
      exactIn: z.boolean().optional().describe('Whether amount is exact input (default true)'),
    }),
    annotations: { title: 'DEX Quote Tool', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getQuote({ chain, dex, inputMint, outputMint, amount, slippage, exactIn }) {
    try {
      const client = this.getClient();
      const result = await client.dex.quote(chain, { dex, inputMint, outputMint, amount, slippage, exactIn });
      return this.success({ chain, dex, inputMint, outputMint, amount, slippage, result });
    } catch (error: any) {
      return this.fail('Failed to get quote', error.message);
    }
  }

  @Tool({
    name: 'getRoute',
    description: 'Calculate the best route for a token swap with price impact and fees',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g. sol, eth, bsc)'),
      dex: z.enum(['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad']).describe('DEX protocol'),
      userAddress: z.string().describe('User wallet address'),
      inputMint: z.string().optional().describe('Input token mint address'),
      outputMint: z.string().optional().describe('Output token mint address'),
      amount: z.string().describe('Amount to swap'),
      swapMode: z.enum(['ExactIn', 'ExactOut']).describe('Swap mode'),
      slippage: z.number().describe('Slippage tolerance (0-100)'),
      priorityFee: z.string().optional().describe('Priority fee'),
    }),
    annotations: { title: 'DEX Route Tool', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getRoute({ chain, dex, userAddress, inputMint, outputMint, amount, swapMode, slippage, priorityFee }) {
    try {
      const client = this.getClient();
      const result = await client.dex.route(chain, { dex, userAddress, inputMint, outputMint, amount, swapMode, slippage, priorityFee });
      return this.success({ chain, result });
    } catch (error: any) {
      return this.fail('Failed to get route', error.message);
    }
  }

  @Tool({
    name: 'swap',
    description: 'Execute a token swap on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g. sol, eth, bsc)'),
      dex: z.enum(['jupiter', 'kyberswap', 'raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad']).describe('DEX protocol'),
      userAddress: z.string().describe('User wallet address'),
      inputMint: z.string().optional().describe('Input token mint address'),
      outputMint: z.string().optional().describe('Output token mint address'),
      amount: z.string().describe('Amount to swap'),
      swapMode: z.enum(['ExactIn', 'ExactOut']).describe('Swap mode'),
      slippage: z.number().describe('Slippage tolerance (0-100)'),
      poolAddress: z.string().optional().describe('Specific pool address'),
      priorityFee: z.string().optional().describe('Priority fee'),
    }),
    annotations: { title: 'DEX Swap Tool', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async swap({ chain, dex, userAddress, inputMint, outputMint, amount, swapMode, slippage, poolAddress, priorityFee }) {
    try {
      const client = this.getClient();
      const result = await client.dex.swap(chain, { dex, userAddress, inputMint, outputMint, amount, swapMode, slippage, poolAddress, priorityFee });
      return this.success({ chain, result });
    } catch (error: any) {
      return this.fail('Failed to execute swap', error.message);
    }
  }

  @Tool({
    name: 'createToken',
    description: 'Create a new token on a DEX',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g. sol)'),
      dex: z.enum(['raydium', 'pumpfun', 'moonshot', 'candy', 'launchpad']).describe('DEX to create token on'),
      userAddress: z.string().describe('Creator wallet address'),
      name: z.string().describe('Token name (max 32 chars)'),
      symbol: z.string().describe('Token symbol (max 10 chars)'),
      uri: z.string().optional().describe('Token metadata URI'),
      image: z.string().optional().describe('Token image URL'),
      priorityFee: z.string().optional().describe('Priority fee'),
    }),
    annotations: { title: 'DEX Create Token Tool', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async createToken({ chain, dex, userAddress, name, symbol, uri, image, priorityFee }) {
    try {
      const client = this.getClient();
      const result = await client.dex.createToken(chain, { dex, userAddress, name, symbol, uri, image, priorityFee });
      return this.success({ chain, result });
    } catch (error: any) {
      return this.fail('Failed to create token', error.message);
    }
  }
}
