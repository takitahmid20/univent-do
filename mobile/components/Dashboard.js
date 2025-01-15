import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import QRScanner from './QRScanner';

function InfoItem({ label, value }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-600 text-sm mb-1">{label}</Text>
      <Text className="text-gray-800 text-base">
        {value || 'Not specified'}
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const navigation = useNavigation();
  const [organizerData, setOrganizerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token);

      const response = await axios.get('http://10.15.12.123:5656/api/accounts/organizer/profile/', {
        // const response = await axios.get('http://172.20.10.3:5656/api/accounts/organizer/profile/', {
    //const response = await axios.get('http://192.168.68.106:5656/api/accounts/organizer/profile/', {
    // 10.15.12.123

        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile response:', response.data);
      setOrganizerData(response.data.user);
    } catch (err) {
      console.error('Profile error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      navigation.replace('SignIn');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleMenuPress = () => {
    setIsMenuOpen(!isMenuOpen);
    // Add your menu logic here
    console.log('Menu pressed');
  };

  const handleTabPress = (tabKey) => {
    if (tabKey === 'scanner') {
      setIsScannerVisible(true);
    } else {
      setActiveTab(tabKey);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={handleSignOut}
        >
          <Text className="text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ScrollView className="flex-1">
            <View className="p-6">
              {/* Profile Header */}
              <View className="bg-white rounded-xl p-6 shadow-md mb-6">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                  {organizerData?.organizationName || organizerData?.username}
                </Text>
                <Text className="text-gray-500 text-center">
                  Organizer Profile
                </Text>
              </View>

              {/* Organization Details */}
              <View className="bg-white rounded-xl p-6 shadow-md mb-6">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Organization Details
                </Text>
                
                <InfoItem label="Email" value={organizerData?.email} />
                <InfoItem 
                  label="Organization Category" 
                  value={organizerData?.organizationCategory} 
                />
                <InfoItem label="Phone" value={organizerData?.phone} />
                <InfoItem label="Website" value={organizerData?.websiteUrl} />
              </View>

              {/* Quick Actions */}
              <View className="bg-white rounded-xl p-6 shadow-md mb-6">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Quick Actions
                </Text>
                
                <TouchableOpacity
                  className="bg-red-500 w-full py-3 rounded-lg"
                  onPress={handleSignOut}
                >
                  <Text className="text-white text-center font-semibold">
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case 'events':
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl text-gray-600">My Events Coming Soon</Text>
          </View>
        );
      case 'chat':
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl text-gray-600">Chat Coming Soon</Text>
          </View>
        );
      case 'profile':
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl text-gray-600">Profile Coming Soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Navbar 
        organizerData={organizerData} 
        onMenuPress={handleMenuPress}
      />
      <View className="flex-1">
        {renderContent()}
      </View>
      <BottomBar 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      {/* QR Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <QRScanner onClose={() => setIsScannerVisible(false)} />
      </Modal>
    </View>
  );
}
