# ChainStream MCP Server Resources

## Authentication

All ChainStream API endpoints require JWT token authentication. Each resource and tool method extracts the `accessToken` from the Authorization header.

### How to get JWT Token

1. Visit: [ChainStream Authentication Documentation](https://docs.chainstream.io/en/api-reference/authentication/authenticate)

2. Generate JWT token using Auth0 client credentials grant:
   ```javascript
   import { AuthenticationClient } from 'auth0';
   
   const auth0Client = new AuthenticationClient({
     domain: 'dex.asia.auth.chainstream.io',
     clientId: 'your_client_id',
     clientSecret: 'your_client_secret'
   });
   
   const response = await auth0Client.oauth.clientCredentialsGrant({
     audience: 'https://api.dex.chainstream.io'
   });
   
   const jwtToken = response.data.access_token;
   ```

3. Use the JWT token in Authorization header: `Bearer <jwt_token>`

### Usage Pattern

All resources and tools follow this pattern:
- Extract `accessToken` from `Authorization: Bearer <token>` header
- Instantiate a `ChainStreamClient` with the provided token
- Call the corresponding SDK method

### API Documentation
- [ChainStream API Reference](https://docs.chainstream.io/en/api-reference/)
- [TypeScript SDK](https://docs.chainstream.io/en/sdks/typescript)
- [Tools Catalog](https://docs.chainstream.io/en/guides/ai-infrastructure/mcp-server/tools-catalog)

## Modules

| Module | Methods | Description |
|--------|---------|-------------|
| **blockchain** | getSupportedBlockchains, getLatestBlock | Chain info and latest block |
| **dex** | listDex, getQuote, getRoute, swap, createToken | DEX protocols and trading |
| **dexpool** | getDexpool, getDexpoolSnapshots | DEX pool info and liquidity |
| **token** | 27 methods | Token data, stats, holders, candles, transfers |
| **wallet** | 15 methods | Balance, PnL, net worth, transfers |
| **trade** | getTrades, getActivities, getTopTraders, getTraderGainersLosers | Trade data and analytics |
| **transaction** | send, getGasPrice, estimateGasLimit | Transaction execution |
| **ranking** | getHotTokens, getNewTokens, getStocksTokens, getFinalStretchTokens, getMigratedTokens | Token rankings |
| **redpacket** | 8 methods | Red packet creation, claiming, management |
| **kyt** | 14 methods | KYT risk assessment for transfers, withdrawals, addresses |
| **webhook** | 7 methods | Webhook endpoint management |
| **ipfs** | presign | IPFS content upload |
| **watchlist** | watchlistAdd | Wallet watchlist for PnL tracking |
| **defi** | pumpfunCreateToken, moonshotCreateToken | DeFi token creation |

All resources require ChainStream API authentication as described above.
