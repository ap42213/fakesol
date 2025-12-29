import EventEmitter from 'eventemitter3';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

class FakeSolProvider extends EventEmitter {
  publicKey: PublicKey | null = null;
  isConnected: boolean = false;

  constructor() {
    super();
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.signAllTransactions = this.signAllTransactions.bind(this);
    this.signMessage = this.signMessage.bind(this);
  }

  async connect(params?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    try {
      const response = await this._request('connect', params);
      this.publicKey = new PublicKey(response.publicKey);
      this.isConnected = true;
      this.emit('connect', this.publicKey);
      return { publicKey: this.publicKey };
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.publicKey = null;
    this.isConnected = false;
    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    const response = await this._request('signTransaction', {
      message: bs58.encode(transaction.serialize({ requireAllSignatures: false, verifySignatures: false })),
    });

    const signature = bs58.decode(response.signature);

    if (transaction instanceof VersionedTransaction) {
      transaction.addSignature(this.publicKey!, signature);
    } else {
      (transaction as Transaction).addSignature(this.publicKey!, Buffer.from(signature) as Buffer);
    }

    return transaction;
  }

  async signAllTransactions(transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> {
    const signedTransactions = [];
    for (const tx of transactions) {
      signedTransactions.push(await this.signTransaction(tx));
    }
    return signedTransactions;
  }

  async signMessage(message: Uint8Array, display?: string): Promise<{ signature: Uint8Array; publicKey: PublicKey }> {
    const response = await this._request('signMessage', {
      message: bs58.encode(message),
      display,
    });
    
    return {
      signature: bs58.decode(response.signature),
      publicKey: this.publicKey!,
    };
  }

  private _request(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      window.postMessage({
        source: 'fakesol-inpage',
        data: { method, params },
      }, window.location.origin);

      const handler = (event: MessageEvent) => {
        if (event.source !== window || event.data.source !== 'fakesol-content') return;
        if (event.data.data.method === method) {
          window.removeEventListener('message', handler);
          if (event.data.data.error) {
            reject(new Error(event.data.data.error));
          } else {
            resolve(event.data.data.result);
          }
        }
      };

      window.addEventListener('message', handler);
    });
  }
}

// Inject into window
const provider = new FakeSolProvider();
(window as any).solana = provider;
(window as any).fakesol = provider;

console.log('FakeSOL Wallet Provider Injected');
