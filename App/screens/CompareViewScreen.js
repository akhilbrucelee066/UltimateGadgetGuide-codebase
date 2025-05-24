import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCompare } from '../context/CompareContext';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const CompareViewScreen = () => {
  const { compareProducts, resetCompare } = useCompare();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();

      resetCompare();

      navigation.dispatch(e.data.action);
    });

    return unsubscribe;
  }, [navigation, resetCompare]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView style={styles.scrollContent}>
          <CompareSection products={compareProducts} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const CompareSection = ({ products }) => {
  const sections = [
    { title: 'Product Name', render: (product) => <ProductName product={product} /> },
    { title: 'Price', render: (product) => <Price product={product} /> },
    { title: 'Ratings', render: (product) => <Ratings product={product} /> },
    { title: 'Tags', render: (product) => <Tags product={product} /> },
    { title: 'Specifications', render: (product) => <Specifications product={product} /> },
    { title: 'Sliders', render: (product) => <Sliders product={product} /> },
    { title: 'Product Details', render: (product) => <ProductDetails product={product} /> },
    { title: 'Quick Take', render: (product) => <QuickTake product={product} /> },
    { title: 'Overall Verdict', render: (product) => <OverallVerdict product={product} /> },
  ];

  return (
    <View>
      {sections.map((section, index) => (
        <View key={index}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.sectionRow}>
            {products.map((product, productIndex) => (
              <View key={productIndex} style={styles.productColumn}>
                {section.render(product)}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const ProductName = ({ product }) => (
  <Text style={styles.productName}>{product.p1.product_title}</Text>
);

const Price = ({ product }) => (
  <Text style={styles.price}>
    ₹{Math.min(product.p1.realtime_discounted_price_Amazon_india, product.p1.realtime_discounted_price_Flipkart_india).toLocaleString('en-IN')}
  </Text>
);

const Ratings = ({ product }) => (
  <View style={styles.ratingContainer}>
    <StarRating label="User Rating" rating={product.p2.user_rating_out_of_5} />
    <StarRating label="Expert Rating" rating={product.p2.expert_rating_out_of_5} />
  </View>
);

const Tags = ({ product }) => (
  <View style={styles.tagsContainer}>
    {Object.values(product.p4).map((tag, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ))}
  </View>
);

const Specifications = ({ product }) => (
  <View style={styles.statsContainer}>
    {Object.entries(product.p2)
      .filter(([key]) => key.startsWith('rating_out_of_100_sp'))
      .map(([key, value], index) => (
        <View key={index} style={styles.statItem}>
          <CircularProgress 
            progress={value?.rating || 0} 
            size={80} 
            strokeWidth={8} 
            color="#7048e8" 
          />
          <Text style={styles.statLabel}>{value?.specification_name || 'N/A'}</Text>
        </View>
      ))}
  </View>
);

const Sliders = ({ product }) => (
  <View style={styles.allSlidersContainer}>
    {Object.entries(product.p2)
      .filter(([key]) => key.startsWith('rating_out_of_100_sp'))
      .map(([key, value], index) => (
        <View key={index} style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{value?.specification_name || 'N/A'}</Text>
          <View style={styles.slider}>
            <View style={[styles.sliderFill, { width: `${value?.rating || 0}%` }]} />
          </View>
          <Text style={styles.sliderValue}>{value?.rating || 0}/100</Text>
        </View>
      ))}
  </View>
);

const ProductDetails = ({ product }) => (
  <View style={styles.detailsContainer}>
    <Text style={styles.sectionTitle}>Product Details</Text>
    {Object.values(product.p3.all_product_details_specifications).map((spec, index) => (
      <Text key={index} style={styles.bulletPoint}>• {spec}</Text>
    ))}
  </View>
);

const QuickTake = ({ product }) => (
  <View style={styles.verdictContainer}>
    <Text style={styles.sectionTitle}>Quick Take</Text>
    {Object.values(product.p3.Quick_Take_on_all_specifications).map((take, index) => (
      <Text key={index} style={styles.verdictText}>{take}</Text>
    ))}
  </View>
);

const OverallVerdict = ({ product }) => (
  <View style={styles.verdictContainer}>
    <Text style={styles.sectionTitle}>Overall Verdict</Text>
    {Object.values(product.p3.Overall_verdict_with_pros_cons).map((verdict, index) => (
      <Text key={index} style={styles.verdictText}>{verdict}</Text>
    ))}
  </View>
);

const StarRating = ({ label, rating }) => (
  <View style={styles.starRatingContainer}>
    <Text style={styles.ratingLabel}>{label}</Text>
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-border'}
          size={16}
          color="#FFD700"
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  </View>
);

const CircularProgress = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
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
      <Text style={[styles.statValue, { position: 'absolute' }]}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 30,
    backgroundColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  compareContainer: {
    flexDirection: 'row',
  },
  columnContainer: {
    flex: 1,
    padding: 8,
  },
  centeredSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  separator: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  price: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'purple',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    margin: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  starRatingContainer: {
    marginBottom: 8,
  },
  ratingLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  allSlidersContainer: {
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  slider: {
    height: 4,
    backgroundColor: '#444',
    marginBottom: 4,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#7048e8',
  },
  sliderValue: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'right',
  },
  detailsContainer: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  verdictContainer: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  verdictText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  productColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionTitleContainer: {
    backgroundColor: '#7048e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'rgba(112, 72, 232, 0.5)',
    borderColor: 'rgba(112, 72, 232, 0.3)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default CompareViewScreen;