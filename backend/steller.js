// downloadStellarCSV.js
import axios from "axios";
import fs from "fs";
import { Parser } from "json2csv";

const accountId = 'GAYV3X42OYVOUESOJUGSZYPEXT73JBQPGA6PKFLN5HTZ66DE4DOW2OQS';
const horizonUrl = `https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`;

async function fetchTransactions() {
  try {
    const response = await axios.get(horizonUrl);
    return response.data._embedded.records;
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    return [];
  }
}

async function saveTransactionsToCSV() {
  const transactions = await fetchTransactions();
  if (transactions.length === 0) {
    console.log('No transactions found.');
    return;
  }

  const formattedTransactions = transactions.map(tx => ({
    'Tx Hash': tx.hash,
    'Source Account': tx.source_account,
    'Fee Charged': tx.fee_charged,
    'Memo': tx.memo || '',
    'Operation Count': tx.operation_count,
    'Created At': tx.created_at,
  }));

  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(formattedTransactions);

  const filename = `stellar_transactions_${accountId.substring(0, 6)}.csv`;
  fs.writeFileSync(filename, csv);
  console.log(`Transactions saved to ${filename}`);
}

saveTransactionsToCSV();
