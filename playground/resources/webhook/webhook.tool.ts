import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { z } from 'zod';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WebhookTool {
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
    name: 'listEndpoints',
    description: 'List all configured webhook endpoints',
    annotations: { title: 'Webhook List Endpoints', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async listEndpoints() {
    try {
      const client = this.getClient();
      const result = await client.webhook.listEndpoints();
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to list endpoints', error.message);
    }
  }

  @Tool({
    name: 'createEndpoint',
    description: 'Create a new webhook endpoint',
    parameters: z.object({
      url: z.string().describe('Webhook callback URL'),
      description: z.string().optional().describe('Endpoint description'),
      channels: z.array(z.string()).optional().describe('Event channels to subscribe to'),
    }),
    annotations: { title: 'Webhook Create Endpoint', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async createEndpoint({ url, description, channels }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.createEndpoint({ url, description, channels });
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to create endpoint', error.message);
    }
  }

  @Tool({
    name: 'getEndpoint',
    description: 'Get webhook endpoint details',
    parameters: z.object({
      id: z.string().describe('Endpoint ID'),
    }),
    annotations: { title: 'Webhook Get Endpoint', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getEndpoint({ id }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.getEndpoint(id);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get endpoint', error.message);
    }
  }

  @Tool({
    name: 'updateEndpoint',
    description: 'Update webhook endpoint configuration',
    parameters: z.object({
      id: z.string().describe('Endpoint ID'),
      url: z.string().optional().describe('New callback URL'),
      description: z.string().optional().describe('New description'),
      channels: z.array(z.string()).optional().describe('New event channels'),
      disabled: z.boolean().optional().describe('Whether to disable the endpoint'),
    }),
    annotations: { title: 'Webhook Update Endpoint', destructiveHint: true, readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  })
  async updateEndpoint({ id, url, description, channels, disabled }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.updateEndpoint({ endpointId: id, url, description, channels, disabled });
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to update endpoint', error.message);
    }
  }

  @Tool({
    name: 'deleteEndpoint',
    description: 'Delete a webhook endpoint',
    parameters: z.object({
      id: z.string().describe('Endpoint ID'),
    }),
    annotations: { title: 'Webhook Delete Endpoint', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async deleteEndpoint({ id }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.deleteEndpoint(id);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to delete endpoint', error.message);
    }
  }

  @Tool({
    name: 'getEndpointSecret',
    description: 'Get webhook endpoint signing secret',
    parameters: z.object({
      id: z.string().describe('Endpoint ID'),
    }),
    annotations: { title: 'Webhook Get Secret', destructiveHint: false, readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  })
  async getEndpointSecret({ id }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.getEndpointSecret(id);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to get endpoint secret', error.message);
    }
  }

  @Tool({
    name: 'rotateEndpointSecret',
    description: 'Rotate webhook endpoint signing secret',
    parameters: z.object({
      id: z.string().describe('Endpoint ID'),
    }),
    annotations: { title: 'Webhook Rotate Secret', destructiveHint: true, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async rotateEndpointSecret({ id }) {
    try {
      const client = this.getClient();
      const result = await client.webhook.rotateEndpointSecret(id);
      return this.success({ result });
    } catch (error: any) {
      return this.fail('Failed to rotate endpoint secret', error.message);
    }
  }
}
