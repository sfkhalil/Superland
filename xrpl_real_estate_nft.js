const xrpl = require("xrpl");

// XRPL Testnet Connection
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");

// Superland's XRPL Wallet
const issuerWallet = xrpl.Wallet.fromSeed("0xbe2bc7ac7f692c8d792896cf30102e90331f8d57"); // Superland testnet Wallet 

async function mintRealEstateNFT(property) {
    await client.connect();

    console.log("Connected to XRPL Testnet...");

    const mintTx = {
        TransactionType: "NFTokenMint",
        Account: issuerWallet.classicAddress,
        URI: xrpl.convertStringToHex(JSON.stringify(property)), // Property Metadata in HEX
        Flags: 8, // Transferable NFT
        NFTokenTaxon: 0 // Arbitrary number, can categorize different properties
    };

    // Submit transaction
    const prepared = await client.autofill(mintTx);
    const signed = issuerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
        console.log("✅ Real Estate NFT Minted Successfully!");
        console.log("Transaction Hash:", signed.hash);
        console.log("NFT Metadata (HEX):", mintTx.URI);
    } else {
        console.error("❌ NFT Minting Failed:", result.result.meta.TransactionResult);
    }

    await client.disconnect();
}

// Sample Property Data
const propertyDetails = {
    name: "Superland Tower",
    location: "New York, NY",
    size: "50,000 sqft",
    price: "5,000,000 USD",
    owner: "Superland Ltd.",
    description: "A premium commercial real estate property in the heart of NYC."
};

// Execute NFT Minting
mintRealEstateNFT(propertyDetails).catch(console.error);
