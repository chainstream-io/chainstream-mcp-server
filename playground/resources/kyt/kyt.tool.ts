import { ChainStreamClient, KytNetwork, TransferDirection } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class KytTool {
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
    name: 'registerTransfer',
    description: 'Register a deposit/transfer transaction for KYT risk assessment',
    parameters: z.object({
      network: z.enum(['Solana', 'bitcoin', 'ethereum']).describe('Blockchain network'),
      asset: z.string().describe('Asset symbol (e.g. BTC, ETH, SOL)'),
      transferReference: z.string().describe('Transaction hash/signature'),
      direction: z.enum(['sent', 'received']).describe('Transfer direction'),
    }),
    annotations: { title: 'KYT Register Transfer', destructiveHint: false, readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  })
  async registerTransfer({ network, asset, transferReference, direction }: {
    network: KytNetwork; asset: string; transferReference: string; direction: TransferDirection;
  }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.registerTransfer({ network, asset, transferReference, direction });
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to register transfer', error.message);
    }
  }

  @Tool({
    name: 'getTransferSummary',
    description: 'Get risk summary for a registered transfer',
    parameters: z.object({
      transferId: z.string().describe('Transfer ID from registration'),
    }),
    annotations: { title: 'KYT Transfer Summary', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getTransferSummary({ transferId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getTransferSummary(transferId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get transfer summary', error.message);
    }
  }

  @Tool({
    name: 'getTransferAlerts',
    description: 'Get risk alerts for a registered transfer',
    parameters: z.object({
      transferId: z.string().describe('Transfer ID'),
    }),
    annotations: { title: 'KYT Transfer Alerts', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getTransferAlerts({ transferId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getTransferAlerts(transferId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get transfer alerts', error.message);
    }
  }

  @Tool({
    name: 'getTransferDirectExposure',
    description: 'Get direct risk exposure for a transfer',
    parameters: z.object({
      transferId: z.string().describe('Transfer ID'),
    }),
    annotations: { title: 'KYT Transfer Direct Exposure', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getTransferDirectExposure({ transferId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getTransferDirectExposure(transferId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get transfer exposure', error.message);
    }
  }

  @Tool({
    name: 'getTransferNetworkIdentifications',
    description: 'Get network identifications for a transfer',
    parameters: z.object({
      transferId: z.string().describe('Transfer ID'),
    }),
    annotations: { title: 'KYT Transfer Network IDs', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getTransferNetworkIdentifications({ transferId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getTransferNetworkIdentifications(transferId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get network identifications', error.message);
    }
  }

  @Tool({
    name: 'registerWithdrawal',
    description: 'Register a withdrawal for KYT risk assessment',
    parameters: z.object({
      network: z.enum(['Solana', 'bitcoin', 'ethereum']).describe('Blockchain network'),
      address: z.string().describe('Destination address of the withdrawal'),
      asset: z.string().describe('Asset symbol'),
      assetAmount: z.string().describe('Asset amount'),
      attemptTimestamp: z.string().describe('Attempt timestamp (ISO 8601)'),
      assetDenomination: z.string().optional().describe('Asset denomination'),
      assetId: z.string().optional().describe('Asset ID'),
      assetPrice: z.string().optional().describe('Asset price at the time'),
      memo: z.string().optional().describe('Memo/note'),
    }),
    annotations: { title: 'KYT Register Withdrawal', destructiveHint: false, readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  })
  async registerWithdrawal({ network, address, asset, assetAmount, attemptTimestamp, assetDenomination, assetId, assetPrice, memo }: {
    network: KytNetwork; address: string; asset: string; assetAmount: string; attemptTimestamp: string;
    assetDenomination?: string; assetId?: string; assetPrice?: string; memo?: string;
  }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.registerWithdrawal({
        network, address, asset, assetAmount, attemptTimestamp,
        assetDenomination, assetId, assetPrice, memo,
      });
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to register withdrawal', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalSummary',
    description: 'Get risk summary for a registered withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Summary', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalSummary({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalSummary(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get withdrawal summary', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalAlerts',
    description: 'Get risk alerts for a withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Alerts', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalAlerts({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalAlerts(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get withdrawal alerts', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalDirectExposure',
    description: 'Get direct risk exposure for a withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Direct Exposure', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalDirectExposure({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalDirectExposure(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get withdrawal exposure', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalFraudAssessment',
    description: 'Get fraud assessment for a withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Fraud Assessment', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalFraudAssessment({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalFraudAssessment(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get fraud assessment', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalAddressIdentifications',
    description: 'Get address identifications for a withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Address IDs', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalAddressIdentifications({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalAddressIdentifications(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get address identifications', error.message);
    }
  }

  @Tool({
    name: 'getWithdrawalNetworkIdentifications',
    description: 'Get network identifications for a withdrawal',
    parameters: z.object({ withdrawalId: z.string().describe('Withdrawal ID') }),
    annotations: { title: 'KYT Withdrawal Network IDs', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getWithdrawalNetworkIdentifications({ withdrawalId }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getWithdrawalNetworkIdentifications(withdrawalId);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get network identifications', error.message);
    }
  }

  @Tool({
    name: 'registerAddress',
    description: 'Register an address for KYT monitoring and risk assessment',
    parameters: z.object({
      address: z.string().describe('Address to register'),
    }),
    annotations: { title: 'KYT Register Address', destructiveHint: false, readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  })
  async registerAddress({ address }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.registerAddress({ address });
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to register address', error.message);
    }
  }

  @Tool({
    name: 'getAddressRisk',
    description: 'Get risk assessment result for a registered address',
    parameters: z.object({
      address: z.string().describe('Address to check'),
    }),
    annotations: { title: 'KYT Address Risk', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getAddressRisk({ address }) {
    try {
      const client = this.getClient();
      const result = await client.kyt.getAddressRisk(address);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get address risk', error.message);
    }
  }
}
