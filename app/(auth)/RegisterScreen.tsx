/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	StatusBar,
	Platform, // Import Platform
	Alert,
} from "react-native";
// Import new icons
import { Mail, Lock, ArrowRight, User, Calendar } from "lucide-react-native";
import { Image } from "expo-image";
// Import Animated and animations
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
// Import the date picker
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";
import { useGoogleAuthMutation, useRegisterMutation } from "@/store/baseApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/store/AuthContext";

// --- 1. GOOGLE AUTH IMPORTS ---
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
	GoogleSignin,
	statusCodes,
	isErrorWithCode,
} from "@react-native-google-signin/google-signin";

WebBrowser.maybeCompleteAuthSession();

// --- Types ---
type FormErrors = {
	name?: string;
	email?: string;
	password?: string;
	dob?: string;
};

// --- Helper Function ---
const validateEmail = (email: string): boolean => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(String(email).toLowerCase());
};

export default function RegisterScreen() {
	// --- State ---
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [dob, setDob] = useState<Date>();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const { refreshToken } = useAuth();
	const router = useRouter();

	// --- API Mutations ---
	const [register, { isError: isRegisterError, error: registerError }] =
		useRegisterMutation();

	// Google Mutations
	const [
		googleAuth,
		{ error: googleRegisterError, isError: isGoogleRegisterError },
	] = useGoogleAuthMutation();

	const assets = {
		undraw_auth: require("../../assets/images/undraw_welcoming_42an.png"),
		wave: require("../../assets/images/wave.png"),
		google: require("../../assets/images/google.png"),
	};

	// 1. GOOGLE CONFIGURATION
	// ==========================================

	// A. WEB Configuration
	const [request, response, promptAsync] = Google.useAuthRequest({
		androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
		responseType: "token", // Web needs Access Token
	});

	// B. ANDROID Configuration
	useEffect(() => {
		if (Platform.OS !== "web") {
			GoogleSignin.configure({
				webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
				offlineAccess: true,
				scopes: ["profile", "email"],
			});
		}
	}, []);

	const handleGooglePress = async () => {
		if (Platform.OS === "web") {
			await promptAsync();
		} else {
			await handleAndroidGoogleSignUp();
		}
	};

	// Android Specific Logic
	const handleAndroidGoogleSignUp = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();

			// Native returns an ID TOKEN
			const idToken = userInfo.data?.idToken;

			if (idToken) {
				await authenticateWithBackend(null, idToken);
			} else {
				Alert.alert("Error", "Could not retrieve Google credentials");
			}
		} catch (error) {
			if (isErrorWithCode(error)) {
				switch (error.code) {
					case statusCodes.SIGN_IN_CANCELLED:
						console.log("User cancelled");
						break;
					case statusCodes.IN_PROGRESS:
						console.log("In progress");
						break;
					default:
						console.log("Google Signin Error:", error);
						Alert.alert("Google Sign In Error", error.message);
				}
			}
		}
	};

	// Web Specific Logic (Listener)
	useEffect(() => {
		if (response?.type === "success" && response.authentication?.accessToken) {
			authenticateWithBackend(response.authentication.accessToken, null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [response]);

	const authenticateWithBackend = async (
		accessToken: string | null,
		idToken: string | null
	) => {
		try {
			const payload = accessToken
				? { accessToken: accessToken }
				: { idToken: idToken };

			// Even on Register screen, we check if they already exist first (Login)
			const loginRes = await googleAuth(payload).unwrap();

			if (loginRes.success) {
				await AsyncStorage.setItem("token", loginRes.token);
				refreshToken();
				router.dismissAll();

				router.push("/(tabs)");
				return;
			}

			// If Login fails, we Register them
			if (!loginRes.success || loginRes.error) {
				const regRes = await googleAuth(payload).unwrap();

				if (regRes.success) {
					await AsyncStorage.setItem("token", regRes.token);
					refreshToken();
					router.dismissAll();

					router.push("/(tabs)");
				} else {
					Alert.alert(
						"Registration Failed",
						regRes.message || "Unable to create account"
					);
				}
			}
		} catch (err) {
			// If 404/Error on login, attempt registration
			console.log("Login failed, attempting registration...", err);
			try {
				const payload = accessToken
					? { googleAccessToken: accessToken }
					: { idToken: idToken };
				const regRes = await googleAuth(payload).unwrap();
				if (regRes.success) {
					await AsyncStorage.setItem("token", regRes.token);
					router.dismissAll();

					refreshToken();
					router.push("/(tabs)");
				}
			} catch (regErr) {
				console.log("Registration error:", regErr);
				Alert.alert("Authentication Failed", "Please try again later.");
			}
		}
	};

	// Date Picker Handler
	const onDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (event.type === "set" && selectedDate) {
			setDob(selectedDate);
		}
	};

	// Default date (18 years ago)
	const defaultDate = new Date();
	defaultDate.setFullYear(defaultDate.getFullYear() - 18);

	// Main Register Handler
	const handleRegister = async () => {
		setErrors({});
		const currentErrors: FormErrors = {};

		// Validation
		if (!name) currentErrors.name = "Full name is required.";
		if (!email) currentErrors.email = "Email is required.";
		else if (!validateEmail(email))
			currentErrors.email = "Please enter a valid email address.";
		if (!password) currentErrors.password = "Password is required.";
		else if (password.length < 8)
			currentErrors.password = "Password must be at least 8 characters.";
		if (!dob) currentErrors.dob = "Date of birth is required.";

		if (Object.keys(currentErrors).length > 0) {
			setErrors(currentErrors);
			return;
		}

		// API Call
		try {
			const res = await register({ name, email, password, dob }).unwrap();
			if (res.success) {
				await AsyncStorage.setItem("token", res.token);
				refreshToken();
				router.dismissAll();

				router.push("/(tabs)");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Error Message Logic
	const [displayError, setDisplayError] = useState<string | undefined>();
	useEffect(() => {
		if (isRegisterError && registerError)
			setDisplayError((registerError as any).data?.message);
		else if (isGoogleRegisterError && googleRegisterError)
			setDisplayError((googleRegisterError as any).data?.message);
		else setDisplayError(undefined);
	}, [
		isRegisterError,
		registerError,

		isGoogleRegisterError,
		googleRegisterError,
	]);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				{/* Image Illustration */}
				<Animated.View
					style={styles.imageContainer}
					entering={ZoomIn.duration(800).delay(100)}>
					<Image
						source={assets.undraw_auth}
						style={{ height: 240, width: 250 }}
						contentFit="contain"
					/>
				</Animated.View>

				{/* Header */}
				<Animated.View
					style={styles.header}
					entering={FadeInUp.duration(600).delay(300)}>
					<View style={styles.titleRow}>
						<Text style={styles.title}>Create account</Text>
						<View style={{ paddingLeft: 1 }}>
							<Image
								source={assets.wave}
								style={{ height: 48, width: 48, marginLeft: 2 }}
								contentFit="contain"
							/>
						</View>
					</View>
					<Text style={styles.subtitle}>Let&apos;s get you started</Text>
				</Animated.View>

				{/* Backend Error Display */}
				{displayError && (
					<View
						className="flex items-center justify-center"
						style={{ marginBottom: 14 }}>
						<Text
							className="text-white font-bold"
							style={{ color: "red" }}>
							{displayError}
						</Text>
					</View>
				)}

				{/* Full Name Input */}
				<Animated.View
					style={styles.inputContainer}
					entering={FadeInUp.duration(600).delay(500)}>
					<View
						style={[
							styles.inputWrapper,
							!!errors.name && styles.inputWrapperError,
						]}>
						<User
							size={20}
							color="#6b7280"
							strokeWidth={2}
						/>
						<TextInput
							style={styles.input}
							placeholder="Full Name"
							placeholderTextColor="#9ca3af"
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
							autoComplete="name"
						/>
					</View>
					<Text
						style={[
							styles.errorText,
							{ color: errors.name ? "#dc2626" : "transparent" },
						]}>
						{errors.name || " "}
					</Text>
				</Animated.View>

				{/* Email Input */}
				<Animated.View
					style={styles.inputContainer}
					entering={FadeInUp.duration(600).delay(700)}>
					<View
						style={[
							styles.inputWrapper,
							!!errors.email && styles.inputWrapperError,
						]}>
						<Mail
							size={20}
							color="#6b7280"
							strokeWidth={2}
						/>
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor="#9ca3af"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
					</View>
					<Text
						style={[
							styles.errorText,
							{ color: errors.email ? "#dc2626" : "transparent" },
						]}>
						{errors.email || " "}
					</Text>
				</Animated.View>

				{/* Password Input */}
				<Animated.View
					style={styles.inputContainer}
					entering={FadeInUp.duration(600).delay(900)}>
					<View
						style={[
							styles.inputWrapper,
							!!errors.password && styles.inputWrapperError,
						]}>
						<Lock
							size={20}
							color="#6b7280"
							strokeWidth={2}
						/>
						<TextInput
							style={styles.input}
							placeholder="Password"
							placeholderTextColor="#9ca3af"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoCapitalize="none"
							autoComplete="password"
						/>
					</View>
					<Text
						style={[
							styles.errorText,
							{ color: errors.password ? "#dc2626" : "transparent" },
						]}>
						{errors.password || " "}
					</Text>
				</Animated.View>

				{/* Date of Birth Input */}
				<Animated.View
					style={styles.inputContainer}
					entering={FadeInUp.duration(600).delay(1100)}>
					<TouchableOpacity
						style={[
							styles.inputWrapper,
							!!errors.dob && styles.inputWrapperError,
						]}
						activeOpacity={0.7}
						onPress={() => setShowDatePicker(true)}>
						<Calendar
							size={20}
							color="#6b7280"
							strokeWidth={2}
						/>
						<Text
							style={[
								styles.input,
								{ paddingVertical: 14 },
								dob ? styles.dobText : styles.dobPlaceholder,
							]}>
							{dob ? dob.toLocaleDateString() : "Date of Birth"}
						</Text>
					</TouchableOpacity>
					<Text
						style={[
							styles.errorText,
							{ color: errors.dob ? "#dc2626" : "transparent" },
						]}>
						{errors.dob || " "}
					</Text>
				</Animated.View>

				{/* DatePicker Modal */}
				{showDatePicker && (
					<DateTimePicker
						testID="dateTimePicker"
						value={dob || defaultDate}
						mode="date"
						display={Platform.OS === "ios" ? "spinner" : "default"}
						onChange={onDateChange}
						maximumDate={new Date()}
					/>
				)}

				{/* Register Button */}
				<Animated.View entering={FadeInUp.duration(600).delay(1300)}>
					<TouchableOpacity
						onPress={handleRegister}
						style={styles.loginButton}
						activeOpacity={0.7}>
						<Text style={styles.loginButtonText}>Sign Up</Text>
						<ArrowRight
							size={20}
							color="#000"
							strokeWidth={2.5}
						/>
					</TouchableOpacity>
				</Animated.View>

				{/* Divider */}
				<Animated.View
					style={styles.dividerContainer}
					entering={FadeInUp.duration(600).delay(1500)}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>or</Text>
					<View style={styles.divider} />
				</Animated.View>

				{/* Google Sign Up */}
				<Animated.View entering={FadeInUp.duration(600).delay(1700)}>
					<TouchableOpacity
						onPress={handleGooglePress}
						style={styles.googleButton}
						activeOpacity={0.7}>
						<Image
							source={assets.google}
							style={{ width: 24, height: 24 }}
							contentFit="contain"
						/>
						<Text style={styles.googleButtonText}>Sign up with Google</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Sign In Link */}
				<Animated.View
					style={styles.signupContainer}
					entering={FadeInUp.duration(600).delay(1900)}>
					<Text style={styles.signupText}>Already have an account? </Text>
					<TouchableOpacity
						activeOpacity={0.7}
						onPress={() => router.back()}>
						<Text style={styles.signupLink}>Sign in</Text>
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	scrollContent: {
		paddingTop: 0,
		padding: 32,
		justifyContent: "center",
	},
	imageContainer: {
		alignItems: "center",
		width: "100%",
		justifyContent: "center",
	},
	header: {
		marginBottom: 28,
		marginTop: 16,
	},
	titleRow: {
		flexDirection: "row",
		width: "100%",
		alignItems: "center",
	},
	title: {
		fontSize: RFValue(40),
		color: "#111827",
		marginBottom: 8,
		letterSpacing: -0.5,
		fontFamily: "DancingScript",
		marginRight: 14,
	},
	subtitle: {
		fontSize: RFValue(13),
		color: "#6b7280",
		fontFamily: "Lato-Regular",
	},
	inputContainer: {
		// marginBottom: 16,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f9fafb",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 4,
		gap: 12,
		minHeight: 58,
		borderWidth: 0.8,
		borderColor: "#f9fafb",
	},
	inputWrapperError: {
		borderColor: "#dc2626",
		borderWidth: 1,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#111827",
		paddingVertical: 14,
		fontFamily: "Lato-Regular",
	},
	errorText: {
		fontSize: 14,
		fontFamily: "Lato-Regular",
		marginTop: 0,
		marginLeft: 4,
		minHeight: 18,
		marginBottom: 6,
	},
	dobPlaceholder: {
		color: "#9ca3af",
	},
	dobText: {
		color: "#111827",
	},
	loginButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#cee8bc",
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
		marginTop: 16,
	},
	loginButtonText: {
		fontSize: 16,
		color: "#000",
		fontFamily: "Lato-Bold",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 32,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#e5e7eb",
	},
	dividerText: {
		fontSize: 14,
		color: "#9ca3af",
		marginHorizontal: 16,
	},
	googleButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f9fafb",
		paddingVertical: 16,
		borderRadius: 12,
		gap: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	googleIcon: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#4285f4",
		alignItems: "center",
		justifyContent: "center",
	},
	googleIconText: {
		color: "white",
		fontSize: 12,
		fontFamily: "Lato-Bold",
	},
	googleButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
	},
	signupContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 32,
	},
	signupText: {
		fontSize: 15,
		color: "#6b7280",
		fontFamily: "Lato-Regular",
	},
	signupLink: {
		fontSize: 15,
		color: "#111827",
		fontFamily: "Lato-Bold",
	},
});
