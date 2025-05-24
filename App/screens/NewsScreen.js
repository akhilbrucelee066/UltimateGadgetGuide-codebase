import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { fetchNews } from "../services/newsApi";
import { summarizeArticle } from "../services/summarizer_gemini";
import { saveArticle, getCurrentUser } from "../services/firebase";

const NewsItem = ({ article, onPress, onSave }) => (
  <TouchableOpacity style={styles.newsItem} onPress={onPress}>
    <View style={styles.newsImagePlaceholder}>
      {article.thumbnail && (
        <Image source={{ uri: article.thumbnail }} style={styles.newsImage} />
      )}
    </View>
    <View style={styles.newsContent}>
      <Text style={styles.newsTitle} numberOfLines={2}>
        {article.title}
      </Text>
      <Text style={styles.newsSubtitle} numberOfLines={1}>
        {article.description}
      </Text>
      <Text style={styles.newsTime}>
        {new Date(article.date).toLocaleString()}
      </Text>
    </View>
    <TouchableOpacity style={styles.bookmarkButton} onPress={onSave}>
      <Icon name="bookmark-border" size={24} color="purple" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const BannerItem = ({ article, onPress }) => (
  <TouchableOpacity
    style={styles.bannerContainer}
    onPress={() => onPress(article)}
  >
    <View style={styles.bannerImageContainer}>
      <Image source={{ uri: article.thumbnail }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerText} numberOfLines={2} ellipsizeMode="tail">
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
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={30} color="white" />
      </View>
    </View>
    {article.isDeal && (
      <View style={styles.dealContainer}>
        <Text style={styles.dealText}>Special Deal</Text>
      </View>
    )}
  </TouchableOpacity>
);

const NewsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Local");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab]);

  const refreshNews = () => {
    loadNews(activeTab);
  };

  const loadNews = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching news for tab: ${tab}`);
      const response = await fetchNews(tab);
      console.log("API response:", response);
      if (response.success && response.data) {
        const newsArray = Object.values(response.data).map((item, index) => ({
          ...item,
          id: `news-${index}-${item.url}`,
        }));
        const shuffledNews = shuffleArray([...newsArray]);

        const deals = shuffledNews.filter(
          (item) =>
            item.title.toLowerCase().includes("sale") ||
            item.title.toLowerCase().includes("deal") ||
            item.title.toLowerCase().includes("discount")
        );

        const regularNews = shuffledNews.filter(
          (item) =>
            !item.title.toLowerCase().includes("sale") &&
            !item.title.toLowerCase().includes("deal") &&
            !item.title.toLowerCase().includes("discount")
        );

        const bannerItems =
          deals.length > 0 ? deals.slice(0, 4) : shuffledNews.slice(0, 4);
        setBanners(bannerItems);

        const remainingNews = shuffleArray([...regularNews, ...deals.slice(4)]);
        setNews([...remainingNews, ...bannerItems]);
      } else {
        setError("No news data available");
      }
    } catch (err) {
      console.error("Error fetching news:", err.message);
      setError("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleSaveArticle = async (article) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to save articles.");
      return;
    }

    setIsLoading(true);
    try {
      const saved = await saveArticle(userId, article);
      setIsLoading(false);
      if (saved) {
        Alert.alert("Success", "Article saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save the article. Please try again.");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      setIsLoading(false);
      Alert.alert(
        "Error",
        "An error occurred while saving the article. Please try again later."
      );
    }
  };

  const renderNewsItem = ({ item }) => (
    <NewsItem
      article={item}
      onPress={async () => {
        setIsLoading(true);
        try {
          const summary = await summarizeArticle(
            item.title,
            item.description,
            item.url
          );
          setIsLoading(false);
          navigation.navigate("ArticleView", { article: item, summary });
        } catch (error) {
          console.error("Error summarizing article:", error);
          setIsLoading(false);
          navigation.navigate("ArticleView", { article: item });
        }
      }}
      onSave={() => handleSaveArticle(item)}
    />
  );

  const onPressBanner = async (article) => {
    setIsLoading(true);
    try {
      const summary = await summarizeArticle(article.url);
      setIsLoading(false);
      navigation.navigate("ArticleView", { article, summary });
    } catch (error) {
      console.error("Error summarizing article:", error);
      setIsLoading(false);
      navigation.navigate("ArticleView", { article, summary: null });
    }
  };

  const ListHeader = () => (
    <>
      <FlatList
        horizontal
        data={banners}
        renderItem={({ item }) => (
          <BannerItem article={item} onPress={() => onPressBanner(item)} />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.bannerList}
      />
      <View style={styles.newsForYouSection}>
        <Text style={styles.sectionTitle}>News for You</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Local" && styles.activeTab]}
          onPress={() => setActiveTab("Local")}
        >
          <Text style={styles.tabText}>Local</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Global" && styles.activeTab]}
          onPress={() => setActiveTab("Global")}
        >
          <Text style={styles.tabText}>Global</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="purple" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item, index) => `news-${index}-${item.url}`}
          ListHeaderComponent={ListHeader}
          style={styles.newsList}
          contentContainerStyle={styles.newsListContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshNews}
              colors={["purple"]}
              tintColor="purple"
            />
          }
        />
      )}
      {isLoading && <LoadingOverlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  categoryContainer: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 6,
    position: "absolute",
    top: StatusBar.currentHeight || 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#1E1E1E",
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
  bannerList: {
    marginTop: -35,
  },
  bannerContainer: {
    width: 315,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 26,
    overflow: "hidden",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  newArrivalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  newArrivalsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    color: "orange",
    fontSize: 14,
  },
  newsForYouSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  newsList: {
    flex: 1,
    marginHorizontal: 14,
  },
  newsListContent: {
    paddingTop: 60,
    paddingBottom: 60,
  },
  newsItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  newsImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#444",
    borderRadius: 8,
    marginRight: 16,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  newsSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  newsTime: {
    fontSize: 12,
    color: "#666",
  },
  addButton: {
    justifyContent: "center",
    paddingLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#333333",
    borderRadius: 25,
    margin: 10,
    marginTop: 46,
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
  dealBanner: {
    backgroundColor: "#FF4500",
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
  arrowContainer: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
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

const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="purple" />
    <Text style={styles.loadingText}>AI is gathering best for you...</Text>
  </View>
);

export default NewsScreen;

//Sample API response:

// {
// success:true,
// total:20,
// data:{
// 0:{
// title:"Garena Free Fire Max Redeem Codes: Prizes and more for October 7, 2024",
// url:"https://www.moneycontrol.com/technology/garena-free-fire-max-redeem-codes-prizes-and-more-for-october-7-2024-article-12836892.html",
// date:"2024-10-07T03:54:13+00:00",
// thumbnail:"https://images.moneycontrol.com/static-mcnews/2024/10/20241007035347_garena1.jpg",
// description:"These 12-character alphanumeric codes enhance the overall gaming experience by offering rewards",
// source:{
// name:"Moneycontrol",
// url:"https://www.moneycontrol.com"
// favicon:"https://staticns.bonai.io/publisher/G77TkCk0g7AqfMD0gRG4b3g8qLsHMFt3tgtLFKpo",
// keywords:{
// 0:"Garena",
// 1:"Garena FreeFire"},
// authors:{
// 0:"Diya Sharma"
// }
// }
// }
