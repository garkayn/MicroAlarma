// utils/SearchPlaces.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
// You might need to import the Text component if you add any custom text later
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Ensure the function name matches the export name
const SearchPlaces = () => {
  return (
    // The View here is necessary to give the Autocomplete component layout space
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder='Search'
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          console.log(data, details);
        }}
        query={{
          key: 'AIzaSyDBXKpxcaTOeGYJZszbtESc680ZIH2heic',
          language: 'en',
        }}
        fetchDetails={true} // Add this if you need details like geometry
        // You might need to add styling here to make it visible
        styles={{
          textInputContainer: {
            width: '100%',
          },
          textInput: {
            height: 50,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: 'white',
            fontSize: 18,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This is important: gives the search bar a defined space to render
    flex: 1, 
    paddingTop: 50, // Example padding
    paddingHorizontal: 20,
    backgroundColor: 'white', // Set a background color if needed
  },
});

export default SearchPlaces;