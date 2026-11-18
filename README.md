# MicroAlarma

Prototipo Android en React Native y Expo para seleccionar un punto en el mapa y avisar con sonido y vibración cuando el punto elegido queda dentro de 400 metros de la ubicación actual. Permite guardar destinos en el almacenamiento local del dispositivo.

## Tecnologías

- React Native 0.79 y Expo SDK 53
- Expo Maps, Expo Location y Expo Audio
- AsyncStorage para destinos guardados

## Configuración y ejecución

Se requiere Node.js y Android Studio con un emulador o un dispositivo Android. La vista de mapa de este proyecto está disponible solo en Android.

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y configura `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` con una clave restringida para la aplicación Android.
3. Inicia Expo:

   ```bash
   npx expo start
   ```

Para compilar una aplicación Android localmente, usa `npx expo run:android` con Android Studio y el SDK configurados.

## Estado y limitaciones

La alarma del prototipo se activa al seleccionar un punto que ya está dentro del radio indicado. El código no mantiene una geocerca ni un servicio de ubicación en segundo plano para detectar automáticamente una llegada posterior. La clave de Maps debe restringirse por aplicación y API en Google Cloud; no guardes credenciales de Expo ni claves de firma en Git.

Proyecto universitario. Añade los créditos del equipo y una captura de la aplicación antes de presentarlo como un proyecto terminado.
