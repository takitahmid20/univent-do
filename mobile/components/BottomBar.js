import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function BottomBar({ activeTab, onTabPress }) {
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 5; // Divide screen into 5 equal parts

  const tabs = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      IconComponent: MaterialIcons
    },
    {
      key: 'events',
      label: 'My Events',
      icon: 'event',  // Changed from calendar-month to event
      IconComponent: MaterialIcons
    },
    {
      key: 'scanner',
      label: 'Scan QR',
      icon: 'qrcode-scan',
      IconComponent: MaterialCommunityIcons,
      isSpecial: true
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: 'chat',
      IconComponent: MaterialIcons
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'person',
      IconComponent: MaterialIcons
    }
  ];

  const renderTab = (tab, index) => {
    const isActive = activeTab === tab.key;
    const { IconComponent, isSpecial } = tab;
    
    if (isSpecial) {
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(tab.key)}
          style={{ width: tabWidth }}
          className="items-center justify-end"
        >
          <View className="bg-blue-500 p-3 rounded-full shadow-lg -mt-6">
            <IconComponent 
              name={tab.icon} 
              size={28}
              color="#fff"
            />
          </View>
          <Text className="text-xs mt-1 font-medium text-blue-500">
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabPress(tab.key)}
        style={{ width: tabWidth }}
        className="items-center justify-end"
      >
        <IconComponent 
          name={tab.icon} 
          size={24}
          color={isActive ? '#3B82F6' : '#6B7280'}
        />
        <Text className={isActive ? "text-xs mt-1 font-medium text-blue-500" : "text-xs mt-1 font-medium text-gray-500"}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 pt-2 pb-2">
      <View className="flex-row justify-between items-end px-2">
        {tabs.map(renderTab)}
      </View>
    </View>
  );
}
