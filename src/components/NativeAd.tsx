import React from 'react';
import { View, Platform, Text } from 'react-native';
import { NativeAdView, CallToActionView, IconView, HeadlineView, TaglineView, AdvertiserView } from 'react-native-google-mobile-ads';

interface NativeAdProps {
  unitId?: string;
}

const NativeAd: React.FC<NativeAdProps> = ({ 
  unitId = Platform.select({
    android: 'ca-app-pub-4099234210747390/8937033460',
    ios: 'ca-app-pub-4099234210747390/8937033460',
  }) || ''
}) => {
  if (!unitId) return null;

  return (
    <NativeAdView
      style={{
        width: '100%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd'
      }}
      adUnitID={unitId}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconView style={{ width: 40, height: 40, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <HeadlineView style={{ fontWeight: 'bold', fontSize: 16 }} />
          <TaglineView style={{ fontSize: 12, color: 'gray' }} />
        </View>
      </View>
      <AdvertiserView style={{ fontSize: 10, color: 'green', marginTop: 5 }} />
      <CallToActionView
        style={{
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
          alignItems: 'center'
        }}
        textStyle={{ color: 'white', fontWeight: 'bold' }}
      />
    </NativeAdView>
  );
};

export default NativeAd;
