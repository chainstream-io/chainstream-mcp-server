import { DexClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { Resource, ResourceTemplate } from '../../../dist';

// Define supported chain types based on SDK
type SupportedChain = 'sol' | 'base' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'ethereum' | 'zksync' | 'sui';

const allowedChains = [
    'sol', 'base', 'bsc', 'polygon', 'arbitrum',
    'optimism', 'avalanche', 'ethereum', 'zksync', 'sui',
  ] as const;
@Injectable({ scope: Scope.REQUEST })
export class RedpacketResource {

    @ResourceTemplate({
        name: 'getRedpacketCreate',
        description: `Create a new red packet with specified amount and quantity.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-chain-create-post`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/create/{chain}?creator={creator}&mint={mint}&maxClaims={maxClaims}&totalAmount={totalAmount}&fixedAmount={fixedAmount}&memo={memo}&password={password}&claimAuthority={claimAuthority}',
      })
      async getRedpacketCreate(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const creator = url.searchParams.get('creator');
          const mint = url.searchParams.get('mint');
          const maxClaims = url.searchParams.get('maxClaims');
      
          if (!creator || !mint || !maxClaims) {
            throw new Error('creator, mint, and maxClaims are required.');
          }
      
          const createRedPacketInput = {
            creator,
            mint,
            maxClaims: Number(maxClaims),
            totalAmount: url.searchParams.get('totalAmount') || undefined,
            fixedAmount: url.searchParams.get('fixedAmount') || undefined,
            memo: url.searchParams.get('memo') || undefined,
            password: url.searchParams.get('password') || undefined,
            claimAuthority: url.searchParams.get('claimAuthority') || undefined,
          };
      
          Object.keys(createRedPacketInput).forEach(
            key => createRedPacketInput[key] === undefined && delete createRedPacketInput[key]
          );
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.createRedpacket({
            chain: chain as SupportedChain,
            createRedPacketInput,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    creator,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to create red packet',
                    chain,
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

    @ResourceTemplate({
        name: 'getRedpacketClaim',
        description: `Claim tokens from an existing red packet.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-chain-claim-post`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/claim/{chain}?claimer={claimer}&packetId={packetId}&shareId={shareId}&password={password}',
      })
      async getRedpacketClaim(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const claimer = url.searchParams.get('claimer');
          if (!claimer) {
            throw new Error('claimer is required.');
          }
      
          const claimRedPacketInput = {
            claimer,
            packetId: url.searchParams.get('packetId') || undefined,
            shareId: url.searchParams.get('shareId') || undefined,
            password: url.searchParams.get('password') || undefined,
          };
      
          // 🧹 清理 undefined 字段
          Object.keys(claimRedPacketInput).forEach(
            key => claimRedPacketInput[key] === undefined && delete claimRedPacketInput[key]
          );
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.claimRedpacket({
            chain: chain as SupportedChain,
            claimRedPacketInput,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    claimer,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to claim red packet',
                    chain,
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

      @ResourceTemplate({
        name: 'getRedpacketGet',
        description: `Query red packet information by ID.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-id-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/get/{id}',
      })
      async getRedpacketGet(req: Request, { uri, id }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.getRedpacket({ id });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
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

      @ResourceTemplate({
        name: 'getRedpacketGetClaims',
        description: `Query red packet claim records by ID.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-id-claims-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/getClaims/{id}?cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getRedpacketGetClaims(req: Request, { uri, id }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const cursor = url.searchParams.get('cursor') || '';
          const limit = url.searchParams.get('limit') ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 100) : 20;
          const direction = url.searchParams.get('direction') || 'desc';
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.getClaims({
            id,
            cursor,
            limit,
            direction,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    id,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get red packet claim records',
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

      @ResourceTemplate({
        name: 'getRedpacketGetList',
        description: `Get the red packets list with filters and pagination.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/list?cursor={cursor}&limit={limit}&direction={direction}&creator={creator}&chain={chain}',
      })
      async getRedpacketGetList(req: Request, { uri }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          
          const url = new URL(uri);

          
          const rawChain = url.searchParams.get('chain');
          const chain = allowedChains.includes(rawChain as any)
            ? (rawChain as typeof allowedChains[number])
            : undefined;
          

          const queryParams = {
            cursor: url.searchParams.get('cursor') || '',
            limit: url.searchParams.get('limit') ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 100) : 20,
            direction: url.searchParams.get('direction') || 'desc',
            creator: url.searchParams.get('creator') || undefined,
            chain
          };
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.getRedpackets({
            ...queryParams,
            chain,
          });
          
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    filters: queryParams,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get red packet list',
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
         
      
      @ResourceTemplate({
        name: 'getRedpacketGetClaimsByAddress',
        description: `Query red packet claim records by wallet address.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-wallet-address-claims-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/getClaimsByAddress/{address}?cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getRedpacketGetClaimsByAddress(req: Request, { uri, address }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const cursor = url.searchParams.get('cursor') || '';
          const limit = url.searchParams.get('limit') ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 100) : 20;
          const direction = url.searchParams.get('direction') || 'desc';
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.getClaimsByAddress({
            address,
            cursor,
            limit,
            direction,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    address,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get red packet claim records by address',
                    address,
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
      
      @ResourceTemplate({
        name: 'getRedpacketGetByAddress',
        description: `Get the red packets list created by a specific address.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-wallet-address-redpackets-get`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/getRedpacketsByAddress/{address}?cursor={cursor}&limit={limit}&direction={direction}',
      })
      async getRedpacketGetByAddress(req: Request, { uri, address }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const cursor = url.searchParams.get('cursor') || '';
          const limit = url.searchParams.get('limit') ? Math.min(Math.max(Number(url.searchParams.get('limit')), 1), 100) : 20;
          const direction = url.searchParams.get('direction') || 'desc';
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.getRedpacketsByAddress({
            address,
            cursor,
            limit,
            direction,
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    address,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to get red packets by address',
                    address,
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
      

      @ResourceTemplate({
        name: 'getRedpacketSend',
        description: `Send a signed red packet transaction to the blockchain.
      
      🔐 Authentication Required
      
      **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/redpacket/v1/redpacket-chain-send-post`,
        mimeType: 'application/json',
        uriTemplate: 'mcp://dex/redpacket/send/{chain}?signedTx={signedTx}',
      })
      async getRedpacketSend(req: Request, { uri, chain }) {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1];
          if (!accessToken) {
            throw new Error('Access token is required.');
          }
      
          const url = new URL(uri);
          const signedTx = url.searchParams.get('signedTx');
          if (!signedTx) {
            throw new Error('signedTx is required.');
          }
      
          const dexClient = new DexClient(accessToken);
          const result = await dexClient.redPacket.redpacketSend({
            chain: chain as SupportedChain,
            redPacketSendTxInput: {
              signedTx,
            },
          });
      
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    chain,
                    signedTx,
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
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    error: 'Failed to send red packet transaction',
                    chain,
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