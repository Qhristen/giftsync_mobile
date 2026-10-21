import { useTheme } from '@/hooks/useTheme';
import { useGetUnreadCountQuery as useGetChatUnreadCountQuery } from '@/store/api/chatApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUnreadCount, setUnreadCount } from '@/store/slices/chatSlice';
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
import { moderateScale } from '@/utils/scaling';

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
        lazy: true,
        freezeOnBlur: true,
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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={Home01Icon} size={moderateScale(23)} color={focused ? colors.surface : color} />
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
              <HugeiconsIcon icon={GiftIcon} size={moderateScale(23)} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: 'Moments',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && { backgroundColor: colors.ink }]}>
              <HugeiconsIcon icon={Calendar01Icon} size={moderateScale(23)} color={focused ? colors.surface : color} />
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
              <HugeiconsIcon icon={Comment01Icon} size={moderateScale(23)} color={focused ? colors.surface : color} />
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
              <HugeiconsIcon icon={UserIcon} size={moderateScale(23)} color={focused ? colors.surface : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: moderateScale(48),
    height: moderateScale(38),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: moderateScale(-2),
    top: moderateScale(-2),
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    borderWidth: 2,
  },
});
