import { SetMetadata } from '@nestjs/common';

export const MCP_SAMPLING_METADATA_KEY = 'mcp:sampling';

export interface SamplingOptions {
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export const Sampling = (options: SamplingOptions): MethodDecorator =>
  SetMetadata(MCP_SAMPLING_METADATA_KEY, options);
