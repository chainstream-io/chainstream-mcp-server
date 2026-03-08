import { ChainStreamClient } from '@chainstream-io/sdk';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Tool } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class IpfsTool {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Tool({
    name: 'presign',
    description: 'Create a presigned URL for IPFS content upload',
    annotations: { title: 'IPFS Presign URL', destructiveHint: false, readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  })
  async presign() {
    try {
      const accessToken = this.request.headers.authorization?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.ipfs.presign();
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: true, result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Failed to create presign URL', message: error.message }, null, 2) }],
      };
    }
  }
}
