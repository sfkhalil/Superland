//RWA tokenization marketplace for commodities - copper using XRPL ledger
//also contains defi marketplace for tokenized copper
//App.js Node backend to handle client requests from webclients or wallets. 



const express = require('express');
const cors = require('cors');
const xrpl = require('xrpl');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const client = new xrpl.Client('https://s.altnet.rippletest.net:51234/');
let wallet;

client.connect().then(() => {
    console.log('Connected to XRPL Testnet');
    wallet = xrpl.Wallet.fromSeed('s████████████████████████████'); // Replace with actual wallet seed
}).catch(error => {
    console.error('Failed to connect to XRPL Testnet:', error.message);
});

// Mint NFT
app.post('/mint', async (req, res) => {
    try {
        const { metadata } = req.body;
        if (!metadata) throw new Error('Metadata is required');
        
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
        if (!issuer || !currencyCode) throw new Error('Issuer and Currency Code are required');
        
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
        if (!nftId || !amount) throw new Error('NFT ID and Amount are required');
        
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
        if (!defiAmount) throw new Error('Loan amount is required');
        
        const nftRequest = { command: 'account_nfts', account: wallet.classicAddress };
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

// List Offers
app.get('/list_offers', async (req, res) => {
    try {
        const request = { command: 'account_offers', account: wallet.classicAddress };
        const response = await client.request(request);
        res.json({ message: 'Offers Retrieved Successfully', offers: response.result.offers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept Offer
app.post('/accept_offer', async (req, res) => {
    try {
        const { offerSequence } = req.body;
        if (!offerSequence) throw new Error('Offer Sequence is required');
        
        const transaction = {
            TransactionType: 'NFTokenAcceptOffer',
            Account: wallet.classicAddress,
            OfferSequence: offerSequence
        };
        const prepared = await client.autofill(transaction);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        res.json({ message: 'Offer Accepted Successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
