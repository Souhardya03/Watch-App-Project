import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
	Camera,
	User,
	Mail,
	Lock,
	LogOut,
	ShieldCheck,
	Save,
	Eye,
	EyeOff,
} from "lucide-react-native";

// Assuming your AuthContext path based on previous context
import { useAuth } from "@/store/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Placeholder for when no image is present
const DEFAULT_AVATAR =
	"https://ui-avatars.com/api/?background=E2E8F0&color=64748B&name=User";

export default function ProfileScreen() {
	const { data, isLoading: authLoading, refetch, refreshToken,setToken } = useAuth();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const user = data?.user || {};

	// --- STATE ---
	const [name, setName] = useState(user.name || "");
	const [password, setPassword] = useState("");
	const [image, setImage] = useState(user.profilePic || null);
	const [isSaving, setIsSaving] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	// Mock check for Google Auth provider (adjust based on your real auth object)
	const isGoogleAuth = user.googleAuth === true;

	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setImage(user.profilePic);
		}
	}, [user]);

	// --- IMAGE PICKER ---
	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	// --- ACTIONS ---
	const handleSave = async () => {
		setIsSaving(true);

		// Simulate API call
		setTimeout(() => {
			setIsSaving(false);
			// Here you would actually call your update API
			Alert.alert(
				"Profile Updated",
				"Your changes have been saved successfully."
			);
		}, 1500);
	};
	const logout = async () => {
		await AsyncStorage.removeItem("token");
		setToken(null); 
        refreshToken()
	};

	const handleLogout = () => {
		Alert.alert("Log Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Log Out", style: "destructive", onPress: logout },
		]);
	};

	if (authLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size="large"
					color="#4ADE80"
				/>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}>
					{/* --- HEADER --- */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>My Profile</Text>
						<Text style={styles.headerSubtitle}>
							Manage your account settings
						</Text>
					</View>

					{/* --- AVATAR SECTION --- */}
					<View style={styles.avatarContainer}>
						<View style={styles.avatarWrapper}>
							<Image
								source={{ uri: image || DEFAULT_AVATAR }}
								style={styles.avatar}
								contentFit="cover"
								transition={500}
							/>
							<TouchableOpacity
								style={styles.cameraButton}
								onPress={pickImage}>
								<Camera
									size={20}
									color="#FFF"
									strokeWidth={2.5}
								/>
							</TouchableOpacity>
						</View>
						<Text style={styles.userName}>{name || "User Name"}</Text>
						<Text style={styles.userEmail}>
							{user.email || "user@example.com"}
						</Text>
					</View>

					{/* --- AUTH STATUS BADGE --- */}
					<View style={styles.authStatusContainer}>
						{isGoogleAuth ? (
							<LinearGradient
								colors={["#E0F2FE", "#DBEAFE"]}
								style={styles.authBadge}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}>
								<ShieldCheck
									size={18}
									color="#0284C7"
								/>
								<Text style={[styles.authBadgeText, { color: "#0369A1" }]}>
									Linked with Google
								</Text>
							</LinearGradient>
						) : (
							<View
								style={[
									styles.authBadge,
									{
										backgroundColor: "#F3F4F6",
										borderWidth: 1,
										borderColor: "#E5E7EB",
									},
								]}>
								<User
									size={18}
									color="#6B7280"
								/>
								<Text style={[styles.authBadgeText, { color: "#374151" }]}>
									Standard Account
								</Text>
							</View>
						)}
					</View>

					{/* --- FORM FIELDS --- */}
					<View style={styles.formContainer}>
						{/* Name Input */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Full Name</Text>
							<View style={styles.inputWrapper}>
								<User
									size={20}
									color="#94A3B8"
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									value={name}
									onChangeText={setName}
									placeholder="Enter your name"
									placeholderTextColor="#CBD5E1"
								/>
							</View>
						</View>

						{/* Email Input (Read Only) */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email Address</Text>
							<View style={[styles.inputWrapper, styles.disabledInput]}>
								<Mail
									size={20}
									color="#94A3B8"
									style={styles.inputIcon}
								/>
								<TextInput
									style={[styles.input, { color: "#64748B" }]}
									value={user.email}
									editable={false}
								/>
								{isGoogleAuth && (
									<ShieldCheck
										size={16}
										color="#0EA5E9"
										style={{ marginRight: 12 }}
									/>
								)}
							</View>
						</View>

						{/* Password Input (Hidden if Google Auth) */}
						{!isGoogleAuth && (
							<View style={styles.inputGroup}>
								<Text style={styles.label}>Change Password</Text>
								<View style={styles.inputWrapper}>
									<Lock
										size={20}
										color="#94A3B8"
										style={styles.inputIcon}
									/>
									<TextInput
										style={styles.input}
										value={password}
										onChangeText={setPassword}
										placeholder="Enter new password"
										placeholderTextColor="#CBD5E1"
										secureTextEntry={!showPassword}
									/>
									<TouchableOpacity
										onPress={() => setShowPassword(!showPassword)}
										style={styles.eyeButton}>
										{showPassword ? (
											<EyeOff
												size={20}
												color="#94A3B8"
											/>
										) : (
											<Eye
												size={20}
												color="#94A3B8"
											/>
										)}
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>

					{/* --- ACTION BUTTONS --- */}
					<View style={styles.actionContainer}>
						<TouchableOpacity
							style={styles.saveButton}
							onPress={handleSave}
							disabled={isSaving}>
							{isSaving ? (
								<ActivityIndicator color="white" />
							) : (
								<>
									<Save
										size={20}
										color="white"
									/>
									<Text style={styles.saveButtonText}>Save Changes</Text>
								</>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}>
							<LogOut
								size={20}
								color="#EF4444"
							/>
							<Text style={styles.logoutButtonText}>Log Out</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		paddingBottom: 40,
	},

	/* Header */
	header: {
		paddingHorizontal: 24,
		marginTop: 24,
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "800",
		color: "#0F172A",
		letterSpacing: -0.5,
	},
	headerSubtitle: {
		fontSize: 14,
		color: "#64748B",
		marginTop: 4,
	},

	/* Avatar */
	avatarContainer: {
		alignItems: "center",
		marginBottom: 24,
	},
	avatarWrapper: {
		position: "relative",
		marginBottom: 16,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.1,
		shadowRadius: 16,
		elevation: 8,
	},
	avatar: {
		width: 110,
		height: 110,
		borderRadius: 55,
		borderWidth: 4,
		borderColor: "#FFFFFF",
		backgroundColor: "#E2E8F0",
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: "#2563EB",
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "#FFFFFF",
	},
	userName: {
		fontSize: 22,
		fontWeight: "700",
		color: "#0F172A",
	},
	userEmail: {
		fontSize: 14,
		color: "#64748B",
		marginTop: 2,
	},

	/* Auth Status */
	authStatusContainer: {
		paddingHorizontal: 24,
		marginBottom: 24,
	},
	authBadge: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		borderRadius: 12,
		gap: 8,
	},
	authBadgeText: {
		fontSize: 14,
		fontWeight: "600",
	},

	/* Form */
	formContainer: {
		paddingHorizontal: 24,
		marginBottom: 24,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 13,
		fontWeight: "600",
		color: "#475569",
		marginBottom: 8,
		marginLeft: 4,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
		borderRadius: 12,
		height: 52,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.02,
		shadowRadius: 2,
		elevation: 1,
	},
	disabledInput: {
		backgroundColor: "#F1F5F9",
		borderColor: "#E2E8F0",
	},
	inputIcon: {
		marginLeft: 16,
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: "#0F172A",
		height: "100%",
	},
	eyeButton: {
		padding: 12,
	},

	/* Actions */
	actionContainer: {
		paddingHorizontal: 24,
		gap: 12,
	},
	saveButton: {
		backgroundColor: "#10B981",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 14,
		shadowColor: "#10B981",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
		gap: 8,
	},
	saveButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "700",
	},
	logoutButton: {
		backgroundColor: "#FEF2F2",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#FEE2E2",
		gap: 8,
	},
	logoutButtonText: {
		color: "#EF4444",
		fontSize: 16,
		fontWeight: "700",
	},
});
