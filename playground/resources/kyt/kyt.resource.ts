import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class KytResource {
  @ResourceTemplate({
    name: 'getTransferSummary',
    description: `Get transfer risk summary.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-transfers-transferid-summary-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/transfer/{transferId}/summary',
  })
  async getTransferSummary(req: Request, { uri, transferId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getTransferSummary(transferId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get transfer summary', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTransferAlerts',
    description: `Get transfer risk alerts.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-transfers-transferid-alerts-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/transfer/{transferId}/alerts',
  })
  async getTransferAlerts(req: Request, { uri, transferId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getTransferAlerts(transferId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get transfer alerts', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTransferDirectExposure',
    description: `Get transfer direct risk exposure.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-transfers-transferid-exposures-direct-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/transfer/{transferId}/exposures/direct',
  })
  async getTransferDirectExposure(req: Request, { uri, transferId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getTransferDirectExposure(transferId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get transfer exposure', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getTransferNetworkIdentifications',
    description: `Get transfer network identifications.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-transfers-transferid-network-identifications-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/transfer/{transferId}/network-identifications',
  })
  async getTransferNetworkIdentifications(req: Request, { uri, transferId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getTransferNetworkIdentifications(transferId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get network identifications', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalSummary',
    description: `Get withdrawal risk summary.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-summary-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/summary',
  })
  async getWithdrawalSummary(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalSummary(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get withdrawal summary', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalAlerts',
    description: `Get withdrawal risk alerts.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-alerts-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/alerts',
  })
  async getWithdrawalAlerts(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalAlerts(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get withdrawal alerts', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalDirectExposure',
    description: `Get withdrawal direct risk exposure.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-exposures-direct-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/exposures/direct',
  })
  async getWithdrawalDirectExposure(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalDirectExposure(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get withdrawal exposure', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalFraudAssessment',
    description: `Get withdrawal fraud assessment.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-fraud-assessment-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/fraud-assessment',
  })
  async getWithdrawalFraudAssessment(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalFraudAssessment(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get fraud assessment', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalAddressIdentifications',
    description: `Get withdrawal address identifications.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-address-identifications-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/address-identifications',
  })
  async getWithdrawalAddressIdentifications(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalAddressIdentifications(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get address identifications', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getWithdrawalNetworkIdentifications',
    description: `Get withdrawal network identifications.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-withdrawal-withdrawalid-network-identifications-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/withdrawal/{withdrawalId}/network-identifications',
  })
  async getWithdrawalNetworkIdentifications(req: Request, { uri, withdrawalId }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getWithdrawalNetworkIdentifications(withdrawalId);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get network identifications', message: error.message }, null, 2) }],
      };
    }
  }

  @ResourceTemplate({
    name: 'getAddressRisk',
    description: `Get risk assessment for a registered address.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/kyt/v2/kyt-addresses-address-risk-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/kyt/address/{address}/risk',
  })
  async getAddressRisk(req: Request, { uri, address }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.kyt.getAddressRisk(address);
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get address risk', message: error.message }, null, 2) }],
      };
    }
  }
}
