import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const PriceRangeButton = ({ price, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isSelected && styles.activeCategory]}
    onPress={() => onPress(price)}
  >
    <Text
      style={[styles.categoryText, isSelected && styles.activeCategoryText]}
    >
      {price}
    </Text>
  </TouchableOpacity>
);

const ProductItem = ({ item }) => (
  <View style={styles.productItem}>
    <View style={styles.productImagePlaceholder} />
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productSpecs}>{item.specs}</Text>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={16} color="gold" />
        <Text style={styles.ratingText}>{item.rating}</Text>
        <Text style={styles.reviewCount}>({item.reviewCount})</Text>
      </View>
      <Text style={styles.productPrice}>₹{item.price}</Text>
    </View>
    <TouchableOpacity style={styles.openButton}>
      <Text style={styles.openButtonText}>Open</Text>
    </TouchableOpacity>
  </View>
);

const ProductListViewScreen = ({ route, navigation }) => {
  const initialRange = route.params?.selectedRange || "10k";
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const priceRanges = ["10k", "15k", "20k", "30k", "above"];
  const products = [
    {
      id: "1",
      name: "Samsung Galaxy M35 5G",
      specs: "(Ocean Blue, 128 GB)(6 GBRAM)",
      rating: 4.5,
      reviewCount: "2,344",
      price: "17,999",
    },
    {
      id: "2",
      name: "OPPO Reno10 Pro 5G",
      specs: "(Glossy Purple, 256 GB)(12 GB RAM)",
      rating: 4.5,
      reviewCount: "27,344",
      price: "17,999",
    },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Best in Range (${selectedRange})`,
    });
  }, [selectedRange, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Best in Range ({selectedRange})
          </Text>
        </View>
        <FlatList
          data={priceRanges}
          renderItem={({ item }) => (
            <PriceRangeButton
              price={item}
              isSelected={item === selectedRange}
              onPress={(price) => setSelectedRange(price)}
            />
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        />
      </View>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem item={item} />}
        keyExtractor={(item) => item.id}
        ListFooterComponent={() => (
          <>
            <Text style={styles.sectionTitle}>More like this</Text>
            <View style={styles.moreLikeThisGrid}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <View key={item} style={styles.moreLikeThisItem}>
                  <View style={styles.moreLikeThisImagePlaceholder} />
                  <Text style={styles.moreLikeThisName}>Product Name</Text>
                  <Text style={styles.moreLikeThisSubName}>Sub Name</Text>
                  <Text style={styles.moreLikeThisPrice}>₹12,499</Text>
                </View>
              ))}
            </View>
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    backgroundColor: "#2A2A2A",
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    marginLeft: 70,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  categoryContainer: {
    paddingHorizontal: 25,
    paddingVertical: 6,
    backgroundColor: "#1E1E1E",
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
  },
  categoryText: {
    color: "white",
  },
  activeCategoryText: {
    fontWeight: "bold",
  },
  productItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#444",
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  productSpecs: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    color: "white",
    marginLeft: 4,
  },
  reviewCount: {
    color: "#ccc",
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },
  openButton: {
    backgroundColor: "purple",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  openButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    margin: 16,
  },
  moreLikeThisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  moreLikeThisItem: {
    width: "48%",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  moreLikeThisImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#444",
    borderRadius: 8,
    marginBottom: 8,
  },
  moreLikeThisName: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    marginBottom: 2,
  },
  moreLikeThisSubName: {
    fontSize: 12,
    color: "white",
    marginBottom: 4,
  },
  moreLikeThisPrice: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
});

export default ProductListViewScreen;
