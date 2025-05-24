import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  signOut,
  getCurrentUser,
  updateUserProfile,
  getUserProfile,
  updatePassword,
} from "../services/firebase";
import { LinearGradient } from "expo-linear-gradient";

const SettingItem = ({
  icon,
  title,
  value,
  onPress,
  isSwitch = false,
  isDropdown = false,
  isDropdownOption = false,
  isSelected = false,
}) => (
  <TouchableOpacity
    style={[styles.settingItem, isDropdownOption && styles.dropdownOption]}
    onPress={onPress}
  >
    {icon && (
      <Icon name={icon} size={24} color="#888" style={styles.settingIcon} />
    )}
    <View style={styles.settingTextContainer}>
      <Text
        style={[
          styles.settingTitle,
          isDropdownOption && styles.dropdownOptionText,
        ]}
      >
        {title}
      </Text>
      {isSwitch ? (
        <Switch value={value} onValueChange={onPress} />
      ) : (
        !isDropdownOption && <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
    {isDropdownOption && (
      <Icon
        name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
        size={24}
        color="purple"
        style={styles.dropdownOptionIcon}
      />
    )}
    {isDropdown && !isDropdownOption && (
      <Icon name="chevron-right" size={24} color="#888" />
    )}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [user, setUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("😊");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const buyerPersonalities = [
    { name: "Confused", emoji: "😕" },
    { name: "Analyst", emoji: "🤓" },
    { name: "Bargainer", emoji: "🤑" },
    { name: "Adventurer", emoji: "🤠" },
    { name: "Trendsetter", emoji: "😎" },
    { name: "Inspector", emoji: "🧐" },
    { name: "Indifferent", emoji: "😴" },
    { name: "Ethical", emoji: "😇" },
    { name: "Enthusiast", emoji: "😍" },
    { name: "Impatient", emoji: "😤" },
    { name: "Overwhelmed", emoji: "🤯" },
    { name: "Secretive", emoji: "🤫" },
  ];

  const fetchUserProfile = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setUsername(userProfile.displayName || "");
          setEmail(userProfile.email || "");
          setSelectedEmoji(userProfile.selectedEmoji || "😊");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const toggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("No user is currently logged in");
      }
      await updateUserProfile(currentUser.uid, {
        displayName: username,
        selectedEmoji: selectedEmoji,
      });
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleEmojiSelect = async (emoji) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        await updateUserProfile(currentUser.uid, { selectedEmoji: emoji });
      }
    } catch (error) {
      console.error("Error updating emoji:", error);
      Alert.alert("Error", "Failed to update emoji. Please try again.");
    }
  };

  const handleSendFeedback = () => {
    Linking.openURL(
      "mailto:ultimategadgetguide066@gmail.com?subject=Feedback for UGG App"
    ).catch(() => {
      Alert.alert(
        "Unable to open email client",
        "Please make sure you have an email client installed on your device."
      );
    });
  };

  const handleDeveloperContact = () => {
    Linking.openURL(
      "mailto:jpranayakhil066@gmail.com?subject=UGG App Developer Contact"
    ).catch(() => {
      Alert.alert(
        "Unable to open email client",
        "Please make sure you have an email client installed on your device."
      );
    });
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password should be at least 6 characters long");
      return;
    }
    try {
      await updatePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setPasswordError("Current password is incorrect. Please try again.");
      } else {
        setPasswordError("Failed to update password. Please try again later.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholderView} />
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["orange", "purple"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.4, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarEmoji}>{selectedEmoji}</Text>
            </LinearGradient>
            {isEditing && (
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={() => setShowEmojiPicker(true)}
              >
                <Icon name="edit" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter user name"
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.name}>{username}</Text>
          )}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={toggleEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.editProfileText}>
                {isEditing ? "Save Profile" : "Edit Profile"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="email"
            title="Email"
            value={email}
            editable={isEditing && !email}
            onChangeText={setEmail}
          />
          <SettingItem icon="lock" title="Password" value="********" />
          {isEditing && (
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setShowPasswordModal(true)}
            >
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon="notifications"
            title="Notifications"
            value={notificationsEnabled}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            isSwitch
          />
          <SettingItem
            icon="language"
            title="Language"
            value={selectedLanguage}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            isDropdown
          />
          {showLanguageDropdown && (
            <View style={styles.dropdown}>
              <SettingItem
                title="English"
                onPress={() => {
                  setSelectedLanguage("English");
                  setShowLanguageDropdown(false);
                }}
                isDropdownOption
                isSelected={selectedLanguage === "English"}
              />
              <SettingItem
                title="System Language"
                onPress={() => {
                  setSelectedLanguage("System Language");
                  setShowLanguageDropdown(false);
                }}
                isDropdownOption
                isSelected={selectedLanguage === "System Language"}
              />
            </View>
          )}
          {/* Theme SettingItem and its dropdown */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="feedback"
            title="Send Feedback"
            onPress={handleSendFeedback}
          />
          <SettingItem
            icon="contact-mail"
            title="Developer Contact"
            onPress={() => handleDeveloperContact()}
          />
        </View>

        <Modal
          visible={showEmojiPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.emojiPickerContainer}>
              <Text style={styles.emojiPickerTitle}>
                Choose Your Buyer Personality
              </Text>
              <ScrollView contentContainerStyle={styles.emojiGrid}>
                {buyerPersonalities.map((personality, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiItem}
                    onPress={() => handleEmojiSelect(personality.emoji)}
                  >
                    <Text style={styles.emojiText}>{personality.emoji}</Text>
                    <Text style={styles.emojiName}>{personality.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEmojiPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.passwordModalContent}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.changePasswordText}>Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  placeholderView: {
    width: 40,
  },
  profileInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarEmoji: {
    fontSize: 60,
    textAlign: "center",
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "orange",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1E1E1E",
  },
  name: {
    color: "orange",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  editProfileButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "purple",
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
  },
  editProfileText: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTitle: {
    color: "white",
    fontSize: 16,
  },
  settingValue: {
    color: "#888",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    marginLeft: 60,
    marginTop: 8,
    marginBottom: 16,
  },
  dropdownOption: {
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    color: "white",
    fontSize: 16,
  },
  dropdownOptionIcon: {
    marginLeft: "auto",
  },
  nameInput: {
    color: "orange",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  settingInput: {
    color: "white",
    fontSize: 16,
  },
  changePasswordButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "purple",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  changePasswordText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  emojiPickerContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  emojiPickerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  emojiItem: {
    alignItems: "center",
    margin: 10,
    width: "25%",
  },
  emojiText: {
    fontSize: 40,
    marginBottom: 4,
  },
  emojiName: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "purple",
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  passwordModalContent: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  passwordInput: {
    backgroundColor: "#1E1E1E",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
