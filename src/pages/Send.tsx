import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Icons, Badge, useToast } from '../components/ui/index';
import { Logo } from '../components/Logo';
import { isValidAddress, shortenAddress } from '../lib/solana';

export function Send() {
  const navigate = useNavigate();
  const { balance, sendTransaction, isLoading, clearError } = useWalletStore();
  const { showToast } = useToast();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const validateForm = (): boolean => {
    let valid = true;
    clearError();
    
    if (!recipient.trim()) {
      setRecipientError('Recipient address is required');
      valid = false;
    } else if (!isValidAddress(recipient.trim())) {
      setRecipientError('Invalid Solana address');
      valid = false;
    } else {
      setRecipientError('');
    }

    const amountNum = parseFloat(amount);
    if (!amount.trim()) {
      setAmountError('Amount is required');
      valid = false;
    } else if (isNaN(amountNum) || amountNum <= 0) {
      setAmountError('Amount must be greater than 0');
      valid = false;
    } else if (amountNum > balance) {
      setAmountError('Insufficient balance');
      valid = false;
    } else {
      setAmountError('');
    }

    return valid;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      const signature = await sendTransaction(recipient.trim(), parseFloat(amount));
      setTxSignature(signature);
      setSuccess(true);
      showToast('Transaction sent successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Transaction failed', 'error');
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = Math.max(0, balance - 0.001);
    setAmount(maxAmount.toFixed(6));
    setAmountError('');
  };

  if (success) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-fade-in">
        <Card variant="gradient" padding="lg" className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Transaction Sent!
          </h2>
          <p className="text-zinc-400 mb-6">
            Your transaction has been submitted to Solana Devnet
          </p>
          
          <Card variant="glass" padding="sm" className="mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Signature</span>
              <span className="font-mono text-white">{shortenAddress(txSignature, 8)}</span>
            </div>
          </Card>

          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
          >
            View on Explorer
            {Icons.external}
          </a>
        </Card>

        <Button
          size="lg"
          fullWidth
          onClick={() => {
            setSuccess(false);
            setTxSignature('');
            setRecipient('');
            setAmount('');
            navigate('/');
          }}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Send SOL</h1>
        <p className="text-zinc-500">Transfer devnet SOL to another wallet</p>
      </div>

      {/* Balance Display */}
      <Card variant="glass" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-xs text-zinc-500">Available Balance</p>
              <p className="text-lg font-bold text-white">{balance.toFixed(4)} SOL</p>
            </div>
          </div>
          <Badge variant="purple">Devnet</Badge>
        </div>
      </Card>

      {/* Send Form */}
      <Card variant="default" padding="lg">
        <div className="space-y-6">
          <Input
            label="Recipient Address"
            placeholder="Enter Solana wallet address..."
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              setRecipientError('');
            }}
            error={recipientError}
            leftIcon={Icons.wallet}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Amount (SOL)</label>
              <button
                type="button"
                onClick={handleMaxAmount}
                className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                MAX
              </button>
            </div>
            <Input
              placeholder="0.00"
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountError('');
              }}
              error={amountError}
              leftIcon={<Logo size="xs" />}
              rightElement={
                <span className="text-zinc-500 text-sm pr-2">SOL</span>
              }
            />
          </div>

          {/* Fee Estimate */}
          <div className="flex items-center justify-between py-3 border-t border-zinc-800">
            <span className="text-sm text-zinc-500">Estimated Fee</span>
            <span className="text-sm text-zinc-300">~0.000005 SOL</span>
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={handleSend}
            loading={isLoading}
            icon={Icons.send}
          >
            Send Transaction
          </Button>
        </div>
      </Card>

      {/* Warning */}
      <Card variant="glass" padding="md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-300 font-medium">Double check the address</p>
            <p className="text-sm text-zinc-500 mt-0.5">
              Transactions on Solana are irreversible. Make sure the recipient address is correct.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
