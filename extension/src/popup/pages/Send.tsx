import { useState } from 'react';
import { useWallet, getConnection } from '../context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

export function Send() {
  const { publicKey } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !publicKey) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const pubKey = new PublicKey(publicKey);
      const recipientKey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const conn = getConnection();
      
      // Get private key
      const result = await chrome.storage.local.get(['fakesol_secret_key']);
      if (!result.fakesol_secret_key) throw new Error('No wallet found');
      
      const secretKey = bs58.decode(result.fakesol_secret_key);
      const keypair = Keypair.fromSecretKey(secretKey);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: pubKey,
          toPubkey: recipientKey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(conn, transaction, [keypair]);
      console.log('Sent:', signature);
      setSuccess('Transaction sent successfully!');
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Send SOL</h2>
        <p className="text-sm text-zinc-400">Transfer funds to another address</p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <Input
          label="Recipient Address"
          placeholder="Enter Solana address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        
        <Input
          label="Amount (SOL)"
          type="number"
          step="0.000000001"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {success}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          variant="primary"
          loading={loading}
          disabled={!recipient || !amount}
          className="h-12 text-base"
        >
          Send Transaction
        </Button>
      </form>
    </div>
  );
}
