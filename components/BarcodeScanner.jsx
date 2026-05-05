import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';
import { getFoodByBarcode, getFoodByBarcodeAPI,
  createFood } from '../db/nutrition';

const BarcodeScanner = ({ visible, onFound, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    // Check local first
    let food = getFoodByBarcode(data);

    // Hit API if not found locally
    if (!food) {
      food = await getFoodByBarcodeAPI(data);
      if (food) {
        try { createFood({ ...food, is_custom: 0 }); } catch (e) {}
      }
    }

    setLoading(false);

    if (food) {
      onFound(food);
    } else {
      onFound(null);
    }
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.bg,
          alignItems: 'center', justifyContent: 'center',
          padding: 40 }}>
          <Ionicons name="camera-outline" size={48} color={colors.muted} />
          <Text style={{ color: colors.white, fontSize: font.lg,
            fontWeight: '800', marginTop: 16,
            textAlign: 'center' }}>Camera Permission Required</Text>
          <Text style={{ color: colors.muted, fontSize: font.sm,
            textAlign: 'center', marginTop: 8 }}>
            RepBase needs camera access to scan barcodes
          </Text>
          <TouchableOpacity onPress={requestPermission}
            style={{ marginTop: 24, backgroundColor: colors.accent,
              borderRadius: radius.button, paddingHorizontal: 32,
              paddingVertical: 14 }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md }}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}
            style={{ marginTop: 12 }}>
            <Text style={{ color: colors.muted }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleScan}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
          }}
        >
          {/* Overlay */}
          <View style={{ flex: 1, justifyContent: 'center',
            alignItems: 'center' }}>
            <View style={{ width: 280, height: 180,
              borderWidth: 2, borderColor: colors.accent,
              borderRadius: 12, backgroundColor: 'transparent' }} />
            <Text style={{ color: colors.white, marginTop: 16,
              fontSize: font.md, textAlign: 'center' }}>
              {loading ? 'Looking up barcode...' : 'Point camera at barcode'}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity onPress={onClose}
            style={{ position: 'absolute', top: 60, right: 20,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 20, padding: 10 }}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>

          {scanned && !loading && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={{ position: 'absolute', bottom: 60,
                alignSelf: 'center', backgroundColor: colors.accent,
                borderRadius: radius.button, paddingHorizontal: 32,
                paddingVertical: 14 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md }}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </CameraView>
      </View>
    </Modal>
  );
};

export default BarcodeScanner;
