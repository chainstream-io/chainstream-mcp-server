import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MCP_ELICITATION_METADATA_KEY, type ElicitationOptions } from '../../decorators/elicitation.decorator';

@Injectable()
export class McpElicitationHandler {
  private readonly logger = new Logger(McpElicitationHandler.name);

  constructor(private reflector: Reflector) {}

  getElicitationOptions(target: any, methodName: string): ElicitationOptions | undefined {
    return this.reflector.get<ElicitationOptions>(
      MCP_ELICITATION_METADATA_KEY,
      target[methodName],
    );
  }

  /**
   * Request user confirmation before executing a high-risk tool.
   * Uses MCP Elicitation protocol (elicitation/create).
   *
   * For L3 tools (dex/swap, trading/execute, dex/createToken):
   * 1. Build confirmation message with trade details
   * 2. Send elicitation/create to client with requestedSchema
   * 3. Wait for user response (confirm/deny + optional parameter adjustments)
   * 4. Return the user's decision
   */
  async requestConfirmation(
    mcpServer: any,
    options: ElicitationOptions,
    tradeDetails?: Record<string, unknown>,
  ): Promise<{ confirmed: boolean; adjustedParams?: Record<string, unknown> }> {
    if (!mcpServer?.createElicitation) {
      this.logger.warn('Client does not support elicitation — falling back to auto-deny for L3 tools');
      return { confirmed: false };
    }

    try {
      const message = tradeDetails
        ? `${options.message}\n\nDetails:\n${Object.entries(tradeDetails).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`
        : options.message;

      const response = await mcpServer.createElicitation({
        message,
        requestedSchema: options.requestedSchema ?? {
          type: 'object',
          properties: {
            confirm: { type: 'boolean', description: 'Confirm this action?' },
            max_slippage: { type: 'number', description: 'Maximum slippage %', default: 3.0 },
          },
          required: ['confirm'],
        },
      });

      const confirmed = response?.content?.confirm === true;
      this.logger.log(`Elicitation result: confirmed=${confirmed}`);

      return {
        confirmed,
        adjustedParams: response?.content,
      };
    } catch (err) {
      this.logger.error('Elicitation request failed:', err);
      return { confirmed: false };
    }
  }
}
