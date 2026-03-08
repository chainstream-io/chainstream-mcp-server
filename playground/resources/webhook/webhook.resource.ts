import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WebhookResource {
  @ResourceTemplate({
    name: 'listEndpoints',
    description: `List all webhook endpoints.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/webhook/v2/webhook-endpoint-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/webhook/endpoints',
  })
  async listEndpoints(req: Request, { uri }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.webhook.listEndpoints();
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }] };
    } catch (error: any) {
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to list endpoints', message: error.message }, null, 2) }] };
    }
  }

  @ResourceTemplate({
    name: 'getEndpoint',
    description: `Get webhook endpoint details.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/webhook/v2/webhook-endpoint-id-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/webhook/endpoint/{id}',
  })
  async getEndpoint(req: Request, { uri, id }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.webhook.getEndpoint(id);
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }] };
    } catch (error: any) {
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get endpoint', message: error.message }, null, 2) }] };
    }
  }

  @ResourceTemplate({
    name: 'getEndpointSecret',
    description: `Get webhook endpoint signing secret.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/webhook/v2/webhook-endpoint-id-secret-get`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/webhook/endpoint/{id}/secret',
  })
  async getEndpointSecret(req: Request, { uri, id }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.webhook.getEndpointSecret(id);
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }] };
    } catch (error: any) {
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to get endpoint secret', message: error.message }, null, 2) }] };
    }
  }
}
