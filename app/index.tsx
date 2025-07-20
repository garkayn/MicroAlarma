import { locationList } from "@/LocationList";
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useState } from 'react';
import { Platform, Text } from 'react-native';

export default function HomeScreen() {
  const [locationIndex, setLocationIndex] = useState(0);

  const cameraPosition = {
    coordinates: {
      latitude: locationList[0].stores[0].point[0],
      longitude: locationList[0].stores[0].point[1],
    },
    zoom: 10,
  };

  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} cameraPosition={cameraPosition} />;
  } else if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View 
        style={{ flex: 1 }} cameraPosition={cameraPosition} />
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}