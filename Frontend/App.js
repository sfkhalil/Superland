// Folder: Frontend (React Native)
// File: App.js

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, ScrollView, ToastAndroid } from 'react-native';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const App = () => {
  const [metadata, setMetadata] = useState('');
  const [issuer, setIssuer] = useState('');
  const [currencyCode, setCurrencyCode] = useState('COPPER');
  const [nftId, setNftId] = useState('');
  const [amount, setAmount] = useState('');
  const [defiAmount, setDefiAmount] = useState('');
  const [lenderOptions, setLenderOptions] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/list_offers');
      setOffers(response.data.offers);
    } catch (error) {
      ToastAndroid.show('Error fetching offers', ToastAndroid.LONG);
    }
  };

  const handleRequest = async (endpoint, data) => {
    try {
      const response = await axios.post(`http://localhost:5000/${endpoint}`, data);
      ToastAndroid.show(response.data.message, ToastAndroid.LONG);
      if (endpoint === 'accept_offer') fetchOffers();
      if (endpoint === 'defi_loan') setLenderOptions(response.data.lenders || []);
    } catch (error) {
      ToastAndroid.show(error.message, ToastAndroid.LONG);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Superland Tokenization Platform</Text>

        <Card>
          <CardContent>
            <Text>Mint NFT (Copper Token)</Text>
            <TextInput placeholder="Enter Metadata (JSON Format)" value={metadata} onChangeText={setMetadata} />
            <Button title="Mint NFT" onPress={() => handleRequest('mint', { metadata })} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text>Create Trustline</Text>
            <TextInput placeholder="Issuer Address" value={issuer} onChangeText={setIssuer} />
            <TextInput placeholder="Currency Code" value={currencyCode} onChangeText={setCurrencyCode} />
            <Button title="Create Trustline" onPress={() => handleRequest('trustline', { issuer, currencyCode })} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text>Create Marketplace Offer</Text>
            <TextInput placeholder="NFT ID" value={nftId} onChangeText={setNftId} />
            <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} />
            <Button title="Create Offer" onPress={() => handleRequest('create_offer', { nftId, amount })} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text>Request DeFi Loan</Text>
            <TextInput placeholder="Amount" value={defiAmount} onChangeText={setDefiAmount} />
            <Button title="Request Loan" onPress={() => handleRequest('defi_loan', { defiAmount })} />
            {lenderOptions.length > 0 && (
              <View>
                {lenderOptions.map((lender, index) => (
                  <Text key={index}>{lender.name}: Interest Rate - {lender.rate}%</Text>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text>Active Offers</Text>
            {offers.length === 0 && <Text>No offers available.</Text>}
            {offers.map((offer, index) => (
              <View key={index} style={styles.offerContainer}>
                <Text>Offer Sequence: {offer.seq}</Text>
                <Text>Amount: {offer.amount}</Text>
                <Button title="Accept Offer" onPress={() => handleRequest('accept_offer', { offerSequence: offer.seq })} />
              </View>
            ))}
          </CardContent>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  offerContainer: { marginTop: 10, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 }
});

export default App;
