import { ChainStreamClient } from '@chainstream-io/sdk';
import { Injectable, Scope } from '@nestjs/common';
import { ResourceTemplate } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class IpfsResource {
  @ResourceTemplate({
    name: 'presign',
    description: `Create a presigned URL for IPFS content upload.

        🔐 Authentication Required

        **API Docs**: https://docs.chainstream.io/en/api-reference/endpoint/data/ipfs/v2/ipfs-presign-post`,
    mimeType: 'application/json',
    uriTemplate: 'mcp://dex/ipfs/presign',
  })
  async presign(req: Request, { uri }) {
    try {
      const accessToken = req.headers.get('Authorization')?.split(' ')[1];
      if (!accessToken) throw new Error('Access token is required.');
      const client = new ChainStreamClient(accessToken);
      const result = await client.ipfs.presign();
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ result, timestamp: new Date().toISOString() }, null, 2) }],
      };
    } catch (error: any) {
      return {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ error: 'Failed to create presign URL', message: error.message }, null, 2) }],
      };
    }
  }
}
