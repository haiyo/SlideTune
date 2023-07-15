import React, { useState, useEffect, useLayoutEffect, useRef, useMemo  } from 'react';
import { StyleSheet, View, ScrollView, Image, Animated, Dimensions, StatusBar, PanResponder, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const SlideShowScreen = ({ route }) => {
    const { albumId, photos } = route.params;
    const navigation = useNavigation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const opacity = useRef(new Animated.Value(0)).current;
    const videoRefs = useRef([]);
    const intervalId = useRef([]);
    const opacityValues = useRef(photos.map(() => new Animated.Value(0)));
    const onAlmostEndThreshold = 1; // seconds
    const [videoDurations, setVideoDurations] = useState([]);
    const [isAlmostEnd, setIsAlmostEnd] = useState(false);

    const SWIPE_THRESHOLD = 150;

    useLayoutEffect(() => {
        // Hide the title bar
        navigation.setOptions({
          headerShown: false,
        });

        // Show the slideshow in full-screen mode
        StatusBar.setHidden(true);

        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

    const fadeIn = (index) => {
        const currentPhoto = photos[currentIndex];
        //console.log(currentPhoto)
        if (currentPhoto.type.startsWith('video/')) {
            //console.log(videoRef.current)
            videoRefs.current[index].setNativeProps({ paused: false });
        }

        console.log("fade in: ", index)
        Animated.timing(opacityValues.current[index], {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start(() => {
            // Check if the current index is still the same after the animation completes
            console.log(currentIndex + " === " + index)

            if (currentIndex === index) {
                if (!photos[currentIndex].type.startsWith('video/')) {
                    // Start the fade-out animation after 5 seconds
                    intervalId.current = setInterval(() => {
                        fadeOut("left");
                    }, 5000);
                }
            }
        });
    };

    const fadeOut = (direction) => {
        console.log("FADING OUT: " + currentIndex)
        //console.log("current level: ", opacityValues.current[currentIndex])

        const lastIndex = photos.length - 1;

        setCurrentIndex((prevIndex) => {
            const currentPhoto = photos[prevIndex];

            let nextIndex = 0;

            if (direction === "right" && prevIndex === 0) {
                nextIndex = lastIndex;
            }
            else if (direction === "right") {
                nextIndex = prevIndex - 1;
                nextIndex = nextIndex < 0 ? 0 : nextIndex;
                console.log("right index: " + nextIndex)
            }
            else if (direction === "left" && prevIndex === lastIndex) {
                nextIndex = 0;
            }
            else if (direction === "left") {
                nextIndex = prevIndex + 1;
                nextIndex = nextIndex > lastIndex ? 0 : nextIndex;
            }

            console.log("Next index: " + nextIndex);
            return nextIndex;
        });

        Animated.timing(opacityValues.current[currentIndex], {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
        }).start(() => {
            if (photos[currentIndex].type.startsWith('video/')) {
                setIsAlmostEnd(false);
                videoRefs.current[currentIndex].seek(0);
                videoRefs.current[currentIndex].setNativeProps({ paused: true });
            }
        });
    };

    const handleVideoLoad = (index, data) => {
        const newDurations = [...videoDurations];
        newDurations[index] = data.duration;
        setVideoDurations(newDurations);

        // if first element is a video just play.
        if(index !== 0) {
            videoRefs.current[index].setNativeProps({ paused: true });
        }
    };

    const onAlmostEnd = (index, currentTime) => {
        const videoDuration = videoDurations[index];
        const timeRemaining = videoDuration - currentTime;

        console.log("isAlmostEnd " + isAlmostEnd)

        if (timeRemaining <= onAlmostEndThreshold && !isAlmostEnd) {
            // Perform actions when the video is almost at its end
            console.log("Video start fading out")
            setIsAlmostEnd(true);
            fadeOut("left");
        }
    };

    const pauseRewind = (index) => {
        console.log("pauseRewind called!")
        // if its video in current and finished playing, pause and reset.
        if (photos[currentIndex].type.startsWith('video/')) {
            videoRefs.current[index].seek(0);
            videoRefs.current[index].setNativeProps({ paused: true });
            setIsAlmostEnd(false);
        }
    };

    useEffect(() => {
        // Only set timing for photos. We want video to finish playing till end.
        /*if (!photos[currentIndex].type.startsWith('video/')) {
            intervalId.current = setInterval(() => {
                fadeOut("left");
            }, 6000);
        }*/

        fadeIn(currentIndex);

        return () => clear(intervalId.current);
    }, [currentIndex]);

    const clear = (f) => {
        console.log("clear")
        clearInterval(f);
    };

    const handleSwipe = (direction) => {
        fadeOut(direction);
    };

    const handleExit = () => {
        navigation.goBack();
    };

    const panResponder = useMemo(() => {
        return PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) >= 1 || Math.abs(gestureState.dy) >= 1
            },
            onPanResponderRelease: (evt, gestureState) => {
                console.log(gestureState)

                const { dx } = gestureState;

                if (dx > SWIPE_THRESHOLD) {
                    console.log("swiped right");
                    handleSwipe("right");
                }
                else if (dx < -SWIPE_THRESHOLD) {
                    console.log("swiped left");
                    handleSwipe("left");
                }
                else if (gestureState.dy < -90) {
                    console.log("swiped up");
                    handleExit();
                }
            },
        })
    }, [currentIndex]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}
            {...panResponder.panHandlers}>
                {photos.map((photo, index) => {
                    const zIndex = index === 0 ? 2 : 1;
                    //const testopacity = index === 0 ? .5 : 1;

                    if (photo.type.startsWith('video/')) {
                        return (
                            <Animated.View key={index} style={{
                                position: 'absolute',
                                zIndex: zIndex,
                                width: width, height: height,
                                display: 'flex',
                                opacity: opacityValues.current[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 1],
                                         }),
                                /*transform: [{
                                    scale: opacityValues.current[index].interpolate({
                                               inputRange: [0, 1],
                                               outputRange: [0, 1],
                                            })
                                }],*/
                                ...panResponder.panHandlers, }}>
                                <Video
                                    style={{ flex: 1 }}
                                    source={{ uri: photo.uri}}
                                    resizeMode="cover"
                                    preload="auto"
                                    repeat={true}
                                    shouldPlay={false}
                                    playInBackground={true}
                                    onEnd={() => pauseRewind(index)}
                                    onProgress={({ currentTime }) => onAlmostEnd(index, currentTime)}
                                    onLoad={(data) => handleVideoLoad(index, data)}
                                    ref={(ref) => (videoRefs.current[index] = ref)}
                                  />
                            </Animated.View>
                        );
                    }
                    else if (photo.type.startsWith('image/')) {
                        return (
                            <Animated.View
                                key={index}
                                source={{ uri: photo.uri }}
                                style={styles.imageContainer,[
                                {
                                    position: 'absolute',
                                    zIndex: zIndex,
                                    width: width, height: height,
                                    opacity: opacityValues.current[index],
                                    //transform: [{ scale: opacityValues.current[index] }],
                                    display: 'flex'
                                },
                            ]}>
                                <Image
                                    source={{ uri: photo.uri }}
                                    style={{ flex: 1, resizeMode: 'cover' }}
                                />
                            </Animated.View>
                        );
                    }
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    },
    scrollView: {
        position: 'relative',
        width: width, height: height
    },
    imageContainer: {

    },
    image: {
        resizeMode: 'cover'
    },
});

export default SlideShowScreen;