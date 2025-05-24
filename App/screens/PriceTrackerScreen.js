import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  getCurrentUser,
  getTrackedProducts,
  removeFromPriceTrack,
  getSavedArticles,
  removeArticle,
} from "../services/firebase";
import { searchProduct } from "../services/product_search";
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl } from "react-native";
import { summarizeArticle } from "../services/summarizer_gemini";

const TrackedProduct = ({ product, onRemove }) => {
  const oldPrice = parseFloat(product.productOldPrice);
  const newPrice = parseFloat(product.productNewPrice);

  const priceChange =
    !isNaN(oldPrice) && !isNaN(newPrice) && oldPrice !== 0
      ? ((newPrice - oldPrice) / oldPrice) * 100
      : 0;

  const priceChangeFormatted = isFinite(priceChange)
    ? Math.abs(priceChange).toFixed(2)
    : "0.00";

  const handleProductPress = () => {
    if (product.productUrl && typeof product.productUrl === "string") {
      Linking.openURL(product.productUrl).catch((err) =>
        console.error("Couldn't load page", err)
      );
    } else {
      console.error("Invalid product URL:", product.productUrl);
      Alert.alert("Error", "Product URL not available or invalid");
    }
  };

  return (
    <TouchableOpacity onPress={handleProductPress} style={styles.productItem}>
      <View style={styles.productInfo}>
        <View style={styles.titleContainer}>
          <Text
            style={styles.productName}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {product.productTitle}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Then</Text>
            <Text style={styles.oldPrice}>
              ₹{!isNaN(oldPrice) ? oldPrice.toFixed(2) : "N/A"}
            </Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Now</Text>
            <Text style={styles.currentPrice}>
              ₹{!isNaN(newPrice) ? newPrice.toFixed(2) : "N/A"}
            </Text>
          </View>
          <View style={styles.priceChangeContainer}>
            <Icon
              name={priceChange < 0 ? "arrow-downward" : "arrow-upward"}
              size={16}
              color={priceChange < 0 ? "green" : "red"}
            />
            <Text
              style={[
                styles.priceChange,
                { color: priceChange < 0 ? "green" : "red" },
              ]}
            >
              {priceChangeFormatted}%
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.openButton}
          onPress={handleProductPress}
        >
          <Text style={styles.openButtonText}>Open</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Icon name="close" size={20} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const SavedItem = ({ item, onPress, onRemove }) => (
  <TouchableOpacity onPress={onPress} style={styles.savedItem}>
    <View style={styles.savedItemContent}>
      <Text style={styles.savedItemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.savedItemDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </View>
    <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
      <Icon name="close" size={20} color="red" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const PriceTrackerScreen = ({ navigation }) => {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("Price Tracker");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const user = getCurrentUser();
      if (user) {
        setUserId(user.uid);
        fetchTrackedProducts(user.uid);
        fetchSavedArticles(user.uid);
      }
    }, [])
  );

  const fetchTrackedProducts = async (uid) => {
    setIsLoading(true);
    try {
      const products = await getTrackedProducts(uid);
      setTrackedProducts(products);
    } catch (error) {
      console.error("Error fetching tracked products:", error);
      Alert.alert("Error", "Failed to fetch tracked products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedArticles = async (uid) => {
    try {
      const articles = await getSavedArticles(uid);
      setSavedArticles(articles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      Alert.alert("Error", "Failed to fetch saved articles");
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await removeFromPriceTrack(userId, productId);
      fetchTrackedProducts(userId);
    } catch (error) {
      console.error("Error removing product:", error);
      Alert.alert("Error", "Failed to remove product from tracking");
    }
  };

  const handleRemoveArticle = async (articleId) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to remove saved articles.");
      return;
    }

    try {
      await removeArticle(articleId);
      setSavedArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== articleId)
      );
      Alert.alert("Success", "Article removed successfully!");
    } catch (error) {
      console.error("Error removing saved article:", error);
      Alert.alert("Error", "Failed to remove saved article");
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate("ProductView", { productId: product.productId });
  };

  const handleArticlePress = async (article) => {
    setIsLoading(true);
    try {
      const summary = await summarizeArticle(
        article.title,
        article.description,
        article.url
      );
      setIsLoading(false);
      navigation.navigate("ArticleView", { article, summary });
    } catch (error) {
      console.error("Error summarizing article:", error);
      setIsLoading(false);
      navigation.navigate("ArticleView", { article });
    }
  };

  const handleProductSearch = async (query) => {
    try {
      const result = await searchProduct(query);
      console.log("Search result:", result);
      Alert.alert("Search Result", result);
    } catch (error) {
      console.error("Error searching product:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert(
        "Search Error",
        "Unable to complete the search. Please try again."
      );
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) {
        if (activeTab === "Price Tracker") {
          await fetchTrackedProducts(userId);
        } else {
          await fetchSavedArticles(userId);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    }
    setRefreshing(false);
  }, [userId, activeTab]);

  const renderProduct = ({ item }) => (
    <TrackedProduct
      product={item}
      onRemove={() => handleRemoveProduct(item.id)}
    />
  );

  const renderSavedItem = ({ item }) => (
    <SavedItem
      item={item}
      onPress={() => handleArticlePress(item)}
      onRemove={() => handleRemoveArticle(item.id)}
    />
  );

  const renderContent = () => {
    if (activeTab === "Price Tracker") {
      return (
        <FlatList
          data={trackedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.productTitle}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        />
      );
    } else {
      return (
        <FlatList
          data={savedArticles}
          renderItem={renderSavedItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Price Tracker" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Price Tracker")}
        >
          <Text style={styles.tabText}>Price Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Saved" && styles.activeTab]}
          onPress={() => setActiveTab("Saved")}
        >
          <Text style={styles.tabText}>Saved</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activeTab}</Text>
      </View>
      {renderContent()}
      {isLoading && <LoadingOverlay />}
    </SafeAreaView>
  );
};

const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="purple" />
    <Text style={styles.loadingText}>Fetching Data...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingTop: StatusBar.currentHeight,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#333333",
    borderRadius: 25,
    margin: 10,
    padding: 5,
    borderColor: "#fff",
    borderWidth: 0.38,
    elevation: 16,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "purple",
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 0.38,
    elevation: 16,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tabText: {
    color: "white",
    marginLeft: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  list: {
    flex: 1,
  },
  productItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#333333",
    borderRadius: 10,
    margin: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 30,
  },
  titleContainer: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceColumn: {
    alignItems: "flex-start",
  },
  priceLabel: {
    fontSize: 12,
    color: "#BBBBBB",
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: 14,
    color: "white",
  },
  currentPrice: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceChange: {
    fontSize: 14,
    marginLeft: 4,
  },
  openButton: {
    backgroundColor: "purple",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  openButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  savedItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#333333",
    borderRadius: 10,
    margin: 10,
  },
  savedItemContent: {
    flex: 1,
  },
  savedItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 14,
    marginBottom: 4,
  },
  savedItemDescription: {
    fontSize: 14,
    color: "#999",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
});

export default PriceTrackerScreen;
