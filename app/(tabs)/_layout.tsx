import { useTheme } from '@/hooks/useTheme';
import { useGetUnreadCountQuery as useGetChatUnreadCountQuery } from '@/store/api/chatApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUnreadCount, setUnreadCount } from '@/store/slices/chatSlice';
import { moderateScale } from '@/utils/scaling';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Calendar01Icon,
  Comment01Icon,
  GiftIcon,
  Home01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function TabLayout() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { data: chatUnread } = useGetChatUnreadCountQuery();
  const reduxUnreadCount = useAppSelector(selectUnreadCount);

  // Sync query data to redux state for consistent global access
  useEffect(() => {
    if (chatUnread !== undefined) {
      dispatch(setUnreadCount(chatUnread.count));
    }
  }, [chatUnread, dispatch]);

  const hasUnreadMessages = reduxUnreadCount > 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondaryForeground,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderTopWidth: 1.5,
          borderColor: colors.border,
          // borderRadius: 24,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          height: 64 + insets.bottom,
          // position: 'absolute',
          // left: 14,
          // right: 14,
          // bottom: Math.max(insets.bottom, 10),
          // elevation: 6,
          // shadowColor: '#17151D',
          // shadowOffset: { width: 4, height: 5 },
          // shadowOpacity: 1,
          // shadowRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(12),
          fontFamily: 'DMSans_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={Home01Icon} size={23} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="shop/index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={GiftIcon} size={23} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={Calendar01Icon} size={23} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={Comment01Icon} size={23} color={focused ? colors.surface : color} />
              {hasUnreadMessages && (
                <View
                  style={[
                    styles.notificationDot,
                    { backgroundColor: colors.accent, borderColor: colors.ink }
                  ]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={UserIcon} size={23} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 48,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
