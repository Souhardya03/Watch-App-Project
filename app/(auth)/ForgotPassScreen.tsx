import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native";
import { Mail, Lock, ArrowRight, KeyRound } from "lucide-react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp, FadeOutUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import {
	useResetPassMutation,
	useSendOtpMutation,
	useVerifyOtpMutation,
} from "@/store/baseApi";

// Type for our error state object
type FormErrors = {
	email?: string;
	otp?: string;
	newPassword?: string;
	confirmPassword?: string;
};

// --- Helper Function ---

// A simple email validation helper
const validateEmail = (email: string): boolean => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(String(email).toLowerCase());
};

// --- Component ---

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState<string>("");
	const [otp, setOtp] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [step, setStep] = useState<number>(1);

	// Typed state for validation errors
	const [errors, setErrors] = useState<FormErrors>({});

	const router = useRouter();

	const assets = {
		undraw_auth: require("../../assets/images/undraw_forgot-password_nttj.png"),
		wave: require("../../assets/images/wave.png"),
	};

	const [
		sendOtp,
		{ isError: isOtpError, error: otpError, isLoading: isSendingOtp },
	] = useSendOtpMutation();
	const [
		verifyOtp,
		{ isError: isverifyError, error: verifyError, isLoading: isVerifyingOtp },
	] = useVerifyOtpMutation();
	const [
		resetPass,
		{ isError: isResetError, error: resetError, isLoading: isResettingPass },
	] = useResetPassMutation();
	const [forgotError, setForgotError] = useState("");

	const handleNextStep = async () => {
		// Clear previous errors
		setErrors({});
		const currentErrors: FormErrors = {};

		if (step === 1) {
			// ----- Step 1 Validation (Email) -----
			if (!email) {
				currentErrors.email = "Email is required.";
			} else if (!validateEmail(email)) {
				currentErrors.email = "Please enter a valid email address.";
			}

			if (Object.keys(currentErrors).length > 0) {
				setErrors(currentErrors);
				return;
			}

			try {
				const res = await sendOtp(email).unwrap();
				// console.log(res);

				if (res.success) {
					setForgotError("");
					setStep(2);
				}
			} catch (error) {
				console.log(error);
			}
		} else if (step === 2) {
			// ----- Step 2 Validation (OTP) -----
			if (!otp) {
				currentErrors.otp = "OTP is required.";
			} else if (!/^\d{6}$/.test(otp)) {
				// Regex for exactly 6 digits
				currentErrors.otp = "OTP must be 6 digits.";
			}

			if (Object.keys(currentErrors).length > 0) {
				setErrors(currentErrors);
				return;
			}

			console.log("Verifying OTP:", otp);
			try {
				const res = await verifyOtp({ email, otp }).unwrap();
				// console.log(res);

				if (res.success) {
					setForgotError("");
					setStep(3);
				}
			} catch (error) {
				console.log(error);
			}
		} else if (step === 3) {
			// ----- Step 3 Validation (Passwords) -----
			if (!newPassword) {
				currentErrors.newPassword = "New password is required.";
			} else if (newPassword.length < 8) {
				currentErrors.newPassword = "Password must be at least 8 characters.";
			}

			if (!confirmPassword) {
				currentErrors.confirmPassword = "Please confirm your password.";
			} else if (newPassword !== confirmPassword) {
				currentErrors.confirmPassword = "Passwords do not match.";
			}

			if (Object.keys(currentErrors).length > 0) {
				setErrors(currentErrors);
				return;
			}

			console.log("Setting new password...");
			try {
				const res = await resetPass({ email, newPassword }).unwrap();
				// console.log(res);

				if (res.success) {
					setForgotError("");
					router.replace("/(auth)/LoginScreen")
				}
			} catch (error) {
				console.log(error);
			}
		}
	};
	useEffect(() => {
		if (isOtpError) {
			setForgotError((otpError as any).data.message);
		}
		if (isverifyError) {
			setForgotError((verifyError as any).data.message);
		}
		if (isResetError) {
			setForgotError((resetError as any).data.message);
		}
	}, [
		isOtpError,
		otpError,
		isverifyError,
		verifyError,
		isResetError,
		resetError,
	]);
	const isLoading =
		(step === 1 && isSendingOtp) ||
		(step === 2 && isVerifyingOtp) ||
		(step === 3 && isResettingPass);

	// Dynamically set button text
	const getButtonText = (): string => {
		switch (step) {
			case 1:
				return "Send OTP";
			case 2:
				return "Verify OTP";
			case 3:
				return "Reset Password";
			default:
				return "Submit";
		}
	};

	// Static animation delays to prevent re-render glitches
	const inputDelay = 500;
	const buttonDelay = 700;
	const linkDelay = 900;

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
							<Text style={styles.title}>
								{step === 1
									? "Forgot Password"
									: step === 2
										? "Check your email"
										: "Set new password"}
							</Text>
						</View>
						<Text style={styles.subtitle}>
							{step === 1
								? "Enter your email to get an OTP"
								: step === 2
									? `We sent an OTP to ${email || "your email"}`
									: "Create a new secure password"}
						</Text>
					</Animated.View>

					{/* ----- STEP 1: Email Input ----- */}
					{forgotError && (
						<View
							className="flex items-center justify-center"
							style={{ marginBottom: 14 }}>
							<Text
								className="text-white text-center font-bold"
								style={{ color: "red", textAlign: "center" }}>
								{forgotError}
							</Text>
						</View>
					)}
					{step === 1 && (
						<Animated.View
							style={styles.inputContainer}
							entering={FadeInUp.duration(600).delay(inputDelay)}
							exiting={FadeOutUp.duration(300)} // Add exit animation
						>
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
							{/* Jitter Fix: Always render Text, change color */}
							<Text
								style={[
									styles.errorText,
									{ color: errors.email ? "#dc2626" : "transparent" },
								]}>
								{errors.email || " "} {/* Show error or placeholder space */}
							</Text>
						</Animated.View>
					)}

					{/* ----- STEP 2: OTP Input ----- */}
					{step === 2 && (
						<Animated.View // Wrap in Animated.View
							style={styles.inputContainer}
							entering={FadeInUp.duration(600).delay(inputDelay)}
							exiting={FadeOutUp.duration(300)}>
							<View
								style={[
									styles.inputWrapper,
									!!errors.otp && styles.inputWrapperError,
								]}>
								<KeyRound
									size={20}
									color="#6b7280"
									strokeWidth={2}
								/>
								<TextInput
									style={styles.input}
									placeholder="Enter 6-digit OTP"
									placeholderTextColor="#9ca3af"
									value={otp}
									onChangeText={setOtp}
									keyboardType="numeric"
									maxLength={6}
								/>
							</View>
							{/* Jitter Fix: Always render Text, change color */}
							<Text
								style={[
									styles.errorText,
									{ color: errors.otp ? "#dc2626" : "transparent" },
								]}>
								{errors.otp || " "}
							</Text>
						</Animated.View>
					)}

					{/* ----- STEP 3: New Password Inputs ----- */}
					{step === 3 && (
						<Animated.View // Wrap the group
							entering={FadeInUp.duration(600).delay(inputDelay)}
							exiting={FadeOutUp.duration(300)}>
							<View style={styles.inputContainer}>
								<View
									style={[
										styles.inputWrapper,
										!!errors.newPassword && styles.inputWrapperError,
									]}>
									<Lock
										size={20}
										color="#6b7280"
										strokeWidth={2}
									/>
									<TextInput
										style={styles.input}
										placeholder="New Password"
										placeholderTextColor="#9ca3af"
										value={newPassword}
										onChangeText={setNewPassword}
										secureTextEntry
									/>
								</View>
								{/* Jitter Fix: Always render Text, change color */}
								<Text
									style={[
										styles.errorText,
										{ color: errors.newPassword ? "#dc2626" : "transparent" },
									]}>
									{errors.newPassword || " "}
								</Text>
							</View>

							<View style={styles.inputContainer}>
								<View
									style={[
										styles.inputWrapper,
										!!errors.confirmPassword && styles.inputWrapperError,
									]}>
									<Lock
										size={20}
										color="#6b7280"
										strokeWidth={2}
									/>
									<TextInput
										style={styles.input}
										placeholder="Confirm New Password"
										placeholderTextColor="#9ca3af"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										secureTextEntry
									/>
								</View>
								{/* Jitter Fix: Always render Text, change color */}
								<Text
									style={[
										styles.errorText,
										{
											color: errors.confirmPassword ? "#dc2626" : "transparent",
										},
									]}>
									{errors.confirmPassword || " "}
								</Text>
							</View>
						</Animated.View>
					)}

					{/* Main Action Button */}
					<Animated.View entering={FadeInUp.duration(600).delay(buttonDelay)}>
						<TouchableOpacity
							activeOpacity={0.7}
							disabled={isLoading}
							onPress={handleNextStep}
							style={styles.loginButton}>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color="#000"
								/>
							) : (
								<>
									<Text style={styles.loginButtonText}>{getButtonText()}</Text>
									<ArrowRight
										size={20}
										color="#000"
									/>
								</>
							)}
						</TouchableOpacity>
					</Animated.View>

					{/* "Back to Sign In" Link */}
					<Animated.View
						style={styles.signupContainer}
						entering={FadeInUp.duration(600).delay(linkDelay)}>
						<Text style={styles.signupText}>Remember your password? </Text>
						<TouchableOpacity
							activeOpacity={0.7}
							onPress={() => router.navigate("/(auth)/LoginScreen")}>
							<Text style={styles.signupLink}>Sign in</Text>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

// Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	scrollContent: {
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
		fontSize: RFValue(36),
		color: "#111827",
		marginBottom: 8,
		letterSpacing: -0.5,
		fontFamily: "DancingScript", // Make sure this font is loaded
		marginRight: 14,
	},
	subtitle: {
		fontSize: RFValue(13),
		color: "#6b7280",
		fontFamily: "Lato-Regular", // Make sure this font is loaded
	},
	inputContainer: {
		// We removed marginBottom here to let the errorText handle spacing
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
		borderColor: "#919191",
	},
	inputWrapperError: {
		borderColor: "#dc2626", // Red border color
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
		marginTop: 6,
		marginLeft: 4,
		minHeight: 18, // <-- Jitter Fix: Reserves space
		marginBottom: 6, // <-- Add margin bottom to replace inputContainer's margin
	},
	loginButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fbe386",
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
		marginTop: 16,
	},
	loginButtonText: {
		fontSize: 16,
		color: "#000",
		fontFamily: "Lato-Bold", // Make sure this font is loaded
	},
	signupContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 32,
	},
	signupText: {
		fontSize: 15,
		color: "#6b7280",
		fontFamily: "Lato-Regular", // Make sure this font is loaded
	},
	signupLink: {
		fontSize: 15,
		color: "#111827",
		fontFamily: "Lato-Bold", // Make sure this font is loaded
	},
});
