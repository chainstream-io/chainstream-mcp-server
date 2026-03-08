import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WalletTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  private getClient(): ChainStreamClient {
    const accessToken = this.request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new Error('Access token is required.');
    }
    return new ChainStreamClient(accessToken);
  }

  private success(data: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, ...data }, null, 2),
        },
      ],
    };
  }

  private fail(error: string, message: string) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error, message }, null, 2),
        },
      ],
    };
  }

  @Tool({
    name: 'getTokensBalance',
    description: 'Get wallet token balances on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier (e.g. sol, eth, base, bsc, polygon, arbitrum, optimism, avalanche, zksync, sui)'),
      walletAddress: z.string().describe('Wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet Tokens Balance',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getTokensBalance({ chain, walletAddress, cursor, limit, direction }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getTokensBalance(chain, walletAddress, {
        cursor,
        limit,
        direction,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get tokens balance', (error as any).message);
    }
  }

  @Tool({
    name: 'getPnl',
    description: 'Get wallet PnL summary on a specific chain',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      resolution: z
        .enum(['1d', '7d', '30d', 'all'])
        .optional()
        .describe('Time resolution'),
    }),
    annotations: {
      title: 'Wallet PnL Summary',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getPnl({ chain, walletAddress, resolution }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getPnl(chain, walletAddress, {
        resolution,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get PnL summary', (error as any).message);
    }
  }

  @Tool({
    name: 'getPnlDetails',
    description: 'Get per-token PnL breakdown for a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet PnL Details',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getPnlDetails({ chain, walletAddress, cursor, limit, direction }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getPnlDetails(chain, walletAddress, {
        cursor,
        limit,
        direction,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get PnL details', (error as any).message);
    }
  }

  @Tool({
    name: 'getPnlByToken',
    description: 'Get PnL for specific tokens in a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      tokenAddresses: z
        .array(z.string())
        .describe('List of token contract addresses'),
    }),
    annotations: {
      title: 'Wallet PnL By Token',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getPnlByToken({ chain, walletAddress, tokenAddresses }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getPnlByToken(chain, walletAddress, {
        tokenAddresses,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get PnL by token', (error as any).message);
    }
  }

  @Tool({
    name: 'getPnlByWallet',
    description: 'Get PnL for a token across multiple wallets',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddresses: z
        .array(z.string())
        .describe('List of wallet addresses'),
      tokenAddress: z.string().describe('Token contract address'),
    }),
    annotations: {
      title: 'PnL By Wallet',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getPnlByWallet({ chain, walletAddresses, tokenAddress }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getPnlByWallet(chain, {
        walletAddresses,
        tokenAddress,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get PnL by wallet', (error as any).message);
    }
  }

  @Tool({
    name: 'calculatePnl',
    description: 'Trigger PnL calculation for a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      tokenAddresses: z
        .array(z.string())
        .optional()
        .describe('Token addresses to calculate PnL for'),
    }),
    annotations: {
      title: 'Calculate PnL',
      destructiveHint: true,
      readOnlyHint: false,
      idempotentHint: true,
    },
  })
  async calculatePnl({ chain, walletAddress, tokenAddresses }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.calculatePnl(chain, walletAddress, {
        tokenAddresses,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to calculate PnL', (error as any).message);
    }
  }

  @Tool({
    name: 'getNetWorth',
    description: 'Get wallet net worth with token holdings',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet Net Worth',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getNetWorth({ chain, walletAddress, cursor, limit, direction }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getNetWorth(chain, walletAddress, {
        cursor,
        limit,
        direction,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail('Failed to get net worth', (error as any).message);
    }
  }

  @Tool({
    name: 'getNetWorthDetails',
    description: 'Get detailed net worth breakdown for a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet Net Worth Details',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getNetWorthDetails({
    chain,
    walletAddress,
    cursor,
    limit,
    direction,
  }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getNetWorthDetails(
        chain,
        walletAddress,
        { cursor, limit, direction },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get net worth details',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getNetWorthChart',
    description: 'Get historical net worth chart data for a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      hours: z.number().optional().describe('Number of hours of history to retrieve'),
    }),
    annotations: {
      title: 'Wallet Net Worth Chart',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getNetWorthChart({ chain, walletAddress, hours }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getNetWorthChart(
        chain,
        walletAddress,
        { hours },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get net worth chart',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getNetWorthByTokens',
    description: 'Get net worth breakdown by specific tokens',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      tokenAddresses: z
        .array(z.string())
        .describe('List of token contract addresses'),
    }),
    annotations: {
      title: 'Net Worth By Tokens',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getNetWorthByTokens({ chain, walletAddress, tokenAddresses }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getNetWorthByTokens(
        chain,
        walletAddress,
        { tokenAddresses },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get net worth by tokens',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getNetWorthSummary',
    description: 'Get multi-wallet net worth summary',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddresses: z
        .array(z.string())
        .describe('List of wallet addresses'),
    }),
    annotations: {
      title: 'Multi-Wallet Net Worth Summary',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getNetWorthSummary({ chain, walletAddresses }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getNetWorthSummary(chain, {
        walletAddresses,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get net worth summary',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getBalanceUpdates',
    description: 'Get balance change history for a wallet',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet Balance Updates',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getBalanceUpdates({ chain, walletAddress, cursor, limit, direction }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getBalanceUpdates(
        chain,
        walletAddress,
        { cursor, limit, direction },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get balance updates',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getWalletTransfers',
    description: 'Get wallet transfer history',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      tokenAddress: z.string().optional().describe('Filter by token address'),
      cursor: z.string().optional().describe('Pagination cursor'),
      limit: z.number().optional().describe('Results per page'),
      direction: z.string().optional().describe('Sort direction'),
    }),
    annotations: {
      title: 'Wallet Transfers',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getWalletTransfers({
    chain,
    walletAddress,
    tokenAddress,
    cursor,
    limit,
    direction,
  }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getWalletTransfers(
        chain,
        walletAddress,
        { tokenAddress, cursor, limit, direction },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get wallet transfers',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getWalletTransferTotal',
    description: 'Get wallet transfer total count',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddress: z.string().describe('Wallet address'),
      tokenAddress: z.string().optional().describe('Filter by token address'),
    }),
    annotations: {
      title: 'Wallet Transfer Total',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getWalletTransferTotal({ chain, walletAddress, tokenAddress }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getWalletTransferTotal(
        chain,
        walletAddress,
        { tokenAddress },
      );
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get wallet transfer total',
        (error as any).message,
      );
    }
  }

  @Tool({
    name: 'getWalletFirstTx',
    description: 'Get first funded transaction for wallets',
    parameters: z.object({
      chain: z.string().describe('Blockchain identifier'),
      walletAddresses: z
        .array(z.string())
        .describe('List of wallet addresses'),
    }),
    annotations: {
      title: 'Wallet First Transaction',
      destructiveHint: false,
      readOnlyHint: true,
      idempotentHint: true,
    },
  })
  async getWalletFirstTx({ chain, walletAddresses }) {
    try {
      const client = this.getClient();
      const data = await client.wallet.getWalletFirstTx(chain, {
        walletAddresses,
      });
      return this.success({ data });
    } catch (error: unknown) {
      return this.fail(
        'Failed to get wallet first transaction',
        (error as any).message,
      );
    }
  }
}
