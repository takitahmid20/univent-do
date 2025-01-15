import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const defaultImage = 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

export default function Navbar({ organizerData, onMenuPress }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <TouchableOpacity
        onPress={onMenuPress}
        className="p-2"
      >
        <MaterialIcons name="menu" size={24} color="#1F2937" />
      </TouchableOpacity>

      <View className="flex-row items-center">
        <View className="mr-3">
          <Text className="text-gray-800 font-semibold text-right">
            {organizerData?.organizationName || organizerData?.username || 'Organization'}
          </Text>
          <Text className="text-gray-500 text-xs text-right">
            {organizerData?.organizationCategory || 'Organizer'}
          </Text>
        </View>
        <Image
          source={{ 
            uri: organizerData?.profilePicture || defaultImage
          }}
          className="w-10 h-10 rounded-full bg-gray-200"
          defaultSource={require('../assets/default-profile.png')}
        />
      </View>
    </View>
  );
}
