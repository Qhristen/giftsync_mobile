import { useGetUnreadCountQuery as useGetChatUnreadCountQuery } from '@/store/api/chatApi';
import { useTheme } from '@/hooks/useTheme';
import { moderateFontScale } from '@/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUnreadCount, setUnreadCount } from '@/store/slices/chatSlice';


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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondaryForeground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
          height: 64 + insets.bottom,
          elevation: 0,
          borderTopColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: moderateFontScale(12),
          fontFamily: 'DMSans_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop/index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="occasions/index"
        options={{
          title: 'Occasions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={24} color={color} />
              {hasUnreadMessages && (
                <View
                  style={[
                    styles.notificationDot,
                    { backgroundColor: colors.primary, borderColor: colors.surface }
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
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
