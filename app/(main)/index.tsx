import Header from "@/components/Header";
import { useAuth } from "@/store/AuthContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Lucide Icons
import { useRouter } from "expo-router";
import {
	Activity,
	Bluetooth,
	ChevronRight,
	Clock,
	Droplets,
	Gauge,
	Thermometer,
	TrendingUp,
	Wifi,
	X,
	Zap,
} from "lucide-react-native";

// Assets
const esp32Image = require("@/assets/images/esp32s2.png");

export default function HomeScreen() {
	// --- STATE ---
	const [isConnected, setIsConnected] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [location, setLocation] = useState<Location.LocationObject | null>(
		null
	);

	// --- ANIMATIONS ---
	const slideAnim = useRef(new Animated.Value(100)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.spring(slideAnim, {
				toValue: 0,
				tension: 20,
				friction: 7,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	useEffect(() => {
		if (!isConnected) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.08,
						duration: 1200,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 1200,
						useNativeDriver: true,
					}),
				])
			).start();
		} else {
			pulseAnim.setValue(1);
		}
	}, [isConnected]);
	const router = useRouter();
	const { data, isLoading, token } = useAuth();
	// useEffect(() => {
	// 	if (token === null) {
	// 		router.dismissAll();
	// 		router.replace("/"); // replaces instead of pushing
	// 	}
	// }, [router, token]);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;
			let loc = await Location.getCurrentPositionAsync({});
			setLocation(loc);
		})();
	}, []);

	const handleConnectionToggle = () => {
		if (isConnected) {
			setIsConnected(false);
		} else {
			setIsConnecting(true);
			setTimeout(() => {
				setIsConnecting(false);
				setIsConnected(true);
			}, 2000);
		}
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size={50}
					color="#4ADE80"
				/>
			</View>
		);
	}

	const lat = location?.coords.latitude || 37.7749;
	const long = location?.coords.longitude || -122.4194;

	const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      #map { height: 100vh; width: 100vw; background: #f0f0f0; }
      .leaflet-control-attribution, .leaflet-control-zoom { display: none; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var lat = ${lat};
      var long = ${long};
      var map = L.map('map', { zoomControl: false }).setView([lat, long], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.marker([lat, long], {icon: redIcon}).addTo(map);
    </script>
  </body>
  </html>
`;

	return (
		<SafeAreaView style={styles.container}>
			<Header
				name={data?.user.name || "User"}
				profilePic={data?.user.profilePhoto}
			/>

			<View style={{ flex: 1 }}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 160 }}>
					<Animated.View
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim }],
							paddingHorizontal: 24,
						}}>
						<View style={styles.titleContainer}>
							<Text style={styles.mainTitle}>Tracking</Text>
							<Text style={styles.mainTitleAccent}>your health</Text>
						</View>

						{/* --- ROW 1: HEART RATE + MAP --- */}
						<View style={styles.rowContainer}>
							{/* LEFT: Heart Rate (ALWAYS GREEN) */}
							<LinearGradient
								colors={["#F0FDF4", "#DCFCE7"]}
								style={styles.heartCard}>
								{/* Header */}
								<View style={styles.cardHeader}>
									<View
										style={[styles.iconBox, { backgroundColor: "#BBF7D0" }]}>
										<Activity
											size={20}
											color="#15803D"
											strokeWidth={2.5}
										/>
									</View>
									<View
										style={[
											styles.statusBadge,
											{
												backgroundColor: isConnected
													? "#BBF7D0"
													: "rgba(0,0,0,0.05)",
											},
										]}>
										<Text
											style={[
												styles.statusText,
												{ color: isConnected ? "#15803D" : "#6B7280" },
											]}>
											{isConnected ? "Normal" : "Offline"}
										</Text>
									</View>
								</View>

								{/* Main Value */}
								<View style={{ marginTop: 10 }}>
									<Text
										style={[
											styles.heartRateValue,
											!isConnected && { color: "rgba(21, 128, 61, 0.5)" },
										]}>
										{isConnected ? "86" : "--"}
										<Text style={styles.heartRateUnit}>
											{isConnected ? " bpm" : ""}
										</Text>
									</Text>

									{/* Trend */}
									{isConnected ? (
										<View style={styles.trendRow}>
											<TrendingUp
												size={14}
												color="#15803D"
											/>
											<Text style={styles.trendText}>+2% vs yest.</Text>
										</View>
									) : (
										<View style={{ height: 17 }} />
									)}
								</View>

								{/* Graph Bars */}
								<View style={styles.graphContainer}>
									{[40, 60, 30, 80, 50, 90, 40, 70, 40].map((h, i) => (
										<View
											key={i}
											style={[
												styles.graphBar,
												{
													height: `${h}%`,
													backgroundColor: "#15803D",
													opacity: isConnected ? (i === 5 ? 1 : 0.4) : 0.1,
												},
											]}
										/>
									))}
								</View>
							</LinearGradient>

							{/* RIGHT: MAP CARD */}
							<View style={styles.mapCard}>
								<WebView
									key={location ? "loaded" : "loading"}
									originWhitelist={["*"]}
									source={{ html: mapHtml }}
									style={{ flex: 1 }}
									scrollEnabled={false}
									pointerEvents="none"
								/>
								<LinearGradient
									colors={["rgba(0,0,0,0.6)", "transparent"]}
									style={styles.mapOverlay}>
									<View style={styles.mapBadge}>
										<View
											style={[
												styles.liveDot,
												!location && { backgroundColor: "#FBBF24" },
											]}
										/>
										<Text style={styles.mapBadgeText}>
											{location ? "LIVE" : "SEARCHING"}
										</Text>
									</View>
								</LinearGradient>
							</View>
						</View>

						{/* --- ROW 2: VITALS (SpO2 + Temp) --- */}
						<View style={styles.vitalsRow}>
							{/* SpO2 Card (ALWAYS BLUE) */}
							<LinearGradient
								colors={["#EFF6FF", "#DBEAFE"]}
								style={styles.vitalCard}>
								<View style={styles.vitalHeader}>
									<View
										style={[styles.iconBox, { backgroundColor: "#BFDBFE" }]}>
										<Droplets
											size={18}
											color="#1D4ED8"
											strokeWidth={2.5}
										/>
									</View>
									<Text style={[styles.vitalTitle, { color: "#1E40AF" }]}>
										SpO2
									</Text>
								</View>

								<View style={styles.vitalContent}>
									<Text
										style={[
											styles.vitalValue,
											!isConnected && { color: "rgba(30, 64, 175, 0.5)" },
										]}>
										{isConnected ? "98" : "--"}
										<Text style={styles.vitalUnit}>
											{isConnected ? "%" : ""}
										</Text>
									</Text>

									{isConnected ? (
										<View style={styles.miniTag}>
											<Text style={styles.miniTagText}>Excellent</Text>
										</View>
									) : (
										<View
											style={[
												styles.miniTag,
												{ backgroundColor: "rgba(0,0,0,0.05)" },
											]}>
											<Text style={[styles.miniTagText, { color: "#94A3B8" }]}>
												--
											</Text>
										</View>
									)}
								</View>

								{/* Progress Ring */}
								<View
									style={[
										styles.progressRingContainer,
										!isConnected && { opacity: 0.3 },
									]}>
									<View style={styles.progressRingBase} />
									{isConnected && <View style={styles.progressRingFill} />}
								</View>
							</LinearGradient>

							{/* Temperature Card (ALWAYS ORANGE) */}
							<LinearGradient
								colors={["#FFF7ED", "#FFEDD5"]}
								style={styles.vitalCard}>
								<View style={styles.vitalHeader}>
									<View
										style={[styles.iconBox, { backgroundColor: "#FED7AA" }]}>
										<Thermometer
											size={18}
											color="#C2410C"
											strokeWidth={2.5}
										/>
									</View>
									<Text style={[styles.vitalTitle, { color: "#9A3412" }]}>
										Temp
									</Text>
								</View>

								<View style={styles.vitalContent}>
									<Text
										style={[
											styles.vitalValue,
											!isConnected && { color: "rgba(154, 52, 18, 0.5)" },
										]}>
										{isConnected ? "36.6" : "--"}
										<Text style={styles.vitalUnit}>
											{isConnected ? "°C" : ""}
										</Text>
									</Text>

									{isConnected ? (
										<View
											style={[styles.miniTag, { backgroundColor: "#FFEDD5" }]}>
											<Clock
												size={10}
												color="#9A3412"
											/>
											<Text
												style={[
													styles.miniTagText,
													{ color: "#9A3412", marginLeft: 4 },
												]}>
												10m ago
											</Text>
										</View>
									) : (
										<View
											style={[
												styles.miniTag,
												{ backgroundColor: "rgba(0,0,0,0.05)" },
											]}>
											<Text style={[styles.miniTagText, { color: "#94A3B8" }]}>
												--
											</Text>
										</View>
									)}
								</View>

								{/* Temp Bar Scale */}
								<View style={styles.tempScaleContainer}>
									<View style={styles.tempBarBg}>
										{isConnected ? (
											<LinearGradient
												colors={["#38BDF8", "#FBBF24", "#EF4444"]}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 0 }}
												style={styles.tempGradient}
											/>
										) : (
											<View
												style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
											/>
										)}
									</View>
									{isConnected && (
										<View style={[styles.tempDot, { left: "45%" }]} />
									)}
								</View>
							</LinearGradient>
						</View>

						{/* --- ROW 3: PRESSURE (NEW PSI SYSTEM) --- */}
						<View style={styles.vitalsRow}>
							<LinearGradient
								colors={["#F3E8FF", "#E9D5FF"]}
								style={styles.vitalCard}>
								<View style={styles.vitalHeader}>
									<View
										style={[styles.iconBox, { backgroundColor: "#D8B4FE" }]}>
										<Gauge
											size={18}
											color="#7E22CE"
											strokeWidth={2.5}
										/>
									</View>
									<Text style={[styles.vitalTitle, { color: "#6B21A8" }]}>
										Pressure
									</Text>
								</View>

								<View style={styles.vitalContent}>
									<Text
										style={[
											styles.vitalValue,
											!isConnected && { color: "rgba(107, 33, 168, 0.5)" },
										]}>
										{isConnected ? "34.2" : "--"}
										<Text style={styles.vitalUnit}>
											{isConnected ? " PSI" : ""}
										</Text>
									</Text>

									{isConnected ? (
										<View
											style={[styles.miniTag, { backgroundColor: "#E9D5FF" }]}>
											<Text style={[styles.miniTagText, { color: "#6B21A8" }]}>
												Optimal
											</Text>
										</View>
									) : (
										<View
											style={[
												styles.miniTag,
												{ backgroundColor: "rgba(0,0,0,0.05)" },
											]}>
											<Text style={[styles.miniTagText, { color: "#94A3B8" }]}>
												--
											</Text>
										</View>
									)}
								</View>

								{/* Pressure Bar */}
								<View style={styles.tempScaleContainer}>
									<View style={styles.tempBarBg}>
										{isConnected ? (
											<View style={{ flex: 1 }}>
												<LinearGradient
													colors={["#A855F7", "#E9D5FF"]}
													start={{ x: 0, y: 0 }}
													end={{ x: 1, y: 0 }}
													style={{
														position: "absolute",
														left: 0,
														top: 0,
														bottom: 0,
														width: "75%", // Simulating 34 PSI level
														borderRadius: 3,
													}}
												/>
											</View>
										) : (
											<View
												style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
											/>
										)}
									</View>
								</View>
							</LinearGradient>
						</View>

						{/* --- SPECS CARD --- */}
						<LinearGradient
							colors={["#F8FAFC", "#F1F5F9"]}
							style={styles.specsCard}>
							<View style={styles.espImageContainer}>
								<Image
									source={esp32Image}
									style={styles.espImage}
									contentFit="contain"
								/>
							</View>

							<View style={styles.specsContent}>
								<Text style={styles.specsTitle}>System Specs</Text>
								<Text style={styles.specsSubtitle}>
									{isConnected ? "ESP32-S2 • Connected" : "ESP32-S2 • Ready"}
								</Text>
								<View style={styles.specsActions}>
									<View
										style={[styles.specTag, !isConnected && { opacity: 0.5 }]}>
										<Wifi
											size={14}
											color="#475569"
										/>
										<Text style={styles.specTagText}>Wi-Fi</Text>
									</View>
									<View
										style={[styles.specTag, !isConnected && { opacity: 0.5 }]}>
										<Zap
											size={14}
											color="#475569"
										/>
										<Text style={styles.specTagText}>BLE</Text>
									</View>
								</View>
							</View>
						</LinearGradient>
					</Animated.View>
				</ScrollView>

				{/* --- STICKY BOTTOM BAR --- */}
				<Animated.View
					style={[
						styles.stickyContainer,
						{
							transform: [
								{
									translateY: slideAnim.interpolate({
										inputRange: [0, 100],
										outputRange: [0, 120],
									}),
								},
							],
						},
					]}>
					<BlurView
						intensity={40}
						tint="light"
						style={styles.glassBar}>
						<Animated.View
							style={[
								styles.iconCircle,
								{
									transform: [{ scale: pulseAnim }],
									backgroundColor: isConnected ? "#10B981" : "#334155",
								},
							]}>
							<Bluetooth
								size={24}
								color="#FFFFFF"
								strokeWidth={2.5}
							/>
						</Animated.View>

						<View style={{ flex: 1, paddingLeft: 16 }}>
							<Text style={styles.connectLabel}>DEVICE STATUS</Text>
							<Text style={styles.connectStatus}>
								{isConnecting
									? "Pairing..."
									: isConnected
										? "Connected"
										: "Ready to pair"}
							</Text>
						</View>

						<TouchableOpacity
							style={[
								styles.connectButton,
								isConnected && { backgroundColor: "#EF4444" },
							]}
							onPress={handleConnectionToggle}
							disabled={isConnecting}>
							{isConnecting ? (
								<ActivityIndicator
									size="small"
									color="#0F172A"
								/>
							) : (
								<>
									<Text
										style={[
											styles.connectBtnText,
											isConnected && { color: "#FFF" },
										]}>
										{isConnected ? "Disconnect" : "Connect"}
									</Text>
									{isConnected ? (
										<X
											size={18}
											color="#FFF"
											strokeWidth={3}
										/>
									) : (
										<ChevronRight
											size={18}
											color="#0F172A"
											strokeWidth={3}
										/>
									)}
								</>
							)}
						</TouchableOpacity>
					</BlurView>
				</Animated.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8FAFC" },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	titleContainer: { marginTop: 24, marginBottom: 28 },
	mainTitle: {
		fontSize: RFValue(32),
		fontWeight: "800",
		color: "#0F172A",
		lineHeight: RFValue(36),
		letterSpacing: -0.5,
	},
	mainTitleAccent: {
		fontSize: RFValue(32),
		fontWeight: "800",
		color: "#334155",
		lineHeight: RFValue(36),
		letterSpacing: -0.5,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		height: 240,
		gap: 16,
	},

	/* Heart Card Styles */
	heartCard: {
		flex: 0.45,
		borderRadius: 28,
		padding: 18,
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	iconBox: {
		width: 34,
		height: 34,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
	statusText: { fontSize: 10, fontWeight: "700" },
	heartRateValue: {
		fontSize: RFValue(34),
		fontWeight: "800",
		color: "#0F172A",
		letterSpacing: -1,
	},
	heartRateUnit: { fontSize: RFValue(14), fontWeight: "600", color: "#475569" },
	trendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 2,
	},
	trendText: { fontSize: 11, fontWeight: "600", color: "#15803D" },
	graphContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		height: 40,
		marginTop: 10,
	},
	graphBar: { width: 6, borderRadius: 3 },

	/* Map Card Styles */
	mapCard: {
		flex: 0.55,
		borderRadius: 28,
		overflow: "hidden",
		backgroundColor: "#E2E8F0",
		position: "relative",
		shadowColor: "#334155",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	mapOverlay: { position: "absolute", top: 0, left: 0, right: 0, padding: 16 },
	mapBadge: {
		backgroundColor: "rgba(15, 23, 42, 0.8)",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: 6,
	},
	liveDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: "#4ADE80",
	},
	mapBadgeText: { color: "white", fontSize: 10, fontWeight: "700" },

	/* Vitals Styles */
	vitalsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16,
		gap: 16,
	},
	vitalCard: {
		flex: 1,
		borderRadius: 28,
		padding: 18,
		height: 160,
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	vitalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	vitalTitle: { fontSize: 14, fontWeight: "700" },
	vitalContent: { marginTop: 10 },
	vitalValue: { fontSize: RFValue(26), fontWeight: "800", color: "#0F172A" },
	vitalUnit: { fontSize: RFValue(16), fontWeight: "600", color: "#64748B" },
	miniTag: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#DBEAFE",
		alignSelf: "flex-start",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
		marginTop: 4,
	},
	miniTagText: { fontSize: 10, fontWeight: "600", color: "#1E40AF" },

	// SpO2 Progress Ring
	progressRingContainer: {
		height: 4,
		backgroundColor: "#BFDBFE",
		borderRadius: 2,
		marginTop: 15,
		overflow: "hidden",
	},
	progressRingBase: { flex: 1 },
	progressRingFill: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: "98%",
		backgroundColor: "#2563EB",
	},

	// Temp Scale
	tempScaleContainer: { marginTop: 15 },
	tempBarBg: {
		height: 6,
		borderRadius: 3,
		overflow: "hidden",
		backgroundColor: "#E5E7EB",
	},
	tempGradient: { flex: 1 },
	tempDot: {
		position: "absolute",
		top: -3,
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#FFFFFF",
		borderWidth: 2,
		borderColor: "#F97316",
		shadowColor: "#000",
		shadowOpacity: 0.1,
		elevation: 2,
	},

	/* Specs Styles */
	specsCard: {
		marginTop: 16,
		height: 100,
		borderRadius: 28,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	espImageContainer: {
		width: 60,
		height: 60,
		backgroundColor: "#FFFFFF",
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	espImage: { width: 80, height: 80 },
	specsContent: { flex: 1 },
	specsTitle: { fontSize: RFValue(16), fontWeight: "800", color: "#0F172A" },
	specsSubtitle: {
		fontSize: RFValue(11),
		color: "#64748B",
		marginBottom: 10,
		marginTop: 2,
		fontWeight: "500",
	},
	specsActions: { flexDirection: "row", gap: 8 },
	specTag: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	specTagText: { fontSize: 10, fontWeight: "600", color: "#475569" },

	/* Sticky Bar */
	stickyContainer: { position: "absolute", bottom: 36, left: 24, right: 24 },
	glassBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		paddingRight: 16,
		borderRadius: 44,
		overflow: "hidden",
		backgroundColor: "rgba(15, 23, 42, 0.85)",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.1)",
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.2,
		shadowRadius: 20,
		elevation: 10,
	},
	iconCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		justifyContent: "center",
		alignItems: "center",
	},
	connectLabel: {
		fontSize: 11,
		fontWeight: "800",
		color: "#94A3B8",
		letterSpacing: 1,
	},
	connectStatus: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
	connectButton: {
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 28,
		gap: 6,
		minWidth: 110,
		justifyContent: "center",
	},
	connectBtnText: { color: "#0F172A", fontWeight: "800", fontSize: 15 },
});
