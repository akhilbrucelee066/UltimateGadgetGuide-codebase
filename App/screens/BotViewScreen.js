import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Image, Animated, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAdvisorBotResponse } from '../services/advisorBotService';

const introMessages = [
  "Hey there! 😊 I'm Mr. Advisor, your personal gadget expert! I'm here to help you make the best decision on your next tech purchase! 😎",
  "What's the vibe man !!👋 any advice needed.. mr.Advisor is here..  let's Go.. ",
  "One should always aware of Product purchases 🥸. so..  here i am to make you a responsible purchaser😜.. let me know what you are curious about.. ",
  "🫡Hello Captain!! In a sea of Choices and Options..  let me, mr.Advisor , a senior sailor in gadget & tech help you find the product.. let's Dive..😜🥽"
];

const Message = ({ text, isUser, image }) => {
  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
      {!isUser && (
        <View style={styles.botIconContainer}>
          <Image source={require('../assets/bot_icon_white.png')} style={styles.botIcon} />
        </View>
      )}
      <View style={[styles.messageContent, isUser && styles.userMessageContent]}>
        {image ? (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder} />
            <Text style={styles.imageCaption}>{renderBoldText(text)}</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>click for details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {renderBoldText(text)}
          </Text>
        )}
      </View>
    </View>
  );
};

const BotThinkingAnimation = () => (  <View style={styles.botThinkingContainer}>
    <View style={styles.botIconContainer}>
      <Image source={require('../assets/bot_icon_white.png')} style={styles.botIcon} />
    </View>
    <ActivityIndicator size="small" color="purple" style={styles.thinkingIndicator} />
  </View>
);

const BotViewScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const introMessageAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomIntro = introMessages[Math.floor(Math.random() * introMessages.length)];
    setMessages([{ id: 0, text: randomIntro, isUser: false }]);

    Animated.timing(introMessageAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    if (route.params?.initialMessage) {
      setTimeout(() => {
        sendMessage(route.params.initialMessage);
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const messageToSend = text || inputText.trim();
    if (messageToSend) {
      const newUserMessage = { id: messages.length + 1, text: messageToSend, isUser: true };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputText('');
      setIsLoading(true);

      try {
        const botResponse = await getAdvisorBotResponse(messageToSend);
        const newBotMessage = { id: messages.length + 2, text: botResponse, isUser: false };
        setMessages(prevMessages => [...prevMessages, newBotMessage]);
      } catch (error) {
        console.error('Error getting bot response:', error);
        const errorMessage = { id: messages.length + 2, text: "Sorry, I'm having trouble responding right now. Please try again later.", isUser: false };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A2A2A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>mr.Adviser Bot</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <Message {...item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={() => isLoading && <BotThinkingAnimation />}
      />
      <View style={styles.bottomContainer}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton}>
            <Icon name="mic" size={24} color="white" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
            <Icon name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 80,
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 8,
    flexDirection: 'row',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'purple',
    borderRadius: 20,
    borderBottomRightRadius: 0,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#444',
    borderRadius: 20,
    borderBottomLeftRadius: 0,
  },
  botIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'white',
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  botIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  messageContent: {
    padding: 12,
    flexShrink: 1,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
  },
  userMessageText: {
    color: '#fff',
    textAlign: 'right',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: '#888',
    borderRadius: 10,
    marginBottom: 8,
  },
  imageCaption: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsButton: {
    backgroundColor: 'purple',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  bottomContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 35,
    marginHorizontal: 8,
    marginBottom: 6,
    backgroundColor: 'gray',
    borderColor: '#fff',
    borderWidth: 0.5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 3.84,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 8,
  },
  inputButton: {
    padding: 8,
  },
  sendButton: {
    padding: 4,
    backgroundColor: 'purple',
    borderRadius: 20,
    alignItems: 'center',
  },
  introMessageContainer: {
    marginBottom: 16,
  },
  botThinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thinkingIndicator: {
    marginLeft: 8,
  },
});

export default BotViewScreen;