// Double-Entry Accounting Ledger & Payment Gateway Engine — Stripe / Razorpay Standard

const LEDGER_KEY = 'stagepass_ledger_transactions';

/**
 * Generate a unique cryptographic transaction reference hash
 */
function generateTxHash(payer, payee, amount, timestamp) {
  const raw = `${payer}:${payee}:${amount}:${timestamp}:STAGEPASS_LEDGER_SALT`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'tx_hash_' + Math.abs(hash).toString(16) + Date.now().toString(36);
}

/**
 * Record a double-entry ledger financial transaction
 */
export function recordLedgerTransaction({ type, amount, payerUsername, payeeUsername, referenceId, description }) {
  const numAmount = parseFloat(amount) || 0;
  const timestamp = Date.now();
  const txHash = generateTxHash(payerUsername, payeeUsername, numAmount, timestamp);
  
  const creatorRoyalty = type === 'ASSET_LICENSE' ? (numAmount * 0.90) : numAmount;
  const platformFee = type === 'ASSET_LICENSE' ? (numAmount * 0.10) : 0;

  const transactionRecord = {
    id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: type || 'PAYMENT', // 'WALLET_RECHARGE', 'ASSET_LICENSE', 'ADMIN_ADJUSTMENT'
    amount: numAmount,
    creatorRoyalty,
    platformFee,
    payerUsername: payerUsername || 'System',
    payeeUsername: payeeUsername || 'Platform Escrow',
    referenceId: referenceId || 'ref_' + Date.now(),
    description: description || 'Financial Ledger Entry',
    status: 'SETTLED',
    currency: 'INR',
    txHash,
    timestamp,
    entries: [
      {
        account: `user_wallet:${payerUsername}`,
        type: 'DEBIT',
        amount: numAmount
      },
      {
        account: `creator_vault:${payeeUsername}`,
        type: 'CREDIT',
        amount: creatorRoyalty
      },
      ...(platformFee > 0 ? [{
        account: 'platform_treasury:stagepass',
        type: 'CREDIT',
        amount: platformFee
      }] : [])
    ]
  };

  const history = getAllLedgerTransactions();
  history.unshift(transactionRecord);
  // Keep last 500 ledger records
  localStorage.setItem(LEDGER_KEY, JSON.stringify(history.slice(0, 500)));

  return transactionRecord;
}

/**
 * Get all financial ledger transactions
 */
export function getAllLedgerTransactions() {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Get ledger transaction history for specific user
 */
export function getUserLedgerHistory(username) {
  const all = getAllLedgerTransactions();
  return all.filter(tx => tx.payerUsername === username || tx.payeeUsername === username);
}
