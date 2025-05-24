import React, { useState, useEffect, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Keyboard, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { searchProduct } from '../services/product_search';

interface SearchBarProps {
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

const SearchBar = forwardRef<TextInput, SearchBarProps>(({ onChangeText, placeholder = 'Search...' }, ref) => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (searchText.trim()) {
      try {
        navigation.navigate('LoadingScreen' as never);
        const productData = await searchProduct(searchText);
        if (productData) {
          navigation.replace('ProductView' as never, { productData } as never);
        } else {
          throw new Error('No product data returned');
        }
      } catch (error) {
        console.error('Error searching product:', error);
        Alert.alert('Search Error', 'Unable to find the product. Please try again.');
        navigation.navigate('Home' as never);
      }
      setSearchText('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[
      styles.bottomContainer, 
      isKeyboardVisible && styles.bottomContainerKeyboardVisible
    ]}>
      <View style={styles.searchBarContainer}>
        <TextInput
          ref={ref}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="gray"
          onChangeText={(text) => {
            setSearchText(text);
            if (onChangeText) onChangeText(text);
          }}
          value={searchText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Icon name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {!isKeyboardVisible && (
        <TouchableOpacity 
          style={styles.botButton}
          onPress={() => navigation.navigate('BotView' as never)}
        >
          <Image
            source={require('../assets/bot_icon_white.png')}
            style={styles.botIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 35,
    marginHorizontal: 4,
    marginBottom: 52, 
    backgroundColor: 'gray',
    borderColor:'#fff',
    borderWidth:0.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000, 
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 3.84,
    elevation: 10,
  },
  bottomContainerKeyboardVisible: {
    marginBottom: 0,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    paddingVertical: 8,
  },
  sendButton: {
    padding: 4,
    backgroundColor: 'purple',
    borderRadius: 20,
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  botButton: {
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 40,  
    shadowColor: '#fff',  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 5,  
    shadowRadius: 5,  
    borderColor:'#fff',
    borderWidth:0.5,
  },
  botIcon: {
    width: 23,
    resizeMode: 'contain',
  },
});

export default SearchBar;