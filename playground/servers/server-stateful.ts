import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { McpModule } from '../../dist';
import { RankingResource } from '../resources/ranking/ranking.resource';
import { RankingTool } from '../resources/ranking/ranking.tool';
import { RankingPrompt } from '../resources/ranking/ranking.prompt';
import { TokenResource } from '../resources/token/token.resource';
import { TokenTool } from '../resources/token/token.tool';
import { TokenPrompt } from '../resources/token/token.prompt';
import { DexResource } from '../resources/dex/dex.resource';
import { TransactionResource } from '../resources/transaction/transaction.resource';
import { DexTool } from '../resources/dex/dex.tool';
import { TransactionTool } from '../resources/transaction/transaction.tool';
import { DexPrompt } from '../resources/dex/dex.prompt';
import { TransactionPrompt } from '../resources/transaction/transaction.prompt';

// Note: The stateful server exposes SSE and Streamable HTTP endpoints.
@Module({
  imports: [
    McpModule.forRoot({
      name: 'playground-mcp-server',
      version: '0.0.1',
      streamableHttp: {
        // enableJsonResponse: false,
        // sessionIdGenerator: () => randomUUID(),
        // statelessMode: false,
        enableJsonResponse: true,
        sessionIdGenerator: undefined,
        statelessMode: true,
      },
    }),
  ],
  providers: [
    RankingResource,
    RankingTool,
    RankingPrompt,
    TokenResource,
    TokenTool,
    TokenPrompt,
    DexResource,
    DexTool,
    DexPrompt,
    TransactionResource,
    TransactionTool,
    TransactionPrompt,
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3030);

  console.log('MCP server started on port 3030');
}

void bootstrap();
