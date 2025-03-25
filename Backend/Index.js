/* Project Structure */

// Folder: Backend (Node.js)
// File: index.js

const express = require('express');
const cors = require('cors');
const xrpl = require('xrpl');

const app = express();
app.use(cors());
app.use(express.json());

const client = new xrpl.Client('https://s.altnet.rippletest.net:51234/');
let wallet;

// Connect to XRPL
client.connect().then(() => {
    console.log('Connected to XRPL Testnet');
    wallet = xrpl.Wallet.fromSeed('s████████████████████████████'); // Replace with actual wallet seed
});

// Mint NFT
app.post('/mint', async (req, res) => {
    try {
        const { metadata } = req.body;
        const hexMetadata = Buffer.from(metadata).toString('hex');
        const transaction = {
            TransactionType: 'NFTokenMint',
            Account: wallet.classicAddress,
            URI: hexMetadata,
            Flags: 8,
        };
        const prepared = await client.autofill(transaction);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        res.json({ message: 'NFT Minted Successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Trustline
app.post('/trustline', async (req, res) => {
    try {
        const { issuer, currencyCode } = req.body;
        const transaction = {
            TransactionType: 'TrustSet',
            Account: wallet.classicAddress,
            LimitAmount: {
                currency: currencyCode,
                issuer,
                value: '1000000',
            },
        };
        const prepared = await client.autofill(transaction);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        res.json({ message: 'Trustline Created Successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Offer
app.post('/create_offer', async (req, res) => {
    try {
        const { nftId, amount } = req.body;
        const transaction = {
            TransactionType: 'NFTokenCreateOffer',
            Account: wallet.classicAddress,
            NFTokenID: nftId,
            Amount: amount,
            Flags: 1
        };
        const prepared = await client.autofill(transaction);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        res.json({ message: 'Offer Created Successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get DeFi Loan
app.post('/defi_loan', async (req, res) => {
    try {
        const { defiAmount } = req.body;

        const nftRequest = {
            command: 'account_nfts',
            account: wallet.classicAddress
        };
        const nftResponse = await client.request(nftRequest);
        const availableNfts = nftResponse.result.account_nfts;

        if (availableNfts.length === 0) {
            return res.status(400).json({ message: 'No collateral NFTs found for DeFi loan.' });
        }

        const approvedLoanAmount = parseInt(defiAmount);
        if (approvedLoanAmount <= 0) {
            return res.status(400).json({ message: 'Invalid loan amount requested.' });
        }

        res.json({ message: `DeFi Loan of ${approvedLoanAmount} granted against tokenized copper.`, collateral: availableNfts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));