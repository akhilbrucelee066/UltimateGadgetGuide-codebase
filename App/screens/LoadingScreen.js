import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

const messages = [
  "AI is gathering the best for you...",
  "Gathering sources...",
  "AI is working...",
  "Response is loading...",
];

const LoadingScreen = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const intervalId = setInterval(() => {
      fadeOut(() => {
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % messages.length
        );
        fadeIn();
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const fadeIn = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(callback);
  };

  const fadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(callback);
  };

  useEffect(() => {
    fadeIn();
  }, [currentMessageIndex]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="purple" />
      <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
        {messages[currentMessageIndex]}
      </Animated.Text>
      <Animated.Text style={[styles.subText, { opacity: fadeAnim }]}>
        Please wait...
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  text: {
    color: "white",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  subText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default LoadingScreen;
