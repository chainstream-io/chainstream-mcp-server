import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class RedpacketPrompt {
  constructor() {}

  @Prompt({
    name: 'redpacket-create-guide',
    description: 'Create a red packet transaction on a specific chain, including creator, mint, claims, and optional settings.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
      creator: z.string().describe('Wallet address of the creator'),
      mint: z.string().describe('Token mint address'),
      maxClaims: z.string().describe('Maximum number of recipients'),
      totalAmount: z.string().optional().describe('Total amount to distribute'),
      fixedAmount: z.string().optional().describe('Fixed amount per claim'),
      memo: z.string().optional().describe('Memo message'),
      password: z.string().optional().describe('Password to claim'),
      claimAuthority: z.string().optional().describe('Authority address to claim'),
    }),
  })
  getRedpacketCreateGuide(params) {
    return {
      description: 'Red packet creation guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please create a red packet on chain ${params.chain} for creator ${params.creator}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will create a red packet with:
  - Creator and mint address
  - Claim quantity and amount
  - Optional memo, password, and claim authority
  
  Please use the getRedpacketCreate tool to generate the transaction.`,
          },
        },
      ],
    };
  }
  

  @Prompt({
    name: 'redpacket-claim-guide',
    description: 'Claim a red packet on a specific chain using claimer address, packet ID, and optional password.',
    parameters: z.object({
      chain: z.string().describe('Chain name (e.g., sol, eth, bsc)'),
      claimer: z.string().describe('Wallet address of the claimer'),
      packetId: z.string().optional().describe('Red packet ID'),
      shareId: z.string().optional().describe('Red packet share ID'),
      password: z.string().optional().describe('Password to claim the red packet'),
    }),
  })
  getRedpacketClaimGuide(params) {
    return {
      description: 'Red packet claim guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please claim a red packet on chain ${params.chain} for wallet ${params.claimer}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will submit a claim request for the red packet including:
  - Claimer wallet address
  - Optional packetId, shareId, and password
  - Chain and authorization
  
  Please use the getRedpacketClaim tool to fetch the transaction.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-get-guide',
    description: 'Query detailed information of a red packet by its ID, including creator, mint, amount, and status.',
    parameters: z.object({
      id: z.string().describe('Red packet ID'),
    }),
  })
  getRedpacketGetGuide({ id }) {
    return {
      description: 'Red packet query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please query red packet information for ID ${id}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve red packet details including:
  - Chain, creator, mint, and total amount
  - Claim status, expiration, and timestamps
  - Claimed and refunded amounts
  
  Please use the getRedpacketGet tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-get-claims-guide',
    description: 'Fetch claim records of a red packet by ID, with pagination and sorting options.',
    parameters: z.object({
      id: z.string().describe('Red packet ID'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of records per page (1–100)'),
      direction: z.string().optional().describe('Sort direction (asc or desc)'),
    }),
  })
  getRedpacketGetClaimsGuide(params) {
    return {
      description: 'Red packet claim record query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch claim records for red packet ${params.id}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve claim records including:
  - Claimer address, amount, and timestamp
  - Pagination metadata (cursor, total, hasNextPage)
  
  Please use the getRedpacketGetClaims tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-get-list-guide',
    description: 'Retrieve a list of red packets with optional filters (creator, chain) and pagination.',
    parameters: z.object({
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of records per page (1–100)'),
      direction: z.string().optional().describe('Sort direction (asc or desc)'),
      creator: z.string().optional().describe('Creator wallet address'),
      chain: z.string().optional().describe('Blockchain network (e.g., sol, eth, bsc)'),
    }),
  })
  getRedpacketGetListGuide(params) {
    return {
      description: 'Red packet list query guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch red packet list${params.chain ? ` on chain ${params.chain}` : ''}${params.creator ? ` created by ${params.creator}` : ''}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve red packet records including:
  - ID, creator, mint, total amount
  - Claim status, expiration, and timestamps
  - Pagination metadata (cursor, total, hasNextPage)
  
  Please use the getRedpacketGetList tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-get-claims-by-address-guide',
    description: 'Query all red packet claim records by a specific wallet address, with pagination.',
    parameters: z.object({
      address: z.string().describe('Claimer wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of records per page (1–100)'),
      direction: z.string().optional().describe('Sort direction (asc or desc)'),
    }),
  })
  getRedpacketGetClaimsByAddressGuide(params) {
    return {
      description: 'Red packet claim record query by address',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch red packet claim records for address ${params.address}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve claim records including:
  - Packet ID, amount, chain, and timestamp
  - Pagination metadata (cursor, total, hasNextPage)
  
  Please use the getRedpacketGetClaimsByAddress tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-get-by-address-guide',
    description: 'Fetch red packets created by a specific wallet address, with pagination and metadata.',
    parameters: z.object({
      address: z.string().describe('Creator wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.string().optional().describe('Number of records per page (1–100)'),
      direction: z.string().optional().describe('Sort direction (asc or desc)'),
    }),
  })
  getRedpacketGetByAddressGuide(params) {
    return {
      description: 'Red packet list query by creator address',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please fetch red packets created by address ${params.address}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will retrieve red packets created by this address, including:
  - ID, chain, mint, total amount
  - Claim status, expiration, and timestamps
  - Pagination metadata (cursor, total, hasNextPage)
  
  Please use the getRedpacketGetByAddress tool to fetch the actual data.`,
          },
        },
      ],
    };
  }
  
  @Prompt({
    name: 'redpacket-send-guide',
    description: 'Send a signed red packet transaction to the blockchain network.',
    parameters: z.object({
      chain: z.string().describe('Blockchain network (e.g., sol, eth, bsc)'),
      signedTx: z.string().describe('Signed transaction hash'),
    }),
  })
  getRedpacketSendGuide(params) {
    return {
      description: 'Red packet transaction send guide',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please send a signed red packet transaction on chain ${params.chain}.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `I will submit the signed transaction to the ${params.chain} network and return the resulting signature.
  
  Please use the getRedpacketSend tool to execute the transaction.`,
          },
        },
      ],
    };
  }
  
}