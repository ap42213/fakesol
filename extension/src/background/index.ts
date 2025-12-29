import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleRequest(request).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleRequest(request: any) {
  const { method, params } = request;

  try {
    // Get wallet
    const storage = await chrome.storage.local.get(['fakesol_secret_key']);
    if (!storage.fakesol_secret_key) {
      throw new Error('Wallet not connected or locked');
    }

    const secretKey = bs58.decode(storage.fakesol_secret_key);
    const keypair = Keypair.fromSecretKey(secretKey);

    switch (method) {
      case 'connect':
        return {
          result: {
            publicKey: keypair.publicKey.toString(),
          },
        };

      case 'signTransaction':
        // In a real wallet, we would open a popup here to ask for approval.
        // For this devnet wallet, we auto-sign if the wallet is imported.
        // request.params.message is the serialized transaction (base58)
        
        // We need to sign the message (transaction)
        // The provider expects us to return the signature.
        // Wait, the provider implementation I wrote expects the signature of the transaction?
        // Actually, usually the wallet signs the transaction and returns the signed transaction or just the signature.
        // My inpage provider expects a signature.
        
        // Let's decode the message (transaction bytes)
        const txMessage = bs58.decode(params.message);
        
        // Sign it
        const signature = nacl.sign.detached(txMessage, keypair.secretKey);
        
        return {
          result: {
            signature: bs58.encode(signature),
          },
        };

      case 'signMessage':
        const messageBytes = bs58.decode(params.message);
        const msgSignature = nacl.sign.detached(messageBytes, keypair.secretKey);
        
        return {
          result: {
            signature: bs58.encode(msgSignature),
          },
        };

      default:
        throw new Error('Method not implemented');
    }
  } catch (error: any) {
    return { error: error.message };
  }
}
