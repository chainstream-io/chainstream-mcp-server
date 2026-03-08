import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class DexpoolTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getDexpoolDetail',
    description: 'Get detailed information about a specific DEX pool',
    parameters: z.object({
      chain: z.string().describe('Chain symbol (sol, eth, bsc)'),
      poolAddress: z.string().describe('DEX pool address'),
    }),
    annotations: {
      title: 'DEX Pool Detail Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getDexpoolDetail({ chain, poolAddress }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

      const client = new ChainStreamClient(accessToken);
      const poolDetail = await client.dexpool.getDexpool(chain, poolAddress);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                poolAddress,
                poolDetail,
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
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Failed to get DEX pool detail',
                chain,
                poolAddress,
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

  @Tool({
    name: 'getDexpoolSnapshots',
    description: 'Get historical snapshots for a specific DEX pool',
    parameters: z.object({
      chain: z.string().describe('Chain symbol (sol, eth, bsc)'),
      poolAddress: z.string().describe('DEX pool address'),
      time: z.number().optional().describe('Snapshot timestamp filter'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Number of results per page'),
      direction: z.string().optional().describe('Pagination direction'),
    }),
    annotations: {
      title: 'DEX Pool Snapshots Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getDexpoolSnapshots({ chain, poolAddress, time, cursor, limit, direction }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');

      const params: Record<string, any> = {};
      if (time !== undefined) params.time = time;
      if (cursor !== undefined) params.cursor = cursor;
      if (limit !== undefined) params.limit = limit;
      if (direction !== undefined) params.direction = direction;

      const client = new ChainStreamClient(accessToken);
      const snapshots = await client.dexpool.getDexpoolSnapshots(
        chain,
        poolAddress,
        Object.keys(params).length > 0 ? params : undefined,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain,
                poolAddress,
                snapshots,
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
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: 'Failed to get DEX pool snapshots',
                chain,
                poolAddress,
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
