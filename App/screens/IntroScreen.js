import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import * as Font from "expo-font";

const quotes = [
  "Discover the future of tech with us.",
  "Smart shopping for smart gadgets.",
  "Stay ahead with the latest in tech.",
  "Your personal gadget guide is here.",
  "Unlock the potential of your devices.",
];

const loadingMessages = [
  "AI is working its magic...",
  "Gathering the best data for you...",
  "Preparing cutting-edge content...",
  "Optimizing your tech experience...",
];

const IntroScreen = ({ onLoadingComplete }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [quoteOpacity] = useState(new Animated.Value(0));
  const [loadingOpacity] = useState(new Animated.Value(0));
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentLoading, setCurrentLoading] = useState(0);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Tiny5: require("../../assets/fonts/Tiny5-Regular.ttf"),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(quoteOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 1000);

    const loadingInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentLoading((prev) => (prev + 1) % loadingMessages.length);
    }, 1000);

    const loadingTimer = setTimeout(() => {
      onLoadingComplete();
    }, 3000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(loadingInterval);
      clearTimeout(loadingTimer);
    };
  }, []);

  if (!fontLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.logo}>U.G.G</Text> */}
      <Text style={styles.logo}>Ultimate Gadget Guide</Text>
      <Animated.Text style={[styles.quote, { opacity: quoteOpacity }]}>
        {quotes[currentQuote]}
      </Animated.Text>
      <Animated.Text style={[styles.loading, { opacity: loadingOpacity }]}>
        {loadingMessages[currentLoading]}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  logo: {
    fontFamily: "Tiny5",
    fontSize: 72,
    color: "orange",
    marginBottom: 50,
  },
  quote: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  loading: {
    fontSize: 14,
    color: "#7048e8",
    position: "absolute",
    bottom: 50,
  },
});

export default IntroScreen;
