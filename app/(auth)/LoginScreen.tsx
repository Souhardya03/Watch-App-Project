import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { Mail, Lock, ArrowRight } from "lucide-react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";

// --- Types ---
type FormErrors = {
    email?: string;
    password?: string;
};

// --- Helper Function ---
const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({}); // State for errors
    
    const assets = {
        undraw_auth: require("../../assets/images/undraw_authentication_1evl.png"),
        wave: require("../../assets/images/wave.png"),
        google: require("../../assets/images/google.png"),
    };
    const router = useRouter();

    // --- Validation Handler ---
    const handleLogin = () => {
        setErrors({}); // Clear previous errors
        const currentErrors: FormErrors = {};

        // Email Validation
        if (!email) {
            currentErrors.email = "Email is required.";
        } else if (!validateEmail(email)) {
            currentErrors.email = "Please enter a valid email address.";
        }

        // Password Validation
        if (!password) {
            currentErrors.password = "Password is required.";
        }
        
        // Check if there are any errors
        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        // If validation passes
        console.log("Logging in with:", email, password);
        // --- TODO: Add your login API call here ---
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                
                {/* Image Illustration */}
                <Animated.View
                    className="flex items-center w-full justify-center"
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
                    <View className="flex flex-row w-full items-center ">
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

                {/* Email Input */}
                <Animated.View
                    style={styles.inputContainer}
                    entering={FadeInUp.duration(600).delay(500)}>
                    <View style={[
                        styles.inputWrapper,
                        !!errors.email && styles.inputWrapperError // Apply error style
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
                    {/* Jitter Fix: Error message placeholder */}
                    <Text style={[
                        styles.errorText,
                        { color: errors.email ? "#dc2626" : "transparent" }
                    ]}>
                        {errors.email || " "}
                    </Text>
                </Animated.View>

                {/* Password Input */}
                <Animated.View
                    style={styles.inputContainer}
                    entering={FadeInUp.duration(600).delay(700)}>
                    <View style={[
                        styles.inputWrapper,
                        !!errors.password && styles.inputWrapperError // Apply error style
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
                    {/* Jitter Fix: Error message placeholder */}
                    <Text style={[
                        styles.errorText,
                        { color: errors.password ? "#dc2626" : "transparent" }
                    ]}>
                        {errors.password || " "}
                    </Text>
                </Animated.View>

                {/* Forgot Password */}
                <Animated.View entering={FadeInUp.duration(600).delay(900)}>
                    <TouchableOpacity
                        onPress={()=>router.push("/(auth)/ForgotPassScreen")}
                        style={styles.forgotPassword}
                        activeOpacity={0.7}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Login Button */}
                <Animated.View entering={FadeInUp.duration(600).delay(1100)}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.7}
                        onPress={handleLogin} // Add the login handler
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <ArrowRight
                            size={20}
                            color="white"
                            strokeWidth={2.5}
                        />
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <Animated.View
                    style={styles.dividerContainer}
                    entering={FadeInUp.duration(600).delay(1300)}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </Animated.View>

                {/* Google Sign In */}
                <Animated.View entering={FadeInUp.duration(600).delay(1500)}>
                    <TouchableOpacity
                        style={styles.googleButton}
                        activeOpacity={0.7}>
                        <Image
                            source={assets.google}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                        />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Sign Up Link */}
                <Animated.View
                    style={styles.signupContainer}
                    entering={FadeInUp.duration(600).delay(1700)}>
                    <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/RegisterScreen")}
                        activeOpacity={0.7}>
                        <Text style={styles.signupLink}>Sign up</Text>
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
        padding: 32,
        justifyContent: "center",
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: RFValue(40),
        color: "#111827",
        marginBottom: 8,
        letterSpacing: -0.5,
        fontFamily: "DancingScript", // Make sure this font is loaded
        marginRight: 12,
    },
    subtitle: {
        fontSize: RFValue(13),
        color: "#6b7280",
        fontFamily: "Lato-Regular", // Make sure this font is loaded
    },
    inputContainer: {
        // marginBottom: 16, // Removed for anti-jitter fix
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        gap: 12,
        borderWidth: 0.8,     // Default border
        borderColor: "#f9fafb" // Default border color (same as bg)
    },
    // Added style for validation error
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