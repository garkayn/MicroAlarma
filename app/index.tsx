import useLocation from "@/hooks/useLocation";
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';


export default function HomeScreen() {
  const { latitude, longitude, errorMsg } = useLocation(); // mostrar errorMsg cuando no se den permisos

  const [destinationMarker, setDestinationMarker] = useState<{
    coordinates: { latitude: number; longitude: number };
    title: string;
    draggable: boolean;
  } | null>(null);

  const cameraPosition = {
    coordinates: {
      latitude: latitude,
      longitude: longitude,
    },
    zoom: 15,
  };

  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={StyleSheet.absoluteFill} cameraPosition={cameraPosition} />
  } else if (Platform.OS === 'android') {
    return (
      <>
        <GoogleMaps.View 
          style={StyleSheet.absoluteFill} 
          cameraPosition={cameraPosition}
          properties={{
            isBuildingEnabled: true,
            isIndoorEnabled: true,
            mapType: GoogleMapsMapType.NORMAL,
            selectionEnabled: true,
            isMyLocationEnabled: true, // faltan permisos
            isTrafficEnabled: true,
          }}
          onMapClick={(e) => {
            setDestinationMarker({
              coordinates: { latitude: e.latitude, longitude: e.longitude },
              title: "Destino",
              draggable: false,
            });
          }}
          
          markers={destinationMarker ? [destinationMarker] : []}
        />
      </>
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

const styles = StyleSheet.create({
  controlsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});