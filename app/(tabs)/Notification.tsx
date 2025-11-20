import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  Thermometer,
  Trash2,
  Droplet,
  Disc 
} from 'react-native-feather';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 1. EXPO NOTIFICATION SETUP ---

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    // FIXED: Added required properties for newer Expo SDKs
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- 2. CONFIGURATION & LIMITS ---

interface NotificationLog {
  id: string;
  type: 'connection' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface MetricConfig {
  min: number;
  max: number;
  label: string;
  unit: string;
}

const THRESHOLDS: Record<string, MetricConfig> = {
  heartRate: { min: 60, max: 100, label: 'Heart Rate', unit: 'bpm' },
  spO2: { min: 90, max: 100, label: 'SpO2', unit: '%' },
  temperature: { min: 36.0, max: 37.5, label: 'Temperature', unit: '°C' },
  pressure: { min: 30, max: 40, label: 'Pressure', unit: 'PSI' },
};

const NotificationScreen = () => {
  // --- STATE ---
  const [isConnected, setIsConnected] = useState(true);
  
  const [metrics, setMetrics] = useState({
    heartRate: 86,
    spO2: 98,
    temperature: 36.6,
    pressure: 34.2,
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // --- INITIALIZATION ---
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
    }
  }

  // --- LOGIC: TRIGGER NOTIFICATION ---
  const triggerExpoNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        data: { data: 'goes here' },
      },
      trigger: null, // null means "send immediately"
    });
  };

  const addNotification = (type: NotificationLog['type'], title: string, message: string) => {
    const newLog: NotificationLog = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newLog, ...prev]);

    // FIRE EXPO NOTIFICATION FOR WARNINGS/ERRORS
    if (type === 'warning' || type === 'error') {
        triggerExpoNotification(title, message);
    }
  };

  // --- LOGIC: TOGGLE CONNECTION ---
  const toggleConnection = () => {
    const newStatus = !isConnected;
    setIsConnected(newStatus);
    
    if (newStatus) {
      addNotification('success', 'Device Connected', 'Connection to Vervoer module established.');
    } else {
      addNotification('error', 'Device Disconnected', 'Lost connection to Vervoer module.');
    }
  };

  // --- LOGIC: SIMULATE & CHECK ---
  const simulateMetricChange = (key: keyof typeof metrics, change: number) => {
    if (!isConnected) {
        Alert.alert("Device Offline", "Connect to device to receive updates.");
        return;
    }

    setMetrics(prev => {
        const config = THRESHOLDS[key];
        let newValue = Number((prev[key] + change).toFixed(1));
        
        // Clamp values
        if (key === 'spO2' && newValue > 100) newValue = 100;
        if (newValue < 0) newValue = 0;

        // Check Thresholds
        if (newValue > config.max) {
            addNotification(
                'warning', 
                `⚠️ High ${config.label}`, 
                `Critical: ${newValue}${config.unit} exceeds limit of ${config.max}${config.unit}.`
            );
        } else if (newValue < config.min) {
            addNotification(
                'warning', 
                `⚠️ Low ${config.label}`, 
                `Critical: ${newValue}${config.unit} is below limit of ${config.min}${config.unit}.`
            );
        }

        return { ...prev, [key]: newValue };
    });

    // Animation
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.6, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const clearHistory = () => {
    setNotifications([]);
  };

  // --- UI RENDERING ---

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>System Monitor</Text>
        <Text style={styles.headerSubtitle}>Expo Notification System</Text>
      </View>
      <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
        <Trash2 stroke="white" width={20} height={20} />
      </TouchableOpacity>
    </View>
  );

  const getStatusColor = (key: keyof typeof metrics, value: number) => {
    const { min, max } = THRESHOLDS[key];
    if (value > max) return '#EF4444'; 
    if (value < min) return '#F59E0B'; 
    return '#10B981'; 
  };

  const renderMetricItem = (key: keyof typeof metrics, icon: any) => {
    const value = metrics[key];
    const config = THRESHOLDS[key];
    const color = getStatusColor(key, value);
    const Icon = icon;

    return (
      <View style={styles.metricRow}>
        <View style={styles.metricInfo}>
            <View style={[styles.metricIconBox, { backgroundColor: `${color}15` }]}>
                <Icon stroke={color} width={18} height={18} />
            </View>
            <View>
                <Text style={styles.metricLabel}>{config.label}</Text>
                <Text style={styles.metricLimit}>Safe: {config.min} - {config.max} {config.unit}</Text>
            </View>
        </View>
        <View style={styles.metricValueContainer}>
            <Text style={[styles.metricValue, { color }]}>
                {value} <Text style={styles.metricUnit}>{config.unit}</Text>
            </Text>
        </View>
      </View>
    );
  };

  const renderStatusCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Live Telemetry</Text>
        <View style={[styles.badge, isConnected ? styles.badgeSuccess : styles.badgeError]}>
          {isConnected ? <Wifi stroke="white" width={12} /> : <WifiOff stroke="white" width={12} />}
          <Text style={styles.badgeText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {renderMetricItem('heartRate', Activity)}
        {renderMetricItem('spO2', Droplet)}
        {renderMetricItem('temperature', Thermometer)}
        {renderMetricItem('pressure', Disc)}
      </Animated.View>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: NotificationLog }) => {
    let Icon = Bell;
    let color = '#6B7280';
    let bgColor = '#F3F4F6';

    switch (item.type) {
      case 'success': Icon = CheckCircle; color = '#10B981'; bgColor = '#D1FAE5'; break;
      case 'error': Icon = WifiOff; color = '#EF4444'; bgColor = '#FEE2E2'; break;
      case 'warning': Icon = AlertTriangle; color = '#EF4444'; bgColor = '#FEE2E2'; break;
    }

    return (
      <View style={styles.logItem}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <Icon stroke={color} width={20} height={20} />
        </View>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>{item.title}</Text>
            <Text style={styles.logTime}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.logMessage}>{item.message}</Text>
        </View>
      </View>
    );
  };

  // Demo Controls
  const renderControls = () => (
    <View style={styles.controls}>
      <Text style={styles.sectionTitle}>Simulate Triggers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
        
        <TouchableOpacity 
          style={[styles.chipBtn, isConnected ? styles.chipDestructive : styles.chipPrimary]} 
          onPress={toggleConnection}
        >
          <Text style={styles.chipText}>{isConnected ? 'Disconnect' : 'Connect'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chipOutline} onPress={() => simulateMetricChange('heartRate', 20)}>
          <Text style={styles.chipTextOutline}>↑ HR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chipOutline} onPress={() => simulateMetricChange('spO2', -10)}>
          <Text style={styles.chipTextOutline}>↓ SpO2</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chipOutline} onPress={() => simulateMetricChange('temperature', 2.5)}>
          <Text style={styles.chipTextOutline}>↑ Temp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chipOutline} onPress={() => simulateMetricChange('pressure', 15)}>
          <Text style={styles.chipTextOutline}>↑ PSI</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {renderStatusCard()}
        {renderControls()}

        <Text style={styles.sectionTitle}>Alert Log</Text>
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bell stroke="#D1D5DB" width={40} height={40} />
              <Text style={styles.emptyText}>No alerts recorded.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#1F2937',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  clearButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeSuccess: { backgroundColor: '#10B981' },
  badgeError: { backgroundColor: '#EF4444' },
  badgeText: { color: 'white', fontWeight: '800', marginLeft: 4, fontSize: 10 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  metricInfo: { flexDirection: 'row', alignItems: 'center' },
  metricIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  metricLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  metricLimit: { fontSize: 11, color: '#9CA3AF' },
  metricValueContainer: { alignItems: 'flex-end' },
  metricValue: { fontSize: 18, fontWeight: '700' },
  metricUnit: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  controls: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chipPrimary: { backgroundColor: '#2563EB' },
  chipDestructive: { backgroundColor: '#EF4444' },
  chipOutline: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  chipText: { color: 'white', fontWeight: '600', fontSize: 12 },
  chipTextOutline: { color: '#475569', fontWeight: '600', fontSize: 12 },
  logItem: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logContent: { flex: 1, justifyContent: 'center' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  logTitle: { fontWeight: '600', color: '#1F2937', fontSize: 14 },
  logTime: { fontSize: 10, color: '#9CA3AF' },
  logMessage: { color: '#64748B', fontSize: 12, lineHeight: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#9CA3AF', marginTop: 8, fontSize: 13 },
});

export default NotificationScreen;