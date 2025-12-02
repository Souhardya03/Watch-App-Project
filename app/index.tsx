import React, { useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Dimensions,
} from "react-native";
import { Heart, Activity, Thermometer, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	FadeInUp,
	ZoomIn,
	SlideInLeft,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/store/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function GetStarted() {
	const { token } = useAuth();
	const router = useRouter();

	// useEffect(() => {
	// 	if (token!==null) {
	// 		router.replace("/(main)"); // replaces instead of pushing
	// 	}
	// }, [token, router]);

	// if (token !== null) {
	// 	return null; // optional loader
	// }
	const features = [
		{
			id: 1,
			title: "Heart Rate",
			subtitle: "Real-time BPM",
			icon: Heart,
			colors: ["#ef4444", "#ec4899"] as const,
		},
		{
			id: 2,
			title: "SpO2",
			subtitle: "Oxygen Level",
			icon: Activity,
			colors: ["#3b82f6", "#06b6d4"] as const,
		},
		{
			id: 3,
			title: "Temperature",
			subtitle: "Body Temp",
			icon: Thermometer,
			colors: ["#f97316", "#fbbf24"] as const,
		},
	];

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<LinearGradient
				colors={["#f0f9ff", "#ffffff", "#faf5ff"] as const}
				style={styles.gradient}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}>
					{/* App Icon */}
					<Animated.View
						style={styles.iconContainer}
						entering={ZoomIn.duration(800)}>
						<LinearGradient
							colors={["#06b6d4", "#22d3ee", "#06b6d4"] as const}
							style={styles.appIcon}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}>
							<Heart
								size={48}
								color="white"
								strokeWidth={2.5}
							/>
						</LinearGradient>
					</Animated.View>

					{/* Title */}
					<Animated.View
						style={styles.titleContainer}
						entering={FadeInUp.duration(600).delay(200)}>
						<Text style={styles.title}>FitTrack Pro</Text>
						<Text style={styles.subtitle}>
							Your personal health companion powered by advanced sensors
						</Text>
					</Animated.View>

					{/* Feature Cards */}
					<View style={styles.featuresContainer}>
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Animated.View
									key={feature.id}
									entering={SlideInLeft.duration(500)
										.delay(500 + index * 150)
										.springify()
										.damping(24)}>
									<View style={styles.featureCard}>
										<LinearGradient
											colors={feature.colors}
											style={styles.featureIcon}
											start={{ x: 0, y: 0 }}
											end={{ x: 1, y: 1 }}>
											<Icon
												size={24}
												color="white"
												strokeWidth={2.5}
											/>
										</LinearGradient>

										<View style={styles.featureText}>
											<Text style={styles.featureTitle}>{feature.title}</Text>
											<Text style={styles.featureSubtitle}>
												{feature.subtitle}
											</Text>
										</View>
									</View>
								</Animated.View>
							);
						})}
					</View>

					{/* CTA Button */}
					<Animated.View
						style={styles.ctaContainer}
						entering={FadeInUp.duration(600).delay(1100)}>
						<TouchableOpacity
							onPress={() => router.push("/(auth)/LoginScreen")}
							activeOpacity={0.8}
							style={styles.ctaButtonWrapper}>
							<LinearGradient
								colors={["#06b6d4", "#22d3ee", "#06b6d4"] as const}
								style={styles.ctaButton}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}>
								<Text style={styles.ctaText}>Start Tracking Now</Text>
								<ArrowRight
									size={22}
									color="white"
								/>
							</LinearGradient>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: "#f0f9ff",
	},
	gradient: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
		paddingTop: 50,
		alignItems: "center",
		width: "100%",
	},
	iconContainer: {
		marginBottom: 32,
		shadowColor: "#a855f7",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	appIcon: {
		width: 96,
		height: 96,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	titleContainer: {
		alignItems: "center",
		marginBottom: 1,
		width: "100%",
		paddingHorizontal: 10,
	},
	title: {
		fontSize: SCREEN_WIDTH < 375 ? 36 : 44,
		color: "#1f2937",
		marginBottom: 12,
		textAlign: "center",
		fontFamily: "Lato-Bold",
	},
	subtitle: {
		fontSize: SCREEN_WIDTH < 375 ? 14 : 16,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 24,
		paddingHorizontal: 10,
		fontFamily: "Lato-Regular",
	},
	featuresContainer: {
		width: "100%",
		marginTop: 40,
		marginBottom: 24,
		gap: 12,
	},
	featureCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		padding: 16,
		borderRadius: 16,
		gap: 16,
		shadowColor: "rgba(0,0,0,0.05)",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
		borderWidth: 0.8,
		borderColor: "#E9E9E9",
	},
	featureIcon: {
		width: 56,
		height: 56,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	featureText: {
		flex: 1,
	},
	featureTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#1f2937",
		marginBottom: 2,
	},
	featureSubtitle: {
		fontSize: 14,
		color: "#6b7280",
	},
	ctaContainer: {
		marginTop: 40,
		width: "100%",
	},
	ctaButtonWrapper: {
		width: "100%",
		borderRadius: 16,
		overflow: "hidden",
	},
	ctaButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		paddingHorizontal: 20,
		gap: 12,
	},
	ctaText: {
		fontSize: SCREEN_WIDTH < 375 ? 16 : 18,
		fontWeight: "700",
		color: "white",
		fontFamily: "Lato-Bold",
		flexShrink: 1,
	},
});
