import { DexClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

// Define supported duration types
type Duration = '1m' | '5m' | '1h' | '4h' | '24h';

// Define supported sort fields for ranking
type RankingSortByField = 'marketData.priceInUsd' | 'stats.priceChangeRatioInUsd1m' | 'stats.priceChangeRatioInUsd5m' | 'stats.priceChangeRatioInUsd1h' | 'stats.priceChangeRatioInUsd4h' | 'stats.priceChangeRatioInUsd24h' | 'marketData.marketCapInUsd' | 'marketData.tvlInUsd' | 'marketData.top10HoldingsRatio' | 'marketData.top100HoldingsRatio' | 'marketData.holders' | 'stats.trades1m' | 'stats.trades5m' | 'stats.trades1h' | 'stats.trades4h' | 'stats.trades24h' | 'stats.traders1m' | 'stats.traders5m' | 'stats.traders1h' | 'stats.traders4h' | 'stats.traders24h' | 'stats.volumesInUsd1m' | 'stats.volumesInUsd5m' | 'stats.volumesInUsd1h' | 'stats.volumesInUsd4h' | 'stats.volumesInUsd24h' | 'tokenCreatedAt';

@Injectable({ scope: Scope.REQUEST })
export class RedpacketTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'getRedpacketCreate',
    description: 'Create a new red packet with specified amount and quantity',
    parameters: z.object({
      chain: z.string(),
      creator: z.string(),
      mint: z.string(),
      maxClaims: z.string(),
      totalAmount: z.string().optional(),
      fixedAmount: z.string().optional(),
      memo: z.string().optional(),
      password: z.string().optional(),
      claimAuthority: z.string().optional(),
    }),
    annotations: {
      title: 'Red Packet Create Tool',
      destructiveHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  })
  async getRedpacketCreate(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
  
      const createRedPacketInput: any = {
        creator: params.creator,
        mint: params.mint,
        maxClaims: Number(params.maxClaims),
        totalAmount: params.totalAmount,
        fixedAmount: params.fixedAmount,
        memo: params.memo,
        password: params.password,
        claimAuthority: params.claimAuthority,
      };
  
      Object.keys(createRedPacketInput).forEach(
        key => createRedPacketInput[key] === undefined && delete createRedPacketInput[key]
      );
  
      const result = await dexClient.redPacket.createRedpacket({
        chain: params.chain as SupportedChain,
        createRedPacketInput,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain: params.chain,
                creator: params.creator,
                txSerialize: result?.txSerialize,
                shareId: result?.shareId,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to create red packet',
                chain: params.chain,
                creator: params.creator,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  

  @Tool({
    name: 'getRedpacketClaim',
    description: 'Claim tokens from an existing red packet',
    parameters: z.object({
      chain: z.string().describe('Chain name'),
      claimer: z.string().describe('Wallet address of the claimer'),
      packetId: z.string().optional().describe('Red packet ID'),
      shareId: z.string().optional().describe('Red packet share ID'),
      password: z.string().optional().describe('Password to claim the red packet'),
    }),
    annotations: {
      title: 'Red Packet Claim Tool',
      destructiveHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  })
  async getRedpacketClaim(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
  
      const claimParams: any = {
        chain: params.chain,
        claimer: params.claimer,
        packetId: params.packetId,
        shareId: params.shareId,
        password: params.password,
      };
  
      Object.keys(claimParams).forEach(
        key => claimParams[key] === undefined && delete claimParams[key]
      );
  
      const result = await dexClient.redPacket.claimRedpacket(claimParams);
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain: params.chain,
                claimer: params.claimer,
                txSerialize: result?.txSerialize,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to claim red packet',
                chain: params.chain,
                claimer: params.claimer,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getRedpacketGet',
    description: 'Query red packet information by ID',
    parameters: z.object({
      id: z.string().describe('Red packet ID'),
    }),
    annotations: {
      title: 'Red Packet Query Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRedpacketGet({ id }) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.getRedpacket({ id });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                id,
                result,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to query red packet',
                id,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getRedpacketGetClaims',
    description: 'Query red packet claim records by ID',
    parameters: z.object({
      id: z.string(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.string().optional(),
    }),
    annotations: {
      title: 'Red Packet Claim Record Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRedpacketGetClaims(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.getClaims({
        id: params.id,
        cursor: params.cursor || '',
        limit: params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20,
        direction: params.direction || 'desc',
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                id: params.id,
                result,
                count: result?.records?.length ?? 0,
                pagination: {
                  total: result?.total,
                  hasNextPage: result?.hasNextPage,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to get red packet claim records',
                id: params.id,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }

  @Tool({
    name: 'getRedpacketGetList',
    description: 'Get the red packets list with filters and pagination',
    parameters: z.object({
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.string().optional(),
      creator: z.string().optional(),
      chain: z.string().optional(),
    }),
    annotations: {
      title: 'Red Packet List Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRedpacketGetList(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.getRedpackets({
        cursor: params.cursor || '',
        limit: params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20,
        direction: params.direction || 'desc',
        creator: params.creator || undefined,
        chain: params.chain || undefined,
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                filters: params,
                result,
                count: result?.records?.length ?? 0,
                pagination: {
                  total: result?.total,
                  hasNextPage: result?.hasNextPage,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to get red packet list',
                filters: params,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getRedpacketGetClaimsByAddress',
    description: 'Query red packet claim records by wallet address',
    parameters: z.object({
      address: z.string(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.string().optional(),
    }),
    annotations: {
      title: 'Red Packet Claim Record by Address Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRedpacketGetClaimsByAddress(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.getClaimsByAddress({
        address: params.address,
        cursor: params.cursor || '',
        limit: params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20,
        direction: params.direction || 'desc',
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                address: params.address,
                result,
                count: result?.records?.length ?? 0,
                pagination: {
                  total: result?.total,
                  hasNextPage: result?.hasNextPage,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to get red packet claim records by address',
                address: params.address,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getRedpacketGetByAddress',
    description: 'Get the red packets list created by a specific address',
    parameters: z.object({
      address: z.string(),
      cursor: z.string().optional(),
      limit: z.string().optional(),
      direction: z.string().optional(),
    }),
    annotations: {
      title: 'Red Packet List by Creator Tool',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  })
  async getRedpacketGetByAddress(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.getRedpacketsByAddress({
        address: params.address,
        cursor: params.cursor || '',
        limit: params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20,
        direction: params.direction || 'desc',
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                address: params.address,
                result,
                count: result?.records?.length ?? 0,
                pagination: {
                  total: result?.total,
                  hasNextPage: result?.hasNextPage,
                  startCursor: result?.startCursor,
                  endCursor: result?.endCursor,
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to get red packets by address',
                address: params.address,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  @Tool({
    name: 'getRedpacketSend',
    description: 'Send a signed red packet transaction to the blockchain',
    parameters: z.object({
      chain: z.enum([
        'sol', 'base', 'bsc', 'polygon', 'arbitrum',
        'optimism', 'avalanche', 'ethereum', 'zksync', 'sui',
      ]),
      signedTx: z.string(),
    }),
    annotations: {
      title: 'Red Packet Send Tool',
      destructiveHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  })
  async getRedpacketSend(params) {
    try {
      const authHeader = this.request.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;
      if (!accessToken) throw new Error('Access token is required.');
  
      const dexClient = new DexClient(accessToken);
      const result = await dexClient.redPacket.redpacketSend({
        chain: params.chain,
        redPacketSendTxInput: {
          signedTx: params.signedTx,
        },
      });
  
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                chain: params.chain,
                signature: result?.signature,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
                error: 'Failed to send red packet transaction',
                chain: params.chain,
                message: (error as any).message,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
  
  
}

