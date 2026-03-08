import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WalletResource {
  private getClient(req: Request): ChainStreamClient {
    const accessToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      throw new Error('Access token is required.');
    }
    return new ChainStreamClient(accessToken);
  }

  private respond(uri: string, data: any) {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  @ResourceTemplate({
    name: 'getTokensBalance',
    description: `Get wallet token balances on a specific chain.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/tokens-balance/{chain}/{walletAddress}',
  })
  async getTokensBalance(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getTokensBalance(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get tokens balance',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getPnl',
    description: `Get wallet PnL summary on a specific chain.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/pnl/{chain}/{walletAddress}',
  })
  async getPnl(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getPnl(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get PnL summary',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getPnlDetails',
    description: `Get per-token PnL breakdown for a wallet.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/pnl-details/{chain}/{walletAddress}',
  })
  async getPnlDetails(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getPnlDetails(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get PnL details',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getPnlByToken',
    description: `Get PnL for specific tokens in a wallet. Use the tool version to specify token addresses.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/pnl-by-token/{chain}/{walletAddress}',
  })
  async getPnlByToken(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getPnlByToken(chain, walletAddress, {
        tokenAddresses: '',
      });
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get PnL by token',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getPnlByWallet',
    description: `Get PnL across multiple wallets. Use the tool version to specify wallet and token addresses.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/pnl-by-wallet/{chain}',
  })
  async getPnlByWallet(req: Request, { uri, chain }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getPnlByWallet(chain, {
        walletAddresses: '',
        tokenAddress: '',
      });
      return this.respond(uri, { chain, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get PnL by wallet',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'calculatePnl',
    description: `Trigger PnL calculation for a wallet.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/calculate-pnl/{chain}/{walletAddress}',
  })
  async calculatePnl(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.calculatePnl(chain, walletAddress, {});
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to calculate PnL',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getNetWorth',
    description: `Get wallet net worth with token holdings.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/net-worth/{chain}/{walletAddress}',
  })
  async getNetWorth(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getNetWorth(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get net worth',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getNetWorthDetails',
    description: `Get detailed net worth breakdown for a wallet.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/net-worth-details/{chain}/{walletAddress}',
  })
  async getNetWorthDetails(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getNetWorthDetails(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get net worth details',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getNetWorthChart',
    description: `Get historical net worth chart data for a wallet.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/net-worth-chart/{chain}/{walletAddress}',
  })
  async getNetWorthChart(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getNetWorthChart(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get net worth chart',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getNetWorthByTokens',
    description: `Get net worth by specific tokens. Use the tool version to specify token addresses.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/net-worth-by-tokens/{chain}/{walletAddress}',
  })
  async getNetWorthByTokens(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getNetWorthByTokens(
        chain,
        walletAddress,
        { tokenAddresses: '' },
      );
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get net worth by tokens',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getNetWorthSummary',
    description: `Get multi-wallet net worth summary. Use the tool version to specify wallet addresses.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/net-worth-summary/{chain}',
  })
  async getNetWorthSummary(req: Request, { uri, chain }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getNetWorthSummary(chain, {
        walletAddresses: '',
      });
      return this.respond(uri, { chain, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get net worth summary',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getBalanceUpdates',
    description: `Get balance change history for a wallet.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/balance-updates/{chain}/{walletAddress}',
  })
  async getBalanceUpdates(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getBalanceUpdates(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get balance updates',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getWalletTransfers',
    description: `Get wallet transfer history.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/transfers/{chain}/{walletAddress}',
  })
  async getWalletTransfers(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getWalletTransfers(chain, walletAddress);
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get wallet transfers',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getWalletTransferTotal',
    description: `Get wallet transfer total count.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/transfer-total/{chain}/{walletAddress}',
  })
  async getWalletTransferTotal(req: Request, { uri, chain, walletAddress }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getWalletTransferTotal(
        chain,
        walletAddress,
      );
      return this.respond(uri, { chain, walletAddress, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get wallet transfer total',
        message: (error as any).message,
      });
    }
  }

  @ResourceTemplate({
    name: 'getWalletFirstTx',
    description: `Get first funded transaction for wallets. Use the tool version to specify wallet addresses.

🔐 Authentication Required`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/wallet/first-tx/{chain}',
  })
  async getWalletFirstTx(req: Request, { uri, chain }) {
    try {
      const client = this.getClient(req);
      const data = await client.wallet.getWalletFirstTx(chain, {
        walletAddresses: '',
      });
      return this.respond(uri, { chain, data });
    } catch (error: unknown) {
      return this.respond(uri, {
        error: 'Failed to get wallet first transaction',
        message: (error as any).message,
      });
    }
  }
}
