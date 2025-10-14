import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardHeader from '../components/DashboardHeader';
import ResponsiveGrid from '../components/ResponsiveGrid';
import StatisticWidget from '../components/widgets/StatisticWidget';
import BaseWidget from '../components/widgets/BaseWidget';
import { theme } from '../styles/theme';
import { isTablet } from '../utils/responsive';

const DashboardScreen = () => {
  console.log('🔁 DashboardScreen rendered'); // Log every render of the main screen

  const [orientation, setOrientation] = useState('portrait');
  const [layoutKey, setLayoutKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Sample dashboard data
  const [dashboardData, setDashboardData] = useState({
    statistics: [
      {
        id: 1,
        title: 'Total Sales',
        value: '$24.5K',
        subtitle: 'This month',
        icon: 'trending-up',
        iconColor: theme.colors.semantic.success,
        trend: 'up',
        trendValue: '+12%',
      },
      {
        id: 2,
        title: 'New Users',
        value: '1,234',
        subtitle: 'This week',
        icon: 'people',
        iconColor: theme.colors.primary.main,
        trend: 'up',
        trendValue: '+8%',
      },
      {
        id: 3,
        title: 'Orders',
        value: '456',
        subtitle: 'Today',
        icon: 'shopping-cart',
        iconColor: theme.colors.secondary.main,
        trend: 'down',
        trendValue: '-3%',
      },
      {
        id: 4,
        title: 'Revenue',
        value: '$12.3K',
        subtitle: 'This week',
        icon: 'attach-money',
        iconColor: theme.colors.accent.main,
        trend: 'up',
        trendValue: '+15%',
      },
    ],
  });

  /**
   * Handles screen rotation changes
   */
  useEffect(() => {
    const handleOrientationChange = ({ window }) => {
      const newOrientation =
        window.width > window.height ? 'landscape' : 'portrait';
      console.log('📱 Orientation changed to:', newOrientation);
      setOrientation(newOrientation);
      setLayoutKey(prev => prev + 1);
    };

    const subscription = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );

    const { width, height } = Dimensions.get('window');
    setOrientation(width > height ? 'landscape' : 'portrait');

    return () => subscription?.remove();
  }, []);

  /**
   * Handles pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refresh triggered');
    setRefreshing(true);
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        console.log('✅ Refresh complete, updating dashboard data');
        setDashboardData(prev => ({
          ...prev,
          statistics: prev.statistics.map(stat => ({
            ...stat,
            value: stat.id === 1 ? '$25.2K' : stat.value,
          })),
        }));
        setRefreshing(false);
      }, 1500);
    });
  }, []);

  /**
   * Renders individual statistic widgets
   */
  const renderStatisticWidget = useCallback(item => {
    console.log(`🎨 Rendering StatisticWidget: ${item.title}`);
    return (
      <StatisticWidget
        title={item.title}
        value={item.value}
        subtitle={item.subtitle}
        icon={item.icon}
        iconColor={item.iconColor}
        trend={item.trend}
        trendValue={item.trendValue}
        onPress={() =>
          Alert.alert(item.title, `Detailed view for ${item.title}`)
        }
      />
    );
  }, []);

  const isTab = isTablet();
  const isLandscape = orientation === 'landscape';

  console.log(
    `📐 Layout Info → isTablet: ${isTab}, isLandscape: ${isLandscape}`,
  );

  return (
    <SafeAreaView key={layoutKey} style={styles.container}>
      {/* Status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      {/* Header */}
      <View
        style={[
          styles.headerWrapper,
          Platform.OS === 'android'
            ? { paddingTop: StatusBar.currentHeight }
            : null,
        ]}
      >
        <DashboardHeader
          title="Dashboard"
          subtitle={`Welcome back, ${isTab ? 'tablet' : 'mobile'} user!`}
          onMenuPress={() => {
            console.log('📂 Menu pressed');
            Alert.alert('Menu', 'Menu opened');
          }}
          onNotificationPress={() => {
            console.log('🔔 Notification pressed');
            Alert.alert('Notifications', 'You have 3 notifications');
          }}
          onProfilePress={() => {
            console.log('👤 Profile pressed');
            Alert.alert('Profile', 'Profile opened');
          }}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
          />
        }
        onScrollBeginDrag={() => console.log('🧭 Scroll started')}
      >
        {/* Statistics grid */}
        <ResponsiveGrid
          data={dashboardData.statistics}
          renderItem={renderStatisticWidget}
          numColumns={
            isLandscape && isTab ? 4 : isLandscape ? 2 : isTab ? 2 : 1
          }
        />

        {/* Quick actions */}
        <View style={styles.widgetsContainer}>
          <BaseWidget
            title="Quick Actions"
            icon="flash-on"
            iconColor={theme.colors.semantic.warning}
          >
            <View style={styles.quickActions}>
              {[
                {
                  title: 'Add Product',
                  icon: 'add-box',
                  color: theme.colors.primary.main,
                },
                {
                  title: 'View Reports',
                  icon: 'assessment',
                  color: theme.colors.secondary.main,
                },
                {
                  title: 'Manage Users',
                  icon: 'group',
                  color: theme.colors.accent.main,
                },
                {
                  title: 'Settings',
                  icon: 'settings',
                  color: theme.colors.neutral.gray600,
                },
              ].map((action, index) => {
                console.log(`🧩 Rendering Quick Action: ${action.title}`);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickAction}
                    onPress={() => {
                      console.log(`⚡ Quick Action pressed: ${action.title}`);
                      Alert.alert(action.title, `${action.title} pressed`);
                    }}
                  >
                    <View
                      style={[
                        styles.quickActionIcon,
                        { backgroundColor: `${action.color}20` },
                      ]}
                    >
                      <Icon name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BaseWidget>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ----------------------------- STYLES ----------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerWrapper: {
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  widgetsContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
    paddingVertical: theme.spacing.md,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.small,
    textAlign: 'center',
    color: theme.colors.neutral.gray700,
  },
});

export default DashboardScreen;
