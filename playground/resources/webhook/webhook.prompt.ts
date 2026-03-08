import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class WebhookPrompt {
  @Prompt({
    name: 'webhook-management-guide',
    description: 'Guide for setting up and managing webhook endpoints for real-time event notifications.',
    parameters: z.object({
      action: z
        .enum(['setup', 'monitor', 'troubleshoot'])
        .describe('What you want to do with webhooks'),
    }),
  })
  getWebhookManagementGuide({ action }) {
    const guides = {
      setup: `To set up a webhook endpoint:
1. Create an endpoint using createEndpoint with your callback URL and desired event channels
2. Save the endpoint ID for future management
3. Get the signing secret using getEndpointSecret to verify incoming webhooks
4. Available channels include: sol.token.created, sol.token.migrated, etc.`,
      monitor: `To monitor your webhooks:
1. List all endpoints using listEndpoints
2. Check individual endpoint status using getEndpoint
3. Review the channels each endpoint is subscribed to
4. Update channels or URL as needed using updateEndpoint`,
      troubleshoot: `To troubleshoot webhook issues:
1. Verify the endpoint is not disabled using getEndpoint
2. Check the signing secret matches using getEndpointSecret
3. Rotate the secret if compromised using rotateEndpointSecret
4. Ensure your callback URL is accessible and returns 2xx status`,
    };

    return {
      description: 'Webhook management guide',
      messages: [
        { role: 'user', content: { type: 'text', text: `How do I ${action} webhooks?` } },
        { role: 'assistant', content: { type: 'text', text: guides[action] } },
      ],
    };
  }
}
