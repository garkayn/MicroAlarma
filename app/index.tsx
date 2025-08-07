import useLocation from "@/hooks/useLocation";
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import { useState } from 'react';
import { Button, Platform, StyleSheet, Text, Vibration } from 'react-native';

export default function HomeScreen() {

  const audioSource = require('../assets/ringtone.mp3');

  const STORAGE_KEY = '@user_preferred_destinations';

  interface Destination {
    id: string;
    name: string;
    coordinates: { latitude: number; longitude: number; };
  }

  /* 
  Guarda un array de destinos en AsyncStorage.
  @param {Destination} destinations - El array de destinos a guardar.
  @returns {Promise<void>} Una promesa que se resuelve cuando la operación se completa.
  
  const saveDestinations = async (destinations: Destination): Promise<void> => {
      try {
          const jsonValue = JSON.stringify(destinations);
          await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
          console.log('Destinos guardados exitosamente.');
      } catch (e) {
          console.error('Error al guardar los destinos:', e);
      }
  };
  */

  /*
  Recupera todos los destinos guardados de AsyncStorage.
  @returns {Promise<Destination | null>} Una promesa que se resuelve con el array de destinos o null si no hay datos.
  
  const getDestinations = async (): Promise<Destination | null> => {
      try {
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          // Es crucial verificar si jsonValue es null antes de intentar JSON.parse()
          return jsonValue!= null? JSON.parse(jsonValue) : null;
      } catch (e) {
          console.error('Error al recuperar los destinos:', e);
          return null; // Retorna null o un array vacío en caso de error
      }
  };
  */

  // Alarma
  const player = useAudioPlayer(audioSource);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isSaved, setIsSaved] = useState<boolean | undefined>(undefined);

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
        uiSettings={{
          zoomControlsEnabled: false,
        }}
        onMapClick={(e) => {
          setIsSaved(false)
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
          setIsSaved(false)
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
        {isSaved == false && (
          <Button
            title="Guardar destino"
            onPress={() => {
              console.log("Guardado")
              setIsSaved(true);
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