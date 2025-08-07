import useLocation from "@/hooks/useLocation";
import { useAudioPlayer } from 'expo-audio';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import { useState } from 'react';
import { Button, Platform, StyleSheet, Text, Vibration } from 'react-native';

const audioSource = require('../assets/ringtone.mp3');

export default function HomeScreen() {

  // Alarma
  const player = useAudioPlayer(audioSource);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Coordenadas usuario
  const  { latitude, longitude, errorMsg } = useLocation(); // mostrar errorMsg cuando no se den permisos

  // Calculo distancia entre 2 coordenadas
  const haversine = require('haversine')

  const start = {
    latitude: latitude,
    longitude: longitude
  }

  // Hook para crear y cambiar el estado del marcador en el mapa
  const [destinationMarker, setDestinationMarker] = useState<{
    coordinates: { latitude: number; longitude: number };
    draggable: boolean;
    showCallout: boolean;
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
      <><GoogleMaps.View 
        style={StyleSheet.absoluteFill} 
        cameraPosition={cameraPosition}
        properties={{
          isBuildingEnabled: true,
          isIndoorEnabled: true,
          mapType: GoogleMapsMapType.NORMAL,
          selectionEnabled: true,
          isMyLocationEnabled: true,
          isTrafficEnabled: true,
        }}
        onMapClick={(e) => {
          // Coordenadas destino
          const end = {
            latitude: e.latitude,
            longitude: e.longitude
          }

          // Calculo distancia usuario-destin
          const distancia = haversine(start, end, {unit: 'meter'})
          if (distancia <= 400) {
            Vibration.vibrate([1000, 1000], true);
            player.play()
            setIsPlaying(true)
          }
          // Creación propiedades marker
          setDestinationMarker({
            coordinates: { latitude: e.latitude, longitude: e.longitude },
            draggable: false,
            showCallout: false,
          });
        }}
        onPOIClick={(e)=>{
          // Coordenadas destino
          const end = {
            latitude: e.coordinates.latitude,
            longitude: e.coordinates.longitude
          }

          // Calculo distancia usuario-destin
          const distancia = haversine(start, end, {unit: 'meter'})
          if (distancia <= 400) {
            Vibration.vibrate([1000, 1000], true);
            player.play()
            setIsPlaying(true)
          }
          // Creación propiedades marker
            setDestinationMarker({
            coordinates: { latitude: e.coordinates.latitude, longitude: e.coordinates.longitude },
            draggable: false,
            showCallout: false,
            });
          }}
          markers={destinationMarker ? [destinationMarker] : []}
          polylines={
            destinationMarker
            ? [
              {
                coordinates: [
                { latitude, longitude },
                { latitude: destinationMarker.coordinates.latitude, longitude: destinationMarker.coordinates.longitude },
                ],
                color: "#FF0000",
                width: 4,
              },
              ]
            : []
          }
          />
          // Se utiliza hook para condicionar la aparición del botón para detener la alarma
          {isPlaying && (
            <Button
            title="Detener sonido"
            onPress={() => {
              player.pause();
              Vibration.cancel();
              setIsPlaying(false);
            }}
          />
        )}
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