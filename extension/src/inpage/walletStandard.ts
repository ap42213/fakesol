import {
    Wallet,
    WalletAccount,
    registerWallet,
} from '@wallet-standard/core';
import {
    StandardEventsNames,
    StandardEventsListeners,
    StandardEventsChangeProperties
} from '@wallet-standard/features';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { FakeSolProvider } from './index';

const ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjY0IiB5PSI4NCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+RlM8L3RleHQ+PC9zdmc+';

class FakeSolWalletAccount implements WalletAccount {
    readonly address: string;
    readonly publicKey: Uint8Array;
    readonly chains = ['solana:mainnet', 'solana:devnet'] as const;
    readonly features = ['solana:signAndSendTransaction', 'solana:signTransaction', 'solana:signMessage'] as const;

    constructor(publicKey: PublicKey) {
        this.address = publicKey.toBase58();
        this.publicKey = publicKey.toBytes();
    }
}

export function registerFakeSolWallet(provider: FakeSolProvider) {
    let accounts: FakeSolWalletAccount[] = [];
    
    if (provider.publicKey) {
        accounts = [new FakeSolWalletAccount(provider.publicKey)];
    }

    const onStandardChangeListeners: ((properties: StandardEventsChangeProperties) => void)[] = [];

    const wallet: Wallet = {
        version: '1.0.0',
        name: 'FakeSOL',
        icon: ICON,
        chains: ['solana:mainnet', 'solana:devnet'],
        features: {
            'standard:connect': {
                version: '1.0.0',
                connect: async () => {
                    try {
                        const { publicKey } = await provider.connect();
                        accounts = [new FakeSolWalletAccount(publicKey)];
                        emitChange({ accounts });
                        return { accounts };
                    } catch (error) {
                        console.error('FakeSOL: Connect failed', error);
                        throw error;
                    }
                },
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: async () => {
                    await provider.disconnect();
                    accounts = [];
                    emitChange({ accounts });
                },
            },
            'standard:events': {
                version: '1.0.0',
                on: <E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]) => {
                    if (event === 'change') {
                        onStandardChangeListeners.push(listener as any);
                        return () => {
                            const index = onStandardChangeListeners.indexOf(listener as any);
                            if (index !== -1) onStandardChangeListeners.splice(index, 1);
                        };
                    }
                    return () => {};
                },
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: async ({ transaction, chain, options }: { transaction: Uint8Array, chain: string, options?: any }) => {
                    if (chain !== 'solana:devnet' && chain !== 'solana:mainnet') throw new Error('Unsupported chain');
                    const versionedTx = VersionedTransaction.deserialize(transaction);
                    const { signature } = await provider.signAndSendTransaction(versionedTx, options);
                    return [{ signature: bs58.decode(signature) }];
                },
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: async ({ transaction, chain }: { transaction: Uint8Array, chain: string }) => {
                    if (chain !== 'solana:devnet' && chain !== 'solana:mainnet') throw new Error('Unsupported chain');
                    const versionedTx = VersionedTransaction.deserialize(transaction);
                    const signedTx = await provider.signTransaction(versionedTx);
                    return [{ signedTransaction: signedTx.serialize() }];
                },
            },
            'solana:signMessage': {
                version: '1.0.0',
                signMessage: async ({ message, account: _account }: { message: Uint8Array, account: WalletAccount }) => {
                    const { signature } = await provider.signMessage(message);
                    return [{ signature, signedMessage: message }];
                },
            },
        } as any,
        get accounts() {
            return accounts;
        }
    };

    function emitChange(properties: StandardEventsChangeProperties) {
        for (const listener of onStandardChangeListeners) {
            listener(properties);
        }
    }

    // Sync with provider events
    provider.on('connect', (publicKey: PublicKey) => {
        accounts = [new FakeSolWalletAccount(publicKey)];
        emitChange({ accounts });
    });

    provider.on('disconnect', () => {
        accounts = [];
        emitChange({ accounts });
    });

    try {
        registerWallet(wallet);
        // Dispatch a custom event for legacy/custom adapters that might be listening
        window.dispatchEvent(new CustomEvent('fakesol#initialized', { detail: { wallet } }));
        console.log('FakeSOL: Wallet Standard registered successfully');
    } catch (error) {
        console.error('FakeSOL: Failed to register wallet', error);
    }
}
