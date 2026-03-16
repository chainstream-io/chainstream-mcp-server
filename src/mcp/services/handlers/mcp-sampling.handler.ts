import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MCP_SAMPLING_METADATA_KEY, type SamplingOptions } from '../../decorators/sampling.decorator';

@Injectable()
export class McpSamplingHandler {
  private readonly logger = new Logger(McpSamplingHandler.name);

  constructor(private reflector: Reflector) {}

  getSamplingOptions(target: any, methodName: string): SamplingOptions | undefined {
    return this.reflector.get<SamplingOptions>(
      MCP_SAMPLING_METADATA_KEY,
      target[methodName],
    );
  }

  /**
   * Execute sampling-enhanced tool call.
   *
   * When a tool is decorated with @Sampling and called with analyze=true:
   * 1. Execute the original tool handler to get raw data
   * 2. Send raw data + system prompt to client LLM via sampling/createMessage
   * 3. Merge raw data with AI analysis and return combined result
   */
  async executeWithSampling(
    mcpServer: any,
    rawData: unknown,
    options: SamplingOptions,
  ): Promise<{ rawData: unknown; analysis: string }> {
    if (!mcpServer?.requestSampling) {
      this.logger.warn('Client does not support sampling');
      return { rawData, analysis: '' };
    }

    try {
      const response = await mcpServer.requestSampling({
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: JSON.stringify(rawData, null, 2),
            },
          },
        ],
        systemPrompt: options.systemPrompt,
        maxTokens: options.maxTokens ?? 1000,
        temperature: options.temperature,
      });

      const analysis = response?.content?.text ?? '';
      this.logger.debug(`Sampling analysis completed (${analysis.length} chars)`);

      return { rawData, analysis };
    } catch (err) {
      this.logger.error('Sampling request failed:', err);
      return { rawData, analysis: 'Analysis unavailable due to sampling error.' };
    }
  }
}
