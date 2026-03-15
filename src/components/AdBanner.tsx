import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  unitId?: string;
  size?: BannerAdSize;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  unitId = Platform.select({
    android: 'ca-app-pub-4099234210747390/5030777154',
    ios: 'ca-app-pub-4099234210747390/5030777154',
  }), 
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER 
}) => {
  if (!unitId) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={unitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

export default AdBanner;
