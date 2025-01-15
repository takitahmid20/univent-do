import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

// const API_BASE_URL = 'http://172.20.10.3:5656';
const API_BASE_URL = 'http://10.15.12.123:5656';

// 10.15.12.123
// 192.168.68.106

export default function SignIn() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_BASE_URL}/api/accounts/login/`, {
        username,
        password
      });

      const { token, user } = response.data;
      console.log('Login response:', response.data);

      if (user.userType !== 'organizer') {
        setError('Only organizers can use this app');
        return;
      }

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userType', 'organizer');
      
      console.log('Navigating to Dashboard...');
      navigation.replace('Dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="bg-white rounded-xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          Univent Organizer
        </Text>

        <View className="space-y-4">
          <TextInput
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            className={`w-full bg-blue-500 rounded-lg py-3 px-4 ${loading ? 'opacity-70' : ''}`}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('http://192.168.68.106:3000/signup')}
          >
            <Text className="text-blue-500 font-semibold">
              Sign up on web
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
