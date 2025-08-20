# ChainStream DEX Aggregator MCP Resources

## 🔐 Authentication

All ChainStream API endpoints require JWT token authentication. Each resource and tool method now accepts an `accessToken` parameter for flexible authentication.

### How to get JWT Token

1. **Visit**: [ChainStream Authentication Documentation](https://docs.chainstream.io/en/api-reference/authenticate)

2. **Generate JWT token using Auth0 client credentials grant**:
   ```javascript
   import { AuthenticationClient } from 'auth0';
   
   const auth0Client = new AuthenticationClient({
     domain: 'https://dex.asia.auth.chainstream.io/oauth/token',
     client_id: 'your_client_id',
     client_secret: 'your_client_secret'
   });
   
   const response = await auth0Client.oauth.clientCredentialsGrant({
     audience: 'https://api-dex.chainstream.io'
   });
   
   const jwtToken = response.data.access_token;
   ```

3. **Use the JWT token in Authorization header**: `Bearer <jwt_token>`

### Usage Pattern

All resources and tools now follow this pattern:
- Each method accepts an `accessToken` parameter
- The method validates the token and instantiates a new `DexClient` with the provided token
- This allows for flexible authentication per request

### API Documentation
- [ChainStream API Reference](https://docs.chainstream.io/en/api-reference/)
- [Token API](https://docs.chainstream.io/en/api-reference/endpoint/token/v1-token-search)
- [Ranking API](https://docs.chainstream.io/en/api-reference/endpoint/ranking/v1-ranking-chain-hottokens-duration)

## Resources

### Token Resources
- `getToken` - Get token information by chain and address
- `searchTokens` - Search tokens by chain and query with advanced filters

### Ranking Resources  
- `getHotTokens` - Get hot tokens ranking by chain and duration with advanced filters

All resources require ChainStream API authentication as described above.
