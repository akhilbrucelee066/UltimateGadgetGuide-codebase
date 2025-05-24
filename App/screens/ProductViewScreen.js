import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { useCompare } from "../context/CompareContext";
import {
  addToPriceTrack,
  removeFromPriceTrack,
  getCurrentUser,
  checkIfProductTracked,
} from "../services/firebase";

const CircularProgress = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#444"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.statValue, { position: "absolute" }]}>
        {progress}%
      </Text>
    </View>
  );
};

const ProductViewScreen = ({ route }) => {
  const { productData } = route.params;
  const navigation = useNavigation();
  const { compareProducts, addToCompare } = useCompare();
  const [activeTab, setActiveTab] = useState("overview");
  const [isTracking, setIsTracking] = useState(false);
  const [userId, setUserId] = useState(null);

  const { p1 = {}, p2 = {}, p3 = {}, p4 = {} } = productData || {};

  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
      checkTracking(user.uid);
    }
  }, []);

  useEffect(() => {
    if (contentWidth > 0) {
      Animated.loop(
        Animated.timing(scrollX, {
          toValue: -contentWidth,
          duration: contentWidth * 20,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [contentWidth]);

  const checkTracking = async (uid) => {
    const isTracked = await checkIfProductTracked(uid, p1.product_title);
    setIsTracking(isTracked);
  };

  const handlePriceTrackerToggle = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to track prices.");
      return;
    }

    try {
      if (isTracking) {
        await removeFromPriceTrack(userId, p1.product_title);
      } else {
        const currentPrice = Math.min(
          p1.realtime_discounted_price_Amazon_india,
          p1.realtime_discounted_price_Flipkart_india
        );
        const productUrl =
          p1.realtime_product_url_amazon_india ||
          p1.realtime_product_url_flipkart_india;

        await addToPriceTrack(
          userId,
          p1.product_title,
          currentPrice,
          currentPrice,
          productUrl
        );
      }
      setIsTracking(!isTracking);
      Alert.alert(
        isTracking ? "Removed from Price Tracker" : "Added to Price Tracker"
      );
    } catch (error) {
      console.error("Error toggling price tracker:", error);
      Alert.alert("Error", "Failed to update price tracker");
    }
  };

  const handleWhereToBuy = () => {
    const amazonPrice = p1.realtime_discounted_price_Amazon_india;
    const flipkartPrice = p1.realtime_discounted_price_Flipkart_india;
    const url =
      amazonPrice <= flipkartPrice
        ? p1.realtime_product_url_amazon_india
        : p1.realtime_product_url_flipkart_india;
    Linking.openURL(url);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Icon key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(
          <Icon key={i} name="star-border" size={16} color="#FFD700" />
        );
      }
    }

    return stars;
  };

  const handleAddToCompare = () => {
    if (compareProducts.length === 0) {
      addToCompare(productData);
      Alert.alert(
        "Product Added",
        "This product has been added for comparison. Please add another product to view the comparison.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else if (compareProducts.length === 1) {
      addToCompare(productData);
      navigation.navigate("CompareView");
    } else {
      Alert.alert(
        "Comparison Full",
        "You can only compare two products at a time."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "detail" && styles.activeTab]}
            onPress={() => setActiveTab("detail")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "detail" && styles.activeTabText,
              ]}
            >
              In Detail
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.productTitleContainer}>
          <View style={styles.productTitleBackground}>
            <Text style={styles.productName}>
              {p1?.product_title || "Product Name Not Available"}
            </Text>
          </View>
        </View>

        <View style={styles.ratingsContainer}>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>User Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(p2.user_rating_out_of_5)}
              <Text style={styles.ratingText}>
                {p2.user_rating_out_of_5.toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>Expert Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(p2.expert_rating_out_of_5)}
              <Text style={styles.ratingText}>
                {p2.expert_rating_out_of_5.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tagsContainerWrapper}>
          <Animated.View
            style={[
              styles.tagsScrollContent,
              {
                transform: [
                  {
                    translateX: scrollX.interpolate({
                      inputRange: [-contentWidth, 0],
                      outputRange: [0, -contentWidth],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            onLayout={(event) => {
              setContentWidth(event.nativeEvent.layout.width);
            }}
          >
            {[...Object.values(p4), ...Object.values(p4)].map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            ₹
            {Math.min(
              p1.realtime_discounted_price_Amazon_india,
              p1.realtime_discounted_price_Flipkart_india
            ).toLocaleString("en-IN")}
          </Text>
          <View style={styles.buyContainer}>
            <TouchableOpacity style={styles.buyButton}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.buyButtonText}>best to buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={handleWhereToBuy}
            >
              <Icon name="store" size={20} color="#fff" />
              <Text style={styles.buyButtonText}>where to buy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.priceDisclaimer}>
          The price may vary from real-time so please visit official sources
        </Text>

        <View style={styles.statsContainer}>
          {Object.entries(p2 || {})
            .filter(([key]) => key.startsWith("rating_out_of_100_sp"))
            .map(([key, value], index) => (
              <View key={index} style={styles.statItem}>
                <CircularProgress
                  progress={value?.rating || 0}
                  size={80}
                  strokeWidth={8}
                  color="#7048e8"
                />
                <Text style={styles.statLabel}>
                  {value?.specification_name || "N/A"}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.allSlidersContainer}>
          {Object.entries(p2 || {})
            .filter(([key]) => key.startsWith("rating_out_of_100_sp"))
            .map(([key, value], index) => (
              <View key={index} style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>
                  {value?.specification_name || "N/A"}
                </Text>
                <View style={styles.slider}>
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${value?.rating || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.sliderValue}>{value?.rating || 0}/100</Text>
              </View>
            ))}
        </View>

        {activeTab === "overview" && (
          <View style={[styles.sectionContainer, styles.productDetailsSection]}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.bulletPointContainer}>
              {Object.values(p3.all_product_details_specifications).map(
                (spec, index) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {spec}
                  </Text>
                )
              )}
            </View>
          </View>
        )}

        {activeTab === "detail" && (
          <>
            <View
              style={[styles.sectionContainer, styles.overallVerdictSection]}
            >
              <Text style={styles.sectionTitle}>Quick Take</Text>
              {Object.values(p3.Quick_Take_on_all_specifications).map(
                (take, index) => (
                  <Text key={index} style={styles.sectionText}>
                    {take}
                  </Text>
                )
              )}
            </View>

            <View
              style={[styles.sectionContainer, styles.overallVerdictSection]}
            >
              <Text style={styles.sectionTitle}>Overall Verdict</Text>
              {Object.values(p3.Overall_verdict_with_pros_cons).map(
                (verdict, index) => (
                  <Text key={index} style={styles.sectionText}>
                    {verdict}
                  </Text>
                )
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.addToCompareButton}
          onPress={handleAddToCompare}
        >
          <Icon name="library-add" size={24} color="#fff" />
          <Text style={styles.addToCompareText}>
            Add to Compare {compareProducts.length === 1 ? "(1)" : ""}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.floatingButton,
          isTracking && styles.floatingButtonAdded,
        ]}
        onPress={handlePriceTrackerToggle}
      >
        <View style={styles.floatingButtonContent}>
          <Icon name={isTracking ? "check" : "add"} size={20} color="#fff" />
        </View>
        <Text style={styles.floatingButtonText}>
          {isTracking ? "Tracking" : "Track Price"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A2A2A",
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    zIndex: 1,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 17,
  },
  scrollContent: {
    flex: 1,
    marginTop: 100,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#333333",
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 0.38,
    marginLeft: 53,
    padding: 4,
    elevation: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "purple",
    borderColor: "#fff",
    borderWidth: 0.38,
    elevation: 13,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  productTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 10,
  },
  productTitleBackground: {
    backgroundColor: "rgba(112, 72, 232, 0.1)",
    borderColor: "rgba(112, 72, 232, 0.3)",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
  },
  productName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(112, 72, 232, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 14,
    marginVertical: 10,
  },
  ratingBox: {
    alignItems: "center",
    flex: 1,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4,
  },
  tagsContainerWrapper: {
    marginHorizontal: 26,
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    overflow: "hidden",
  },
  tagsScrollContent: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  tag: {
    backgroundColor: "purple",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderColor: "#fff",
    borderWidth: 0.38,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  currentPrice: {
    fontSize: 38,
    marginLeft: 19,
    fontWeight: "bold",
    color: "orange",
  },
  buyContainer: {
    flexDirection: "column",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "purple",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
    width: "33%",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  allSlidersContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
  },
  slider: {
    height: 4,
    backgroundColor: "#444",
    marginBottom: 4,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "purple",
  },
  sliderValue: {
    fontSize: 12,
    color: "#ccc",
    alignSelf: "flex-end",
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  bulletPointContainer: {
    marginLeft: 8,
  },
  bulletPoint: {
    color: "#E1BEE7",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
  sectionText: {
    color: "#E1BEE7",
    fontSize: 14,
    lineHeight: 20,
  },
  productDetailsSection: {
    backgroundColor: "#2A2A2A",
  },
  overallVerdictSection: {
    backgroundColor: "#311B92",
    borderRadius: 20,
  },
  addToCompareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "purple",
    padding: 10,
    marginHorizontal: 50,
    marginTop: 24,
    marginBottom: 100,
    borderRadius: 50,
  },
  addToCompareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 18,
    marginRight: 16,
  },
  floatingButton: {
    position: "absolute",
    right: 15,
    bottom: 35,
    backgroundColor: "purple",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 20,
    marginRight: 8,
    borderColor: "#fff",
    borderWidth: 0.38,
  },
  floatingButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 4,
  },
  floatingButtonAdded: {
    backgroundColor: "green",
  },
  floatingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceDisclaimer: {
    fontSize: 10,
    color: "#ccc",
    textAlign: "center",
    marginTop: 4,
    marginHorizontal: 16,
  },
});

export default ProductViewScreen;
