import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Image, ImageBackground , Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import AddPhotosScreen from './AddPhotosScreen';
import AddAlbumPlaceholder from './AddAlbumPlaceholder';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faPhotoVideo } from '@fortawesome/free-solid-svg-icons';
import firebase from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { name as appName } from './app.json';

const HomeScreen = () => {
    const [albumTitle, setAlbumTitle] = useState('');
    const [albums, setAlbums] = useState([]);
    const titleInputRef = useRef(null);
    const navigation = useNavigation();
    const logo = require('./assets/img/logo.png');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const firebaseConfig = {
        apiKey: "AIzaSyDuq4wVyfSX9kx7ZYk2RUPmsGwB-8QW2dM",
        authDomain: "slidetunes-ec009.firebaseapp.com",
        projectId: "slidetunes-ec009",
        storageBucket: "slidetunes-ec009.appspot.com",
        messagingSenderId: "655104614346",
        appId: "1:655104614346:web:c9872cec3410ac10787933",
        measurementId: "G-065VST5S87",
        databaseURL: ""
    };

    useEffect(() => {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        else {
           firebase.app(); // if already initialized, use that one
        }

        const user = auth().currentUser;

        if (user) {
            console.log(user)
            setIsLoggedIn(true);
        }

        GoogleSignin.configure({
            webClientId: "655104614346-ochuj28ove5iifr89haec963q2l8k5nl.apps.googleusercontent.com",
            androidClientId: "655104614346-3mdrm47uifsqbha4oolrrn7gnh3p6ti9.apps.googleusercontent.com",
            offlineAccess: true
        });
    }, []);

    const handleGoogleSignIn = async () => {
        try {

    await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign in the user with the credential
            return auth().signInWithCredential(googleCredential);
        }
        catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the sign-in process
                console.log('Sign-in process cancelled');
            }
            else if (error.code === statusCodes.IN_PROGRESS) {
                // Sign-in process is already in progress
                console.log('Sign-in process already in progress');
            }
            else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // Play services not available or outdated
                console.log('Play services not available or outdated');
            }
            else {
                // Other error occurred
                console.error('Google Sign-In error:', error);
            }
        }
    };

    useEffect(() => {
        const getAlbums = async () => {
            const albums = await AsyncStorage.getItem('albums');
            let updatedAlbums = [];

            if (albums) {
                const parsedAlbums = JSON.parse(albums);

                // Loop through the albums and retrieve the photos from AsyncStorage
                updatedAlbums = await Promise.all(parsedAlbums.map(async album => {
                    const photos = await AsyncStorage.getItem(album.id);

                    if (photos) {
                        album.photos = JSON.parse(photos);
                    }
                    return album;
                }));
            }

            setAlbums([...updatedAlbums, { id: 'placeholder' }]);
        };
        getAlbums();
    }, [albums]);

    // Set Title
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={logo}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>SlideTunes</Text>
                </View>
            ),
            headerRight: () => (
                <TouchableWithoutFeedback onPress={() => handleGoogleSignIn()}>
                    <Text style={{ fontSize: 18, marginRight: 10, color: "#fff" }}>Login</Text>
                </TouchableWithoutFeedback>
            )
            });
    }, [navigation]);

    const handleClearStorage = async () => {
        try {
            await AsyncStorage.clear();
            console.log('Storage cleared successfully.');
        }
        catch (error) {
            console.log('Error clearing storage:', error);
        }
    }

    const handleCreateAlbum = async () => {
        // Create a new album object with the title and an empty array of photos
        const newAlbum = {
            id: Date.now().toString(),
            title: "Album " + albums.length,
            photos: [],
            music: []
        };

        // Add the new album to the existing albums array
        albums.push(newAlbum);

        // We don't want to save placeholder
        const parsedAlbums = albums.filter(a => a.id !== 'placeholder');

        // Save the updated albums array to AsyncStorage
        await AsyncStorage.setItem('albums', JSON.stringify(parsedAlbums));

        // Navigate to the AddPhotosScreen
        navigation.navigate('AddPhotosScreen', {
            album: newAlbum,
            onUpdatePhotos: handleUpdatePhotos
        });

        handleUpdatePhotos(newAlbum.id, []);
    };

    const handleUpdatePhotos = async (albumId, photos) => {
        if(albumId == null) {
            // An album has been deleted. Refresh list.
            setAlbums([]);
        }
        else {
            const updatedAlbums = albums.map((album) => {
                if (album.id === albumId) {
                    return { ...album, photos: photos };
                }
                return album;
            });
            setAlbums(updatedAlbums);
        }
    };

    const renderAlbum = ({ item }) => {
        if (item.id === 'placeholder') {
            return <AddAlbumPlaceholder onPress={handleCreateAlbum} />;
        }

        const backgroundImage = item.photos.length > 0 ? {uri: item.photos[0].uri} : null;

        return (
            <TouchableOpacity style={styles.albumContainer}
                              onPress={() => navigation.navigate('AddPhotosScreen',
                              { album: item, onUpdatePhotos: handleUpdatePhotos })}>
                {backgroundImage ? (
                    <ImageBackground source={backgroundImage} style={styles.albumBackground}>
                        <View style={styles.albumTitleContainer}>
                            <Text style={styles.albumTitle}>{item.title}</Text>
                        </View>
                    </ImageBackground>
                ) : (
                    <ImageBackground source={backgroundImage} style={styles.albumBackground}>
                        <View style={styles.albumIconContainer}>
                            <FontAwesomeIcon icon={faPhotoVideo} size={52} style={styles.fallbackIcon} />
                        </View>
                        <View style={styles.albumTitleContainer}>
                            <Text style={styles.albumTitle}>{item.title}</Text>
                        </View>
                    </ImageBackground>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={albums}
                renderItem={renderAlbum}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.albumList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    albumContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 5,
        height: 150,
        width: '100%',
    },
    albumItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    fallbackIcon: {
        alignItems: 'center'
    },
    albumIconContainer: {
        marginTop: 40,
        alignItems: 'center'
    },
    albumTitleContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 5,
    },
    albumTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#fff',
        textShadowColor: '#000',
        textShadowRadius: 1,
        padding: 5,
        paddingLeft: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(153, 153, 153, 0.5)',
    },
    albumList: {
        paddingVertical: 5,
        alignItems: "stretch"
    },
    albumBackground: {
        flex: 1,
        resizeMode: 'cover',
        ...StyleSheet.absoluteFill,
        borderRadius: 10,
        overflow: 'hidden'
    },
});

export default HomeScreen;
