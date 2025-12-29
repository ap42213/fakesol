// API client for FakeSOL backend
// In production, API is served from same origin. In dev, use localhost:3001
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed', message: data.message };
    }

    return { data };
  } catch (error: any) {
    return { error: 'Network error', message: error.message };
  }
}

// API Methods
export const api = {
  // Health check
  health: () => apiRequest<{
    status: string;
    cluster: string;
    slot: number;
    blockHeight: number;
  }>('/health'),

  // Generate new wallet
  generateWallet: () => apiRequest<{
    publicKey: string;
    secretKey: string;
  }>('/wallet/generate', { method: 'POST' }),

  // Validate address
  validateAddress: (address: string) => apiRequest<{
    valid: boolean;
    address: string;
  }>(`/wallet/validate/${address}`),

  // Get balance
  getBalance: (address: string) => apiRequest<{
    address: string;
    balance: number;
    unit: string;
  }>(`/wallet/${address}/balance`),

  // Request airdrop
  requestAirdrop: (address: string, amount: number = 1) => 
    apiRequest<{
      success: boolean;
      signature: string;
      amount: number;
      explorerUrl: string;
    }>(`/wallet/${address}/airdrop`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Get transactions
  getTransactions: (address: string, limit: number = 20) => 
    apiRequest<{
      address: string;
      count: number;
      transactions: Array<{
        signature: string;
        slot: number;
        blockTime: number | null;
        status: 'success' | 'failed';
        error: any;
        explorerUrl: string;
      }>;
    }>(`/wallet/${address}/transactions?limit=${limit}`),

  // Get transaction details
  getTransaction: (signature: string) => apiRequest<{
    signature: string;
    slot: number;
    blockTime: number | null;
    fee: number;
    status: 'success' | 'failed';
    explorerUrl: string;
  }>(`/transaction/${signature}`),

  // Send transaction
  sendTransaction: (fromSecretKey: string, toAddress: string, amount: number) =>
    apiRequest<{
      success: boolean;
      signature: string;
      fee: number;
      explorerUrl: string;
    }>('/transaction/send', {
      method: 'POST',
      body: JSON.stringify({ fromSecretKey, toAddress, amount }),
    }),

  // Get SPL tokens for address
  getTokens: (address: string) =>
    apiRequest<{
      address: string;
      tokenCount: number;
      tokens: Array<{
        address: string;
        mint: string;
        amount: number;
        decimals: number;
        uiAmount: number;
        name: string;
        symbol: string;
      }>;
    }>(`/wallet/${address}/tokens`),
};

export default api;
