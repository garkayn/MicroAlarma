import useLocation from "@/hooks/useLocation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { GoogleMaps } from 'expo-maps';
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import { useEffect, useState } from 'react';
import { Alert, Button, PermissionsAndroid, Platform, StyleSheet, Text, Vibration } from 'react-native';
export default function HomeScreen() {

  const solicitarPermiso = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const coarseGranted = granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
        const fineGranted = granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (fineGranted) {
          console.log('El usuario otorgó permiso de ubicación PRECISA');
        } else if (coarseGranted) {
          console.log('El usuario otorgó permiso de ubicación APROXIMADA');
        } else {
          console.log('El usuario DENEGÓ los permisos de ubicación');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  solicitarPermiso();

  const audioSource = require('../assets/ringtone.mp3');

  const STORAGE_KEY = '@user_preferred_destinations';

  interface Destination {
    id: string;
    name: string;
    coordinates: { latitude: number; longitude: number; };
  }

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [name, setName] = useState("");
  const [coordinates, setCoordinates] = useState<{coordinates: { latitude: number; longitude: number }} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const storedDestinations = await AsyncStorage.getItem("destinations")
      if (storedDestinations !== null) {
        setDestinations(JSON.parse(storedDestinations));
      }
    } catch(e) {
      Alert.alert("Error", "Failed to Load destinations");
    }
  }

  const saveDestinations = async (updatedDestinations: Destination[]) => {
    try {
      await AsyncStorage.setItem("destinations", JSON.stringify(updatedDestinations));
    } catch (e) {
      Alert.alert("Error", "Failde to save destinations")
    }
  }

  const addDestination = () => {
    if (editingId) {
      // Update existing destination
      const updatedDestinations = destinations.map((destination) =>
        destination.id === editingId
        ? { 
            ...destination, 
            name, 
            coordinates: coordinates ? coordinates.coordinates : destination.coordinates
          }
        : destination
      );
      setDestinations(updatedDestinations);
      saveDestinations(updatedDestinations);
      setEditingId(null);
    } else {
      // Add new destination
      const newDestination: Destination = {
        id: Date.now().toString(),
        name,
        coordinates: coordinates ? coordinates.coordinates : { latitude: 0, longitude: 0 }
      };
      const updatedDestinations = [...destinations, newDestination];
      setDestinations(updatedDestinations);
      saveDestinations(updatedDestinations);
    }

    // Reset form
    setName("");
    setCoordinates(null);
  }

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

    if (Platform.OS === 'android') {
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

          setName("Destino")
          setCoordinates({
            coordinates: { latitude: e.latitude, longitude: e.longitude },
          });
        }}
        onPOIClick={(e)=>{
          setIsSaved(false)
          // Coordenadas destino
          const end = {
            latitude: e.coordinates.latitude,
            longitude: e.coordinates.longitude
          }

          // Calculo distancia usuario-destino
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

            setName(e.name)
            setCoordinates({
            coordinates: { latitude: e.coordinates.latitude, longitude: e.coordinates.longitude },
          });
          }}
        markers={destinationMarker ? [destinationMarker] : []}
        
        />
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
                addDestination();
                console.log("Current destinations:", destinations);
              setIsSaved(true);
            }}
          />
        )}
      </>
    );
  } else {
    return <Text>Maps are only available on Android</Text>;
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