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
import { IpfsPrompt } from '../resources/ipfs/ipfs.prompt';
import { IpfsResource } from '../resources/ipfs/ipfs.resource';
import { IpfsTool } from '../resources/ipfs/ipfs.tool';
import { KytPrompt } from '../resources/kyt/kyt.prompt';
import { KytResource } from '../resources/kyt/kyt.resource';
import { KytTool } from '../resources/kyt/kyt.tool';
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
import { WatchlistPrompt } from '../resources/watchlist/watchlist.prompt';
import { WatchlistResource } from '../resources/watchlist/watchlist.resource';
import { WatchlistTool } from '../resources/watchlist/watchlist.tool';
import { WebhookPrompt } from '../resources/webhook/webhook.prompt';
import { WebhookResource } from '../resources/webhook/webhook.resource';
import { WebhookTool } from '../resources/webhook/webhook.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'playground-mcp-server',
      version: '0.0.1',
      streamableHttp: {
        enableJsonResponse: true,
        sessionIdGenerator: undefined,
        statelessMode: true,
      },
    }),
  ],
  providers: [
    BlockchainResource,
    BlockchainTool,
    BlockchainPrompt,
    DexResource,
    DexTool,
    DexPrompt,
    DexpoolResource,
    DexpoolTool,
    DexpoolPrompt,
    TokenResource,
    TokenTool,
    TokenPrompt,
    WalletResource,
    WalletTool,
    WalletPrompt,
    TradeResource,
    TradeTool,
    TradePrompt,
    TransactionResource,
    TransactionTool,
    TransactionPrompt,
    RankingResource,
    RankingTool,
    RankingPrompt,
    RedpacketResource,
    RedpacketTool,
    RedpacketPrompt,
    KytResource,
    KytTool,
    KytPrompt,
    WebhookResource,
    WebhookTool,
    WebhookPrompt,
    IpfsResource,
    IpfsTool,
    IpfsPrompt,
    WatchlistResource,
    WatchlistTool,
    WatchlistPrompt,
    DefiResource,
    DefiTool,
    DefiPrompt,
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3030);

  console.log('MCP server started on port 3030');
}

void bootstrap();
