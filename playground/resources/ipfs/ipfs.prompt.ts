import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class IpfsPrompt {
  @Prompt({
    name: 'ipfs-upload-guide',
    description: 'Guide for uploading content to IPFS using presigned URLs.',
    parameters: z.object({
      contentType: z.enum(['image', 'metadata', 'other']).describe('Type of content to upload'),
    }),
  })
  getIpfsUploadGuide({ contentType }) {
    return {
      description: 'IPFS upload guide',
      messages: [
        { role: 'user', content: { type: 'text', text: `How do I upload ${contentType} to IPFS?` } },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To upload ${contentType} to IPFS:
1. Get a presigned URL using the presign tool
2. Upload your ${contentType} file to the presigned URL using a PUT request
3. The response will contain the IPFS CID/hash for your content
4. Use the IPFS URL in your token metadata or other on-chain references`,
          },
        },
      ],
    };
  }
}
