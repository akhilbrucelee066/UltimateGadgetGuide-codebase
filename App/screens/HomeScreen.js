import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import * as Font from "expo-font";
import { fetchNews } from "../services/newsApi";
import { summarizeArticle } from "../services/summarizer_gemini";
import {
  getTrackedProducts,
  getCurrentUser,
  getUserProfile,
} from "../services/firebase";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const MemoizedCategoryItem = memo(({ item, selectedCategory, onPress }) => (
  <TouchableOpacity
    style={[
      styles.categoryButton,
      item === selectedCategory && styles.activeCategory,
    ]}
    onPress={() => onPress(item)}
  >
    <Text
      style={[
        styles.categoryText,
        item === selectedCategory && styles.activeCategoryText,
      ]}
    >
      {item}
    </Text>
  </TouchableOpacity>
));

const MemoizedPriceDropItem = memo(
  ({ item, onPress, calculatePriceDropPercentage }) => (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.priceDropItem}>
        <Text
          style={styles.productTitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.productTitle}
        </Text>
        <Text style={styles.productPrice}>₹{item.productNewPrice}</Text>
        <View style={styles.dropPercentageContainer}>
          <Text style={styles.dropPercentage}>
            {calculatePriceDropPercentage(
              item.productOldPrice,
              item.productNewPrice
            )}
            % OFF
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
);

