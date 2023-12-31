import React, { useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import HomeScreen from './HomeScreen';
import AddPhotosScreen from './AddPhotosScreen';
import PhotoScreen from './PhotoScreen';
import SlideShowScreen from './SlideShowScreen';
import { LogBox, StatusBar } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const Stack = createStackNavigator();

const App = () => {

    useLayoutEffect(() => {

        // Set the background color of the status bar to black
        StatusBar.setBackgroundColor('#000000');

        // Set the status bar to light content to ensure that the status bar icons are visible
        StatusBar.setBarStyle('light-content');

        // Show the slideshow in full-screen mode
        //StatusBar.setHidden(true);

        return () => {
          // Restore the status bar settings when the component unmounts
          //StatusBar.setBackgroundColor('#ffffff');
          //StatusBar.setBarStyle('dark-content');
          //StatusBar.setHidden(false);
        };
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator headerShown="false"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#000000', // Set navigation bar background color
                    },
                    headerTintColor: '#fff', // Set navigation bar text color
                    headerTitleStyle: {
                        fontWeight: 'bold', // Set navigation bar title font weight
                    },
                }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="PhotoScreen" component={PhotoScreen} />
                <Stack.Screen name="AddPhotosScreen" component={AddPhotosScreen} />
                <Stack.Screen name="SlideShowScreen" component={SlideShowScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;