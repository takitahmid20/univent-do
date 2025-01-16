import React, { useState, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 24,
    zIndex: 1,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 2,
  },
  successAlert: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)', // Green background
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red background
  },
  alertTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertMessage: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  attendeeInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    width: '100%',
  },
  attendeeName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  attendeeDetails: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  }
});

export default function QRScanner({ onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, title, message, attendeeDetails = null) => {
    setAlert({ type, title, message, attendeeDetails });
    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      setAlert(null);
      setIsProcessing(false);
    }, 3000);
  };

  const handleBarCodeScanned = useCallback(async (result) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showAlert('error', 'Authentication Error', 'Please login again');
        return;
      }

      const response = await axios.post(
        'https://univent-backend.onrender.com/api/events/check-in/qr/',
        // 'http://172.20.10.3:5656/api/events/check-in/qr/',
        // 'http://192.168.68.106:5656/api/events/check-in/qr/',
        { registration_id: result.data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.message) {
        const attendeeDetails = {
          name: response.data.registration_details?.username || 'Unknown',
          eventName: response.data.registration_details?.title || 'Unknown Event',
          checkInTime: new Date(response.data.check_in_time).toLocaleTimeString()
        };

        showAlert(
          'success',
          'Check-in Successful',
          response.data.message,
          attendeeDetails
        );
      }
    } catch (error) {
      console.error('Check-in error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process check-in';
      showAlert('error', 'Check-in Failed', errorMessage);
    }
  }, [isProcessing]);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={false}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
          interval: 500,
        }}
        onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {alert && (
            <View style={[
              styles.alertContainer,
              alert.type === 'success' ? styles.successAlert : styles.errorAlert
            ]}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              {alert.type === 'success' && alert.attendeeDetails && (
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>
                    {alert.attendeeDetails.name}
                  </Text>
                  <Text style={styles.attendeeDetails}>
                    {alert.attendeeDetails.eventName}
                  </Text>
                  <Text style={styles.attendeeDetails}>
                    Checked in at: {alert.attendeeDetails.checkInTime}
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.centerContent}>
            <View style={styles.scannerFrame}>
              <Text style={styles.text}>
                {isProcessing ? 'Processing...' : 'Scan QR Code'}
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
