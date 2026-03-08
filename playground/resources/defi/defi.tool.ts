import { ChainStreamClient, CreateTokenInputDex } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DefiTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  private getClient(): ChainStreamClient {
    const accessToken = this.request.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new Error('Access token is required.');
    return new ChainStreamClient(accessToken);
  }

  @Tool({
    name: 'pumpfunCreateToken',
    description: 'Create a new token on Pump.fun',
    parameters: z.object({
      chain: z.string().describe('Chain name (typically sol)'),
      name: z.string().describe('Token name (max 32 chars)'),
      symbol: z.string().describe('Token symbol (max 10 chars)'),
      userAddress: z.string().describe('Creator wallet address'),
      uri: z.string().optional().describe('Token metadata URI'),
      image: z.string().optional().describe('Token image URL'),
      priorityFee: z.string().optional().describe('Priority fee'),
    }),
    annotations: { title: 'Pump.fun Create Token', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async pumpfunCreateToken({ chain, name, symbol, userAddress, uri, image, priorityFee }) {
    try {
      const client = this.getClient();
      const result = await client.dex.createToken(chain, {
        dex: CreateTokenInputDex.pumpfun,
        name,
        symbol,
        userAddress,
        uri,
        image,
        priorityFee,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Failed to create Pump.fun token', message: error.message }, null, 2) }],
      };
    }
  }

  @Tool({
    name: 'moonshotCreateToken',
    description: 'Create a new token on Moonshot',
    parameters: z.object({
      chain: z.string().describe('Chain name (typically sol)'),
      name: z.string().describe('Token name (max 32 chars)'),
      symbol: z.string().describe('Token symbol (max 10 chars)'),
      userAddress: z.string().describe('Creator wallet address'),
      uri: z.string().optional().describe('Token metadata URI'),
      image: z.string().optional().describe('Token image URL'),
      priorityFee: z.string().optional().describe('Priority fee'),
    }),
    annotations: { title: 'Moonshot Create Token', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async moonshotCreateToken({ chain, name, symbol, userAddress, uri, image, priorityFee }) {
    try {
      const client = this.getClient();
      const result = await client.dex.createToken(chain, {
        dex: CreateTokenInputDex.moonshot,
        name,
        symbol,
        userAddress,
        uri,
        image,
        priorityFee,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, chain, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Failed to create Moonshot token', message: error.message }, null, 2) }],
      };
    }
  }
}