const MemoizedTechItem = memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <View style={styles.techItem}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.techImagePlaceholder}
        resizeMode="cover"
      />
      <View style={styles.techTextContainer}>
        <Text
          style={styles.techItemName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <Text
          style={styles.techItemSpecs}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const searchInputRef = useRef(null);

  const [fontLoaded, setFontLoaded] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isPriceTrackedItemsLoading, setIsPriceTrackedItemsLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] = useState("mobiles");
  const [selectedRange, setSelectedRange] = useState("mid");

  const categories = [
    "all",
    "trending",
    "mobiles",
    "ear phones",
    "tws",
    "watch",
    "laptops",
    "tv",
  ];
  const priceRanges = ["low", "mid", "mid <", "high", "< pro"];

  const [allArticles, setAllArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [bannerArticles, setBannerArticles] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [priceTrackedItems, setPriceTrackedItems] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [userEmoji, setUserEmoji] = useState("😊");

  useEffect(() => {
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPriceTrackedItems();
      fetchUserProfile();
    }, [])
  );

  const loadInitialData = async () => {
    await loadFont();
    await fetchUserProfile();
    await fetchArticles();
    await loadPriceTrackedItems();
  };

  const loadFont = async () => {
    await Font.loadAsync({
      Tiny5: require("../../assets/fonts/Tiny5-Regular.ttf"),
    });
    setFontLoaded(true);
  };

  const fetchUserProfile = async () => {
    const user = getCurrentUser();
    if (user) {
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.selectedEmoji) {
          setUserEmoji(userProfile.selectedEmoji);
        } else {
          setUserEmoji("😊");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserEmoji("😊");
      }
    }
  };

  const fetchArticles = async () => {
    setIsNewsLoading(true);
    try {
      const response = await fetchNews("Local");
      if (response.success && response.data) {
        const newsArray = Object.values(response.data).map((item, index) => ({
          ...item,
          id: `news-${index}-${item.url}`,
        }));
        setAllArticles(newsArray);
        updateDisplayedArticles(newsArray);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsNewsLoading(false);
    }
  };

  const updateDisplayedArticles = (articles) => {
    const shuffledArticles = shuffleArray([...articles]);
    setLatestArticles(shuffledArticles.slice(0, 10));

    const dealArticles = shuffledArticles.filter(
      (item) =>
        item.title.toLowerCase().includes("sale") ||
        item.title.toLowerCase().includes("deal") ||
        item.title.toLowerCase().includes("discount")
    );
    setBannerArticles(dealArticles.slice(0, 4));
  };

  const loadPriceTrackedItems = async () => {
    setIsPriceTrackedItemsLoading(true);
    const user = getCurrentUser();
    if (user) {
      try {
        const products = await getTrackedProducts(user.uid);
        const sortedProducts = products.sort((a, b) => {
          const dropA = calculatePriceDropPercentage(
            a.productOldPrice,
            a.productNewPrice
          );
          const dropB = calculatePriceDropPercentage(
            b.productOldPrice,
            b.productNewPrice
          );
          return dropB - dropA;
        });
        const shuffledProducts = shuffleArray(sortedProducts);
        setPriceTrackedItems(shuffledProducts.slice(0, 2));
      } catch (error) {
        console.error("Error fetching price tracked items:", error);
      } finally {
        setIsPriceTrackedItemsLoading(false);
      }
    } else {
      setIsPriceTrackedItemsLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateDisplayedArticles(allArticles);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchArticles();
    await loadPriceTrackedItems();
    setIsRefreshing(false);
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

  const handleBannerPress = async (article) => {
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
      console.error("Error summarizing banner article:", error);
      setIsLoading(false);
      navigation.navigate("ArticleView", { article });
    }
  };

  const handleBestInRangePress = (range) => {
    const category = selectedCategory === "all" ? "gadgets" : selectedCategory;
    const message = `Suggest best ${category} products in the ${range} price range.`;
    navigation.navigate("BotView", { initialMessage: message });
  };

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <MemoizedCategoryItem
        item={item}
        selectedCategory={selectedCategory}
        onPress={handleCategoryChange}
      />
    ),
    [selectedCategory, handleCategoryChange]
  );

  const renderPriceDropItem = useCallback(
    ({ item }) => (
      <MemoizedPriceDropItem
        item={item}
        onPress={() =>
          navigation.navigate("Main", {
            screen: "Price Tracker",
            params: { activeTab: "Price Tracker" },
          })
        }
        calculatePriceDropPercentage={calculatePriceDropPercentage}
      />
    ),
    [navigation, calculatePriceDropPercentage]
  );

  const renderTechItem = useCallback(
    ({ item }) => <MemoizedTechItem item={item} onPress={handleArticlePress} />,
    [handleArticlePress]
  );

  const calculatePriceDropPercentage = (oldPrice, newPrice) => {
    const old = parseFloat(oldPrice);
    const new_ = parseFloat(newPrice);
    if (isNaN(old) || isNaN(new_) || old === 0) return 0;
    return Math.round(((old - new_) / old) * 100);
  };

  if (!fontLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />
      <View style={styles.header}>
        <Text style={styles.logo}>U.G.G</Text>
        <View style={styles.profileIcons}>
          <View style={[styles.dot, { backgroundColor: "white" }]} />
          <View style={[styles.dot, { backgroundColor: "purple" }]} />
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.profilePic}>
              <Text style={styles.profileEmoji}>{userEmoji}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Price Drop by</Text>
        {isPriceTrackedItemsLoading ? (
          <ActivityIndicator
            size="small"
            color="purple"
            style={styles.loadingSpinner}
          />
        ) : (
          <View style={styles.priceDropContainer}>
            {priceTrackedItems.length > 0 ? (
              priceTrackedItems.map((item, index) => (
                <MemoizedPriceDropItem
                  key={item.id || index}
                  item={item}
                  onPress={() =>
                    navigation.navigate("Main", {
                      screen: "Price Tracker",
                      params: { activeTab: "Price Tracker" },
                    })
                  }
                  calculatePriceDropPercentage={calculatePriceDropPercentage}
                />
              ))
            ) : (
              <>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Main", {
                      screen: "Price Tracker",
                      params: { activeTab: "Price Tracker" },
                    })
                  }
                >
                  <View style={styles.priceDropItem}>
                    <Text style={styles.productTitle}>Product Name</Text>
                    <Text style={styles.productPrice}>₹9999</Text>
                    <View style={styles.dropPercentageContainer}>
                      <Text style={styles.dropPercentage}>12% OFF</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Main", {
                      screen: "Price Tracker",
                      params: { activeTab: "Price Tracker" },
                    })
                  }
                >
                  <View style={styles.priceDropItem}>
                    <Text style={styles.productTitle}>Product Name</Text>
                    <Text style={styles.productPrice}>₹9999</Text>
                    <View style={styles.dropPercentageContainer}>
                      <Text style={styles.dropPercentage}>9% OFF</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Latest in Tech</Text>
        {isNewsLoading ? (
          <ActivityIndicator
            size="small"
            color="purple"
            style={styles.loadingSpinner}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={latestArticles}
            keyExtractor={(item) => item.id}
            renderItem={renderTechItem}
            style={styles.latestTechContainer}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        )}

        <Text style={styles.sectionTitle}>Best in Range</Text>
        <View style={styles.bestRangeContainer}>
          {priceRanges.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.rangeItem,
                item === selectedRange && styles.activeRangeItem,
              ]}
              onPress={() => handleBestInRangePress(item)}
            >
              <Text
                style={[
                  styles.rangeText,
                  item === selectedRange && styles.activeRangeText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("BotView", {
                initialMessage:
                  "I am looking to buy a gadget now. Is it a good time to buy or should I wait for an upcoming sale? If yes, when is the sale and can you guide me?",
              })
            }
          >
            <Icon name="access-time" size={24} color="white" />
            <Text style={styles.actionButtonText}>When to Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("BotView", {
                initialMessage:
                  "I am looking to buy something but don't know how to know if it fits my needs. Can you help me decide what to buy?",
              })
            }
          >
            <Icon name="shopping-cart" size={24} color="white" />
            <Text style={styles.actionButtonText}>What to Buy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Featured Deals</Text>
        {bannerArticles.map((article, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleBannerPress(article)}
          >
            <View style={styles.bannerContainer}>
              <View style={styles.bannerImageContainer}>
                <Image
                  source={{ uri: article.thumbnail }}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerTextContainer}>
                  <Text
                    style={styles.bannerText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {article.title}
                  </Text>
                  <Text
                    style={styles.bannerSubtext}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {article.description}
                  </Text>
                </View>
              </View>
              <View style={styles.dealContainer}>
                <Text style={styles.dealText}>Special Deal</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading && <LoadingOverlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
    backgroundColor: "#2A2A2A",
  },
  logo: {
    fontFamily: "Tiny5",
    fontSize: 38,
    color: "orange",
    marginLeft: 20,
    marginTop: -9,
  },
  profileIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderColor: "#fff",
    borderWidth: 0.5,
    overflow: "hidden",
  },
  profileEmoji: {
    fontSize: 24,
  },
  categoryContainer: {
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 0.38,
  },
  activeCategory: {
    backgroundColor: "purple",
    elevation: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  categoryText: {
    color: "white",
  },
  activeCategoryText: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
    marginLeft: 16,
  },
  priceDropContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginHorizontal: 10,
  },
  priceDropItem: {
    width: 160,
    height: 160,
    backgroundColor: "#2A2A2A",
    borderRadius: 15,
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  productPrice: {
    color: "orange",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dropPercentageContainer: {
    backgroundColor: "purple",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropPercentage: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  latestTechContainer: {
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
  },
  techItem: {
    width: 200,
    height: 200,
    backgroundColor: "#2A2A2A",
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  techImagePlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: "#444",
  },
  techTextContainer: {
    padding: 8,
    height: 80,
  },
  techItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  techItemSpecs: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 18,
  },
  bestRangeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  rangeItem: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 30,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeRangeItem: {
    backgroundColor: "purple",
  },
  rangeText: {
    color: "white",
    fontWeight: "bold",
  },
  activeRangeText: {
    color: "white",
  },
  newReleasesContainer: {
    marginBottom: 20,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  releaseItem: {
    width: 160,
    height: 240,
    marginRight: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    overflow: "hidden",
  },
  releaseImagePlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: "#444",
  },
  releaseTextContainer: {
    padding: 8,
  },
  releaseName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  releaseSubtitle: {
    fontSize: 12,
    color: "#ccc",
    marginBottom: 4,
  },
  releasePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "orange",
  },
  releaseOriginalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 5,
    marginTop: 20,
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "purple",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
  },
  bannerContainer: {
    marginHorizontal: 14,
    borderRadius: 26,
    marginVertical: 20,
    overflow: "hidden",
    backgroundColor: "#2A2A2A",
    height: 200,
  },
  bannerImageContainer: {
    flex: 1,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bannerTextContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 50,
  },
  bannerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bannerSubtext: {
    color: "white",
    fontSize: 14,
  },
  arrowContainer: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  dealContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealText: {
    color: "#FF4500",
    fontWeight: "bold",
  },
  scrollViewContent: {
    paddingBottom: 60,
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
  loadingSpinner: {
    marginVertical: 20,
  },
});

const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="purple" />
    <Text style={styles.loadingText}>AI is gathering best for you...</Text>
  </View>
);

export default HomeScreen;
