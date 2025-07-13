import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [predictedDigit, setPredictedDigit] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);
      setPredictedDigit(null);
    }
  };

  const predictDigit = async () => {
    if (!imageUri) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'digit.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post('http://192.168.18.123:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPredictedDigit(response.data.predicted_digit); // <-- Fixed here
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Could not get prediction. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Digit Recognizer</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>📷 Select Image</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      <TouchableOpacity
        style={[styles.button, (!imageUri || loading) && styles.disabledButton]}
        onPress={predictDigit}
        disabled={!imageUri || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Predicting...' : '🔍 Predict'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#00ff00" style={{ marginTop: 15 }} />}

      {predictedDigit !== null && (
        <Text style={styles.result}>✅ Predicted Digit: {predictedDigit}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ff5555',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 20,
  },
  result: {
    color: '#00ff00',
    fontSize: 20,
    marginTop: 20,
  },
});
