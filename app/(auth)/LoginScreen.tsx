/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
    ActivityIndicator, // Added for loading state
    KeyboardAvoidingView, // Added for better UX
} from "react-native";
import { Mail, Lock, ArrowRight } from "lucide-react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth } from "@/store/AuthContext";
import { useGoogleAuthMutation, useLoginMutation } from "@/store/baseApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- 1. GOOGLE AUTH IMPORTS ---
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
    GoogleSignin,
    statusCodes,
    isErrorWithCode,
} from "@react-native-google-signin/google-signin";

WebBrowser.maybeCompleteAuthSession();

type FormErrors = {
    email?: string;
    password?: string;
};

const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export default function LoginScreen() {
    // --- State & Hooks ---
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({});

    const { refreshToken } = useAuth();
    const router = useRouter();

    // --- API Mutations (Added isLoading) ---
    const [login, { error: loginError, isError: isLoginError, isLoading: isLoginLoading }] =
        useLoginMutation();

    const [
        googleAuth,
        { error: googleRegisterError, isError: isGoogleRegisterError, isLoading: isGoogleLoading },
    ] = useGoogleAuthMutation();

    // Combined loading state
    const isSubmitting = isLoginLoading || isGoogleLoading;

    const assets = {
        undraw_auth: require("../../assets/images/undraw_authentication_1evl.png"),
        wave: require("../../assets/images/wave.png"),
        google: require("../../assets/images/google.png"),
    };

    // A. WEB Configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
        responseType: "token",
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

    // Main Button Handler
    const handleGooglePress = async () => {
        setErrors({});
        if (isSubmitting) return; // Prevent double press

        if (Platform.OS === "web") {
            await promptAsync();
        } else {
            await handleAndroidGoogleLogin();
        }
    };

    const handleAndroidGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
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
            } else {
                console.log(error);
                Alert.alert("Error", "An unexpected error occurred");
            }
        }
    };

    // Handle Web Google Response
    useEffect(() => {
        if (response?.type === "success" && response.authentication?.accessToken) {
            authenticateWithBackend(response.authentication.accessToken, null);
        }
    }, [response]);

    // Core Backend Logic
    const authenticateWithBackend = async (
        accessToken: string | null,
        idToken: string | null
    ) => {
        const payload = accessToken ? { accessToken } : { idToken };

        try {
            // Attempt 1: Try to Login/Auth directly
            // Assuming your googleAuth endpoint handles "Login if exists, Register if not"
            // If it doesn't, we use the catch block logic below.
            const res = await googleAuth(payload).unwrap();

            if (res.success) {
                await handleSuccessfulAuth(res.token);
            } else {
                // Only if the API returns 200 but with success: false
                Alert.alert("Authentication Failed", res.message || "Unknown error");
            }

        } catch (err) {
            console.log("Google Auth Error:", err);
            // Note: If your backend returns 404 for "User not found", you might want to 
            // explicitly handle registration here if it's a separate endpoint. 
            // However, usually 'googleAuth' endpoint handles both.
            
            Alert.alert("Login Failed", "Unable to authenticate with Google.");
        }
    };

    // Helper to clean up auth success
    const handleSuccessfulAuth = async (token: string) => {
        await AsyncStorage.setItem("token", token);
        await refreshToken(); // Ensure global state updates
        router.replace("/(tabs)"); // Use replace to prevent going back
    };

    // Standard Email/Password Login
    const handleLogin = async () => {
        setErrors({});
        if (isSubmitting) return;

        const currentErrors: FormErrors = {};
        if (!email) currentErrors.email = "Email is required.";
        else if (!validateEmail(email)) currentErrors.email = "Invalid email address.";
        if (!password) currentErrors.password = "Password is required.";

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        try {
            const res = await login({ email, password }).unwrap();
            if (res.success) {
                await handleSuccessfulAuth(res.token);
            }
        } catch (error) {
            console.log("Login Error:", error);
            // Error message is handled by the displayError useEffect below
        }
    };

    // Error Message Display Logic
    const [displayError, setDisplayError] = useState<string | undefined>();
    useEffect(() => {
        if (isLoginError && loginError) {
            setDisplayError((loginError as any).data?.message || "Login failed");
        } else if (isGoogleRegisterError && googleRegisterError) {
            setDisplayError((googleRegisterError as any).data?.message || "Google auth failed");
        } else {
            setDisplayError(undefined);
        }
    }, [isLoginError, loginError, isGoogleRegisterError, googleRegisterError]);

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            
            {/* KeyboardAvoidingView ensures inputs don't get hidden */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Image Illustration */}
                    <Animated.View
                        className="flex items-center w-full justify-center"
                        entering={ZoomIn.duration(800).delay(100)}
                    >
                        <Image
                            source={assets.undraw_auth}
                            style={{ height: 240, width: 250 }}
                            contentFit="contain"
                        />
                    </Animated.View>

                    {/* Header */}
                    <Animated.View
                        style={styles.header}
                        entering={FadeInUp.duration(600).delay(300)}
                    >
                        <View className="flex flex-row w-full items-center">
                            <Text style={styles.title}>Welcome back</Text>
                            <View className="pl-4">
                                <Image
                                    source={assets.wave}
                                    style={{ height: 48, width: 48 }}
                                    contentFit="contain"
                                    className="ml-8"
                                />
                            </View>
                        </View>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </Animated.View>

                    {/* Backend Errors */}
                    {displayError && (
                        <View
                            className="flex items-center justify-center"
                            style={{ marginBottom: 14 }}
                        >
                            <Text style={{ color: "#dc2626", fontWeight: "bold" }}>
                                {displayError}
                            </Text>
                        </View>
                    )}

                    {/* Email Input */}
                    <Animated.View
                        style={styles.inputContainer}
                        entering={FadeInUp.duration(600).delay(500)}
                    >
                        <View
                            style={[
                                styles.inputWrapper,
                                !!errors.email && styles.inputWrapperError,
                            ]}
                        >
                            <Mail size={20} color="#6b7280" strokeWidth={2} />
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
                        <Text style={[styles.errorText, { color: errors.email ? "#dc2626" : "transparent" }]}>
                            {errors.email || " "}
                        </Text>
                    </Animated.View>

                    {/* Password Input */}
                    <Animated.View
                        style={styles.inputContainer}
                        entering={FadeInUp.duration(600).delay(700)}
                    >
                        <View
                            style={[
                                styles.inputWrapper,
                                !!errors.password && styles.inputWrapperError,
                            ]}
                        >
                            <Lock size={20} color="#6b7280" strokeWidth={2} />
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
                        <Text style={[styles.errorText, { color: errors.password ? "#dc2626" : "transparent" }]}>
                            {errors.password || " "}
                        </Text>
                    </Animated.View>

                    {/* Forgot Password */}
                    <Animated.View entering={FadeInUp.duration(600).delay(900)}>
                        <TouchableOpacity
                            onPress={() => router.push("/(auth)/ForgotPassScreen")}
                            style={styles.forgotPassword}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Login Button */}
                    <Animated.View entering={FadeInUp.duration(600).delay(1100)}>
                        <TouchableOpacity
                            style={[styles.loginButton, isSubmitting && { opacity: 0.7 }]}
                            activeOpacity={0.7}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && !isGoogleLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <ArrowRight size={20} color="white" strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Divider */}
                    <Animated.View
                        style={styles.dividerContainer}
                        entering={FadeInUp.duration(600).delay(1300)}
                    >
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </Animated.View>

                    {/* Google Sign In */}
                    <Animated.View entering={FadeInUp.duration(600).delay(1500)}>
                        <TouchableOpacity
                            onPress={handleGooglePress}
                            style={[styles.googleButton, isSubmitting && { opacity: 0.6 }]}
                            activeOpacity={0.7}
                            disabled={isSubmitting}
                        >
                            {isGoogleLoading ? (
                                <ActivityIndicator color="#1f2937" />
                            ) : (
                                <>
                                    <Image
                                        source={assets.google}
                                        style={{ width: 24, height: 24 }}
                                        contentFit="contain"
                                    />
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Sign Up Link */}
                    <Animated.View
                        style={styles.signupContainer}
                        entering={FadeInUp.duration(600).delay(1700)}
                    >
                        <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(auth)/RegisterScreen")}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.signupLink}>Sign up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    scrollContent: {
        padding: 32,
        flexGrow: 1, // Ensures scrollview fills space even if content is small
        justifyContent: "center",
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: RFValue(40),
        color: "#111827",
        marginBottom: 8,
        letterSpacing: -0.5,
        fontFamily: "DancingScript",
        marginRight: 12,
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 32,
        marginTop: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#6b7280",
        fontFamily: "Lato-Bold",
    },
    loginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#34D0DB",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    loginButtonText: {
        fontSize: 16,
        color: "white",
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
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 32,
        marginBottom: 20,
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