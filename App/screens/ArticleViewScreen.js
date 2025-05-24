import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, Image, Linking, Alert, Share } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { saveArticle, getCurrentUser } from '../services/firebase';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const ArticleViewScreen = ({ route, navigation }) => {
  const { article, summary } = route.params;
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(3200);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  const openOriginalArticle = () => {
    Linking.openURL(article.url);
  };

  const handleSaveArticle = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to save articles.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveArticle(userId, article);
      setIsSaving(false);
      if (saved) {
        Alert.alert("Success", "Article saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save the article. Please try again.");
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setIsSaving(false);
      Alert.alert("Error", "An error occurred while saving the article. Please try again later.");
    }
  };

  const handleLikeArticle = () => {
    setIsLiked(!isLiked);
    setLikesCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
  };

  const handleShareArticle = async () => {
    try {
      const result = await Share.share({
        message: `Check out this article: ${article.title}\n\n${article.description}\n\nRead more: ${article.url}`,
        url: article.url,
        title: article.title,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while sharing the article');
      console.error('Error sharing article:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />
      <View style={styles.statusBarPlaceholder} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveArticle} disabled={isSaving}>
            <Icon name={isSaving ? "hourglass-empty" : "bookmark-border"} size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLikeArticle}>
            <Icon name={isLiked ? "favorite" : "favorite-border"} size={24} color={isLiked ? "red" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareArticle}>
            <Icon name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: article.thumbnail }} style={styles.image} />
        <View style={styles.purpleBackground}>
          <View style={styles.content}>
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.infoContainer}>
              <View style={styles.authorInfo}>
                <Text style={styles.author}>By {article.author || 'Unknown'}</Text>
                <Text style={styles.date}>Published On: {new Date(article.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.likesContainer}>
                <Icon name="favorite" size={16} color="red" />
                <Text style={styles.likesCount}>{(likesCount / 1000).toFixed(1)}k</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.articleContent}>
          <Text style={styles.paragraph}>{article.description}</Text>
          {summary && (
            <>
              <Text style={styles.sectionTitle}>Key Takeaways</Text>
              <View style={styles.paragraph}>
                {Object.entries(summary.TakeAway_points_10).map(([key, value]) => (
                  <Text key={key} style={styles.highlightItem}>• {value}</Text>
                ))}
              </View>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.paragraph}>{summary.Summary_in_650_words}</Text>
              <Text style={styles.sectionTitle}>Conclusion</Text>
              <Text style={styles.paragraph}>{summary.Conclusion_in_45_words}</Text>
            </>
          )}
          <TouchableOpacity style={styles.viewOriginalButton} onPress={openOriginalArticle}>
            <Text style={styles.viewOriginalText}>View Original</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  statusBarPlaceholder: {
    height: STATUSBAR_HEIGHT,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'purple',
    borderRadius: 25,
    marginLeft: 16,
    padding: 4,
    borderColor: 'white',
    borderWidth: 0.40,
  },
  image: {
    height: 225,
    borderRadius: 16,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    color: '#fff',
  },
  date: {
    fontSize: 12,
    color: '#ddd',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    marginLeft: 4,
    color: '#fff',
    fontSize: 14,
  },
  articleContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  highlightsList: {
    marginBottom: 16,
  },
  highlightItem: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 5,
    paddingLeft: 15,
  },
  paragraph: {
    fontSize: 14,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    color: '#ddd',
    marginBottom: 16,
    lineHeight: 20,
  },
  viewOriginalButton: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  viewOriginalText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ArticleViewScreen;
