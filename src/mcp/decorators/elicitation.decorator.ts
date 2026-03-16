import { SetMetadata } from '@nestjs/common';

export const MCP_ELICITATION_METADATA_KEY = 'mcp:elicitation';

export interface ElicitationOptions {
  message: string;
  requestedSchema?: Record<string, unknown>;
}

export const Elicitation = (options: ElicitationOptions): MethodDecorator =>
  SetMetadata(MCP_ELICITATION_METADATA_KEY, options);
