import {
	View,
	Text,
	Image,
	Pressable,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import {
	Ionicons,
	FontAwesome5,
	MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAuth } from "@/store/AuthContext";

const Home = () => {
	const { data, isLoading } = useAuth();
	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator
					size={40}
					color="#000"
				/>
			</View>
		);
	}
	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* <ScrollView > */}

			<Header name={data?.user.name} />

			<Text
				className=" font-bold leading-tight px-5 mt-6"
				style={{ fontSize: 38, lineHeight: 40, color: "#000" }}>
				Heart Health
			</Text>

			{/* Big Card */}
			<View style={styles.bigCardContainer}>
				<View style={styles.bigCardLeft}>
					<View style={styles.leftIconWrap}>
						<Ionicons
							name="heart-outline"
							size={18}
							color="#2b2b2b"
						/>
					</View>
					<Text style={styles.cardTitle}>Health</Text>
					<Text style={styles.cardSub}>
						Last diagnosis of heart{"\n"}3 days ago
					</Text>

					<Pressable
						style={styles.diagnosticButton}
						onPress={() => {}}>
						<Text style={styles.diagnosticText}>Diagnostic</Text>
					</Pressable>
				</View>

				<View style={styles.bigCardRight}>
					<Image
						source={require("../../assets/images/wave.png")}
						style={styles.heartImage}
						resizeMode="contain"
					/>
				</View>
			</View>

			{/* Small stats row */}

			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<View style={styles.statIconWrap}>
						<MaterialCommunityIcons
							name="stethoscope"
							size={18}
						/>
					</View>
					<Text style={styles.statLabel}>Heart Beat</Text>
					<Text style={styles.statValue}>
						123 <Text style={styles.statSubValue}>/ 80</Text>
					</Text>
				</View>

				<View style={styles.statCard}>
					<View style={styles.statIconWrap}>
						<FontAwesome5
							name="wave-square"
							size={16}
						/>
					</View>
					<Text style={styles.statLabel}>SpO₂</Text>
					<Text style={styles.statValue}>
						67 <Text style={styles.statSubValue}>/ min</Text>
					</Text>
				</View>
				<View style={styles.statCard}>
					<View style={styles.statIconWrap}>
						<FontAwesome5
							name="wave-square"
							size={16}
						/>
					</View>
					<Text style={styles.statLabel}>Temperature</Text>
					<Text style={styles.statValue}>
						98 <Text style={styles.statSubValue}>○F</Text>
					</Text>
				</View>
			</View>

			{/* Doctor Row */}
			<View style={styles.doctorRow}>
				<Image
					source={require("../../assets/images/wave.png")}
					style={styles.doctorAvatar}
				/>
				<View style={styles.doctorInfo}>
					<Text style={styles.doctorName}>Robert Fox</Text>
					<Text style={styles.doctorRole}>Cardiologist</Text>
				</View>
				<View style={styles.doctorActions}>
					<Pressable
						style={styles.circleButton}
						onPress={() => {}}>
						<Ionicons
							name="chatbubble-outline"
							size={18}
							color="#111"
						/>
					</Pressable>
					<Pressable
						style={styles.circleButton}
						onPress={() => {}}>
						<Ionicons
							name="call-outline"
							size={18}
							color="#111"
						/>
					</Pressable>
				</View>
			</View>

			{/* Bottom Nav */}
			<View style={styles.bottomNavWrap}>
				<Pressable
					style={[styles.navButton, styles.activeNav]}
					onPress={() => {}}>
					<Ionicons
						name="home"
						size={20}
						color="#fff"
					/>
				</Pressable>
				<Pressable
					style={styles.navButton}
					onPress={() => {}}>
					<Ionicons
						name="medkit-outline"
						size={20}
						color="#333"
					/>
				</Pressable>
				<Pressable
					style={styles.navButton}
					onPress={() => {}}>
					<Ionicons
						name="heart-outline"
						size={20}
						color="#333"
					/>
				</Pressable>
				<Pressable
					style={styles.navButton}
					onPress={() => {}}>
					<Ionicons
						name="person-circle-outline"
						size={20}
						color="#333"
					/>
				</Pressable>
			</View>
			{/* </ScrollView> */}
		</SafeAreaView>
	);
};

export default Home;

const BIG_CARD_HEIGHT = 240;

const styles = StyleSheet.create({
	bigCardContainer: {
		flexDirection: "row",
		backgroundColor: "#e6f6e9",
		borderRadius: 18,
		height: BIG_CARD_HEIGHT,
		overflow: "hidden",
		alignItems: "center",
		padding: 14,
		marginBottom: 14,
		marginVertical: 20,
		marginHorizontal: 12,
	},
	bigCardLeft: {
		flex: 1,
		paddingRight: 8,
	},
	leftIconWrap: {
		width: 50,
		height: 50,
		borderRadius: 24,
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: 26,
		fontWeight: "700",
		color: "#0b1220",
		marginBottom: 4,
	},
	cardSub: {
		color: "#4b5563",
		marginBottom: 12,
	},
	diagnosticButton: {
		alignSelf: "flex-start",
		backgroundColor: "#fff",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		elevation: 1,
	},
	diagnosticText: {
		fontWeight: "700",
		color: "#0b1220",
	},
	bigCardRight: {
		width: BIG_CARD_HEIGHT - 60,
		height: BIG_CARD_HEIGHT - 20,
		backgroundColor: "#fff",
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	heartImage: {
		width: "85%",
		height: "85%",
	},
	statsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	statCard: {
		width: "48%",
		backgroundColor: "#daf2ff",
		borderRadius: 18,
		padding: 14,
		elevation: 2,
		height: 160,
		marginVertical: 10,
		// marginHorizontal: 10,
		// marginRight: 10,
		// marginLeft: 10,
		// marginTop: 10,
		// marginBottom: 10,
		// alignItems: "center",
	},
	statIconWrap: {
		width: 50,
		height: 50,
		borderRadius: 24,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 6,
		// borderCurve: "continuous",
	},
	statLabel: {
		color: "#000",
		fontWeight: "500",
		fontSize: 20,
	},
	statValue: {
		fontSize: 30,
		fontWeight: "700",
		color: "#000",
		marginTop: 4,
	},
	statSubValue: {
		fontSize: 14,
		fontWeight: "600",
		color: "6b7280",
	},
	doctorRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff3c9",
		padding: 12,
		borderRadius: 30,
		marginBottom: 18,
		height: 90,
	},
	doctorAvatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
	},
	doctorInfo: {
		flex: 1,
	},
	doctorName: {
		fontWeight: "800",
		color: "#000",
		fontSize: 22,
	},
	doctorRole: {
		color: "#6b7280",
		fontSize: 16,
	},
	doctorActions: {
		flexDirection: "row",
		gap: 8,
	},
	circleButton: {
		width: 50,
		height: 50,
		borderRadius: 20,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 8,
	},
	bottomNavWrap: {
		position: "absolute",
		left: 18,
		right: 18,
		bottom: 18,
		height: 64,
		backgroundColor: "#fff",
		borderRadius: 32,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		elevation: 6,
		paddingHorizontal: 12,
		marginBottom: 36,
	},
	navButton: {
		width: 52,
		height: 52,
		borderRadius: 26,
		justifyContent: "center",
		alignItems: "center",
	},
	activeNav: {
		backgroundColor: "#111827",
	},
});
