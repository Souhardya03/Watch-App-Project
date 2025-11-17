import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform, // Import Platform
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
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [dob, setDob] = useState<Date>(); // State for Date of Birth
    const [showDatePicker, setShowDatePicker] = useState(false); // State to show/hide picker
    const [errors, setErrors] = useState<FormErrors>({}); // State for errors

    const assets = {
        undraw_auth: require("../../assets/images/undraw_welcoming_42an.png"),
        wave: require("../../assets/images/wave.png"),
        google: require("../../assets/images/google.png"),
    };

    const router = useRouter();

    // Handler for when the date is selected
    const onDateChange = (event: any, selectedDate?: Date) => { // Use 'any' for event, Date is optional
        // Always close the picker
        setShowDatePicker(false);
        if (event.type === "set" && selectedDate) {
            // Only set the date if the user confirmed
            setDob(selectedDate);
        }
    };

    // Set a default date for the picker (e.g., 18 years ago)
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    
    // --- Validation Handler ---
    const handleRegister = () => {
        setErrors({}); // Clear previous errors
        const currentErrors: FormErrors = {};

        // Name Validation
        if (!name) {
            currentErrors.name = "Full name is required.";
        }
        
        // Email Validation
        if (!email) {
            currentErrors.email = "Email is required.";
        } else if (!validateEmail(email)) {
            currentErrors.email = "Please enter a valid email address.";
        }

        // Password Validation
        if (!password) {
            currentErrors.password = "Password is required.";
        } else if (password.length < 8) {
            currentErrors.password = "Password must be at least 8 characters.";
        }
        
        // Date of Birth Validation
        if (!dob) {
            currentErrors.dob = "Date of birth is required.";
        }

        // Check if there are any errors
        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        // If validation passes
        console.log("Registering with:", { name, email, password, dob });
        // --- TODO: Add your register API call here ---
        // On success, maybe navigate to login
        // router.navigate("/(auth)/LoginScreen");
    };


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

                {/* Full Name Input */}
                <Animated.View
                    style={styles.inputContainer}
                    entering={FadeInUp.duration(600).delay(500)}>
                    <View style={[
                        styles.inputWrapper,
                        !!errors.name && styles.inputWrapperError // Apply error style
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
                    {/* Jitter Fix: Error message placeholder */}
                    <Text style={[
                        styles.errorText,
                        { color: errors.name ? "#dc2626" : "transparent" }
                    ]}>
                        {errors.name || " "}
                    </Text>
                </Animated.View>

                {/* Email Input */}
                <Animated.View
                    style={styles.inputContainer}
                    entering={FadeInUp.duration(600).delay(700)}>
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
                    entering={FadeInUp.duration(600).delay(900)}>
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

                {/* Date of Birth Input */}
                <Animated.View
                    style={styles.inputContainer}
                    entering={FadeInUp.duration(600).delay(1100)}>
                    <TouchableOpacity
                        style={[
                            styles.inputWrapper,
                            !!errors.dob && styles.inputWrapperError // Apply error style
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
                                { paddingVertical: 14 }, // Match text input padding
                                dob ? styles.dobText : styles.dobPlaceholder,
                            ]}>
                            {dob ? dob.toLocaleDateString() : "Date of Birth"}
                        </Text>
                    </TouchableOpacity>
                    {/* Jitter Fix: Error message placeholder */}
                    <Text style={[
                        styles.errorText,
                        { color: errors.dob ? "#dc2626" : "transparent" }
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
                        onPress={handleRegister} // Call the validation function
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

// Styles are identical to LoginScreen, with minor additions
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
        // marginBottom: 16, // Removed for anti-jitter
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
        borderWidth: 0.8,      // Default border
        borderColor: "#f9fafb" // Default border color (same as bg)
    },
    // Style for validation error
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
    // Style for error text
    errorText: {
        fontSize: 14,
        fontFamily: "Lato-Regular",
        marginTop: 0,
        marginLeft: 4,
        minHeight: 18,   // Jitter Fix: Reserves space
        marginBottom: 6, // Jitter Fix: Adds spacing
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