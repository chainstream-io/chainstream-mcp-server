import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { McpModule } from '../../dist';
import { BlockchainPrompt } from '../resources/blockchain/blockchain.prompt';
import { BlockchainResource } from '../resources/blockchain/blockchain.resource';
import { BlockchainTool } from '../resources/blockchain/blockchain.tool';
import { DefiPrompt } from '../resources/defi/defi.prompt';
import { DefiResource } from '../resources/defi/defi.resource';
import { DefiTool } from '../resources/defi/defi.tool';
import { DexPrompt } from '../resources/dex/dex.prompt';
import { DexResource } from '../resources/dex/dex.resource';
import { DexTool } from '../resources/dex/dex.tool';
import { DexpoolPrompt } from '../resources/dexpool/dexpool.prompt';
import { DexpoolResource } from '../resources/dexpool/dexpool.resource';
import { DexpoolTool } from '../resources/dexpool/dexpool.tool';
import { RankingPrompt } from '../resources/ranking/ranking.prompt';
import { RankingResource } from '../resources/ranking/ranking.resource';
import { RankingTool } from '../resources/ranking/ranking.tool';
import { RedpacketPrompt } from '../resources/redpacket/redpacket.prompt';
import { RedpacketResource } from '../resources/redpacket/redpacket.resource';
import { RedpacketTool } from '../resources/redpacket/redpacket.tool';
import { TokenPrompt } from '../resources/token/token.prompt';
import { TokenResource } from '../resources/token/token.resource';
import { TokenTool } from '../resources/token/token.tool';
import { TradePrompt } from '../resources/trade/trade.prompt';
import { TradeResource } from '../resources/trade/trade.resource';
import { TradeTool } from '../resources/trade/trade.tool';
import { TransactionPrompt } from '../resources/transaction/transaction.prompt';
import { TransactionResource } from '../resources/transaction/transaction.resource';
import { TransactionTool } from '../resources/transaction/transaction.tool';
import { WalletPrompt } from '../resources/wallet/wallet.prompt';
import { WalletResource } from '../resources/wallet/wallet.resource';
import { WalletTool } from '../resources/wallet/wallet.tool';


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
    WalletResource,
    WalletTool,
    WalletPrompt,

    BlockchainPrompt,
    BlockchainResource,
    BlockchainTool,
    DefiPrompt,
    DefiResource,
    DefiTool,
    DexpoolPrompt,
    DexpoolResource,
    DexpoolTool,
    RedpacketPrompt,
    RedpacketResource,
    RedpacketTool,
    TradePrompt,
    TradeResource,
    TradeTool,
  
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3030);

  console.log('MCP server started on port 3030');
}

void bootstrap();
