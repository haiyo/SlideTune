import React, { useEffect } from 'react';
import { AppRegistry, View, Text, Button } from 'react-native';
import firebase from '@react-native-firebase/app';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { name as appName } from './app.json';

const LoginScreen = () => {
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
        firebase.initializeApp(firebaseConfig);

        GoogleSignin.configure({
            webClientId: '572461214426-m0s93krtdt2vk2s58evserfvtog4mg91.apps.googleusercontent.com',
            offlineAccess: true,
        });

        AppRegistry.registerComponent(appName, () => App);
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            // Sign in with Google
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            console.log(googleCredential)

            // Sign in to Firebase with the Google credential
            await auth().signInWithCredential(googleCredential);
        } catch (error) {
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

   return (
        <View>
            <Text>Login Screen</Text>
            <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
        </View>
    );
};

export default LoginScreen;