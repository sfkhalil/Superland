// Folder: Frontend (React Native)
// File: App.js

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';

const App = () => {
  const [metadata, setMetadata] = useState('');
  const [issuer, setIssuer] = useState('');
  const [currencyCode, setCurrencyCode] = useState('COPPER');
  const [nftId, setNftId] = useState('');
  const [amount, setAmount] = useState('');
  const [defiAmount, setDefiAmount] = useState('');

  const handleRequest = async (endpoint, data) => {
    try {
      const response = await axios.post(`http://localhost:5000/${endpoint}`, data);
      Alert.alert('Success', response.data.message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>Superland Tokenization App</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Mint NFT</Text>
          <TextInput style={styles.input} placeholder="Metadata" value={metadata} onChangeText={setMetadata} />
          <Button title="Mint NFT" onPress={() => handleRequest('mint', { metadata })} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Create Trustline</Text>
          <TextInput style={styles.input} placeholder="Issuer Address" value={issuer} onChangeText={setIssuer} />
          <TextInput style={styles.input} placeholder="Currency Code" value={currencyCode} onChangeText={setCurrencyCode} />
          <Button title="Create Trustline" onPress={() => handleRequest('trustline', { issuer, currencyCode })} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Create Offer</Text>
          <TextInput style={styles.input} placeholder="NFT ID" value={nftId} onChangeText={setNftId} />
          <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} />
          <Button title="Create Offer" onPress={() => handleRequest('create_offer', { nftId, amount })} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DeFi Loan</Text>
          <TextInput style={styles.input} placeholder="Amount" value={defiAmount} onChangeText={setDefiAmount} />
          <Button title="Request Loan" onPress={() => handleRequest('defi_loan', { defiAmount })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
