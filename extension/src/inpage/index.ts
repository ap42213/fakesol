import EventEmitter from 'eventemitter3';
import { PublicKey, Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { registerFakeSolWallet } from './walletStandard';

export class FakeSolProvider extends EventEmitter {
  publicKey: PublicKey | null = null;
  isConnected: boolean = false;
  isPhantom: boolean = true;

  constructor() {
    super();
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.signAllTransactions = this.signAllTransactions.bind(this);
    this.signAndSendTransaction = this.signAndSendTransaction.bind(this);
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
    let messageToSign: Uint8Array;

    if (transaction instanceof VersionedTransaction) {
      messageToSign = transaction.message.serialize();
    } else {
      messageToSign = (transaction as Transaction).serializeMessage();
    }

    const response = await this._request('signTransaction', {
      message: bs58.encode(messageToSign),
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

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: any
  ): Promise<{ signature: string }> {
    const signedTx = await this.signTransaction(transaction);
    const connection = new Connection('https://api.devnet.solana.com');
    
    const rawTransaction = signedTx.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, options);
    
    return { signature };
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

registerFakeSolWallet(provider);

console.log('FakeSOL Wallet Provider Injected');
