import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SvgXml } from "react-native-svg";
import SearchBar from "./App/components/SearchBar";
import IntroScreen from "./App/screens/IntroScreen";
import { CompareProvider } from "./App/context/CompareContext";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "./App/services/firebase";

initializeApp(firebaseConfig);

import HomeScreen from "./App/screens/HomeScreen";
import NewsScreen from "./App/screens/NewsScreen";
import PriceTrackerScreen from "./App/screens/PriceTrackerScreen";
import ProductViewScreen from "./App/screens/ProductViewScreen";
import ProfileScreen from "./App/screens/ProfileScreen";
import BotViewScreen from "./App/screens/BotViewScreen";
import ArticleViewScreen from "./App/screens/ArticleViewScreen";
import ProductListViewScreen from "./App/screens/ProductListViewScreen";
import CompareViewScreen from "./App/screens/CompareViewScreen";
import SignInScreen from "./App/screens/SignInScreen";
import SignUpScreen from "./App/screens/SignUpScreen";
import LoadingScreen from "./App/screens/LoadingScreen";

type RootStackParamList = {
  Intro: undefined;
  Main: undefined;
  ProductView: { productId: string };
  Profile: undefined;
  BotView: { initialMessage: string };
  ArticleView: undefined;
  ProductListView: { selectedRange: string };
  PriceTracker: undefined;
  CompareView: undefined;
  SignIn: undefined;
  SignUp: undefined;
  LoadingScreen: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const PriceTrackerIcon = ({ color, size }: { color: string; size: number }) => {
  const priceTrackerIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 59 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.8299 40.7042L38.5345 36.9948L42.4028 37.7297L36.6522 26.1068L29.3931 32.773L21.5165 16.4674L23.9623 14.2418L30.4168 27.4844L37.6759 20.8182L44.8071 35.5218L45.7937 30.3286L48.5567 30.8535L46.377 42.3279L37.8299 40.7042Z" fill="${color}"/>
      <path d="M15.3854 38.3438H18.1125L18.1271 38.2417L13.5479 33.3956L13.5771 33.3125H13.7958C14.8361 33.3125 15.7062 33.0063 16.4062 32.3938C17.1062 31.7812 17.5332 31.0181 17.6872 30.1042H18.8417V28.7333H17.6604C17.6021 28.4319 17.5073 28.1476 17.376 27.8802C17.2448 27.6128 17.0722 27.3625 16.8583 27.1292H18.8417V25.7583H9.30417V27.3479H13.7917C14.2903 27.3479 14.7073 27.4767 15.0427 27.7344C15.3781 27.992 15.609 28.325 15.7354 28.7333H9.30417V30.1042H15.7646C15.6479 30.5222 15.417 30.8747 15.0719 31.1615C14.7267 31.4483 14.2868 31.5917 13.7521 31.5917H10.85V33.4L15.3854 38.3438ZM14 43.375C12.4267 43.375 10.9483 43.0759 9.56462 42.4778C8.18115 41.8795 6.97764 41.0677 5.95408 40.0424C4.93053 39.0169 4.11979 37.813 3.52187 36.4307C2.92396 35.0486 2.625 33.5717 2.625 32C2.625 30.4267 2.92406 28.9483 3.52217 27.5646C4.12047 26.1812 4.93228 24.9776 5.95758 23.9541C6.98308 22.9305 8.18699 22.1198 9.56929 21.5219C10.9514 20.924 12.4283 20.625 14 20.625C15.5732 20.625 17.0517 20.9241 18.4354 21.5222C19.8188 22.1205 21.0224 22.9323 22.0459 23.9576C23.0695 24.9831 23.8802 26.187 24.4781 27.5693C25.076 28.9514 25.375 30.4283 25.375 32C25.375 33.5732 25.0759 35.0517 24.4778 36.4354C23.8795 37.8188 23.0677 39.0224 22.0424 40.0459C21.0169 41.0695 19.813 41.8802 18.4307 42.4781C17.0486 43.076 15.5717 43.375 14 43.375Z" fill="${color}"/>
    </svg>
  `;

  return <SvgXml xml={priceTrackerIcon} width={size} height={size} />;
};

function HomeTabs() {
  const searchBarRef = useRef(null);

  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Home") {
              return <Icon name="home" size={size} color={color} />;
            } else if (route.name === "News") {
              return <Icon name="web" size={size} color={color} />;
            } else if (route.name === "Price Tracker") {
              return <PriceTrackerIcon color={color} size={size + 15} />;
            }
          },
          tabBarActiveTintColor: "orange",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#2A2A2A",
            borderTopWidth: 0,
          },
          keyboardHidesTabBar: true,
          tabBarShowLabel: false,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="News" component={NewsScreen} />
        <Tab.Screen name="Price Tracker" component={PriceTrackerScreen} />
      </Tab.Navigator>
      <SearchBar
        ref={searchBarRef}
        onChangeText={(text) => {
        }}
        placeholder="Search..."
      />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return (
    <CompareProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [layouts.screen.width, 0, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            {showIntro ? (
              <Stack.Screen name="Intro">
                {(props) => (
                  <IntroScreen
                    {...props}
                    onLoadingComplete={() => setShowIntro(false)}
                  />
                )}
              </Stack.Screen>
            ) : user ? (
              <>
                <Stack.Screen name="Main" component={HomeTabs} />
                <Stack.Screen
                  name="ProductView"
                  component={ProductViewScreen}
                />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="BotView" component={BotViewScreen} />
                <Stack.Screen
                  name="ArticleView"
                  component={ArticleViewScreen}
                />
                <Stack.Screen
                  name="ProductListView"
                  component={ProductListViewScreen}
                />
                <Stack.Screen
                  name="PriceTracker"
                  component={PriceTrackerScreen}
                />
                <Stack.Screen
                  name="CompareView"
                  component={CompareViewScreen}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
              </>
            )}
            <Stack.Screen
              name="LoadingScreen"
              component={LoadingScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </CompareProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  tabContainer: {
    flex: 1,
    position: "relative",
  },
});
