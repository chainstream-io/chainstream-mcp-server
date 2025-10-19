/**
 * 检查字符串是否为合法的 Base58（Solana 地址常用编码）
 */
function isValidBase58(address: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/; 
    return base58Regex.test(address);
  }
  
  /**
   * 检测地址属于哪种链类型
   * @param address 用户输入的钱包地址
   * @returns 'evm' | 'solana' | 'invalid'
   */
  export function detectChainFromAddress(address: string): 'evm' | 'solana' | 'invalid' {
    if (!address || typeof address !== 'string') {
      return 'invalid';
    }
  
    // 1. 检查 EVM 地址 (0x 开头 + 40 hex)
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return 'evm';
    }
  
    // 2. 检查 Solana 地址 (Base58, 长度 32–44)
    if (address.length >= 32 && address.length <= 44 && isValidBase58(address)) {
      return 'solana';
    }
  
    // 3. 其他情况视为无效
    return 'invalid';
  }
  