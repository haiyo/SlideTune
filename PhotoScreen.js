import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Image , Text, TextInput, Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';

const PhotoScreen = ({ route }) => {
    const { photo } = route.params;

    useEffect(() => {
        console.log(photo)
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.photoContainer}>
                {photo.type.startsWith('video/') ? (
                      <Video
                          style={{ flex: 1, width: '100%' }}
                          source={{ uri: photo.uri}}
                          resizeMode="cover"
                          preload="auto"
                          repeat={true}
                          shouldPlay={true}
                          playInBackground={false}
                      />
                ) : (
                      <Image source={{ uri: photo.uri }} style={styles.photo} />
                )}
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleModalOpen('deleteAlbum')}>
                    <FontAwesomeIcon icon={ faTrashCan } style={ styles.plusIcon } size={ 25 }  />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
    photoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        zIndex: 2
    },
    actionButton: {
        backgroundColor: '#3fbac2',
        borderRadius: 50,
        height: 45,
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        zIndex: 2,
    },
    plusIcon: {
        color: '#fff'
    },
});

export default PhotoScreen;