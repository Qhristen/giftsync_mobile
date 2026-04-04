import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { toast } from "sonner-native";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  screen?: string;
  params?: string;
  action?: string;
  url?: string;
  transactionId?: string;
  [key: string]: any;
}

interface NotificationStatus {
  permissions: any; // Consider using proper type from expo-notifications
  devicePushToken: string | null;
  expoPushToken: string | null;
  isDevice: boolean;
  platform: string;
  projectId: string | undefined;
  serverReachable: boolean;
  constants: {
    expoConfig?: any;
    easConfig?: any;
  };
  issues: string[];
}

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: NotificationData;
  sound?: "default" | null;
  badge?: number;
  priority?: "default" | "normal" | "high";
  ttl?: number;
  channelId?: string;
}

// Server API interfaces
export interface RegisterTokenRequest {
  expoPushToken: string;
  deviceId?: string;
  platform: "ios" | "android";
  appVersion?: string;
}

export interface ServerResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

class NotificationService {
  private expoPushToken: string | null = null;
  private devicePushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    try {
      console.log("🔔 Initializing notification service...");

      // Set up notification listeners first
      this.setupNotificationListeners();

      // Register for push notifications
      await this.registerForPushNotifications();

      console.log("✅ Notification service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize notification service:", error);
    }
  }


  /**
   * Request notification permissions and get push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      console.log("🔔 Starting push notification registration...");

      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn("⚠️ Push notifications only work on physical devices");
        console.log("📱 Device info:", {
          isDevice: Device.isDevice,
          deviceType: Device.deviceType,
          platform: Platform.OS,
        });
        return null;
      }

      console.log("✅ Running on physical device");

      // Set up notification channel for Android with more detailed configuration
      if (Platform.OS === "android") {
        console.log("📱 Setting up Android notification channel...");
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0C101A",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: false,
        });
        console.log("✅ Android notification channel set up");
      }

      // Check existing permissions with detailed logging
      console.log("🔐 Checking existing permissions...");
      const permissionResponse = await Notifications.getPermissionsAsync();
      console.log("📋 Full permission response:", permissionResponse);

      let finalStatus = permissionResponse.status;

      // Request permissions if not granted
      if (finalStatus !== "granted") {
        console.log("🙋‍♂️ Requesting notification permissions...");
        const requestResponse = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        console.log("📋 Permission request response:", requestResponse);
        finalStatus = requestResponse.status;
      }

      if (finalStatus !== "granted") {
        console.warn("⚠️ Notification permissions not granted");
        console.log("📋 Final status:", finalStatus);

        // Show alert to user about permissions
        toast("Notifications Disabled", {
          description: "Please enable notifications in your device settings to receive push notifications.",
        });
        return null;
      }

      console.log("✅ Notification permissions granted");

      // Get the project ID with better error handling
      console.log("🆔 Getting project ID...");
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      console.log("📋 Project ID found:", projectId);

      if (!projectId) {
        console.error("❌ Project ID not found");
        console.log("🔍 Constants debug:", {
          expoConfig: Constants?.expoConfig?.extra,
          easConfig: Constants?.easConfig,
          manifest: Constants?.manifest,
          manifest2: Constants?.manifest2,
        });
        return null;
      }

      // Get the Expo push token with retry logic
      console.log("🎯 Getting Expo push token...");
      let pushTokenData;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          pushTokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          break;
        } catch (tokenError: any) {
          retryCount++;
          console.warn(
            `⚠️ Token generation attempt ${retryCount} failed:`,
            tokenError
          );
          if (retryCount >= maxRetries) {
            throw tokenError;
          }
          // Wait 1 second before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!pushTokenData?.data) {
        console.error("❌ Failed to get push token data");
        return null;
      }

      this.expoPushToken = pushTokenData.data;
      console.log("🎉 Expo Push Token generated successfully!");
      console.log("🎯 Token:", this.expoPushToken);

      // Test if we can schedule a local notification
      // await this.testLocalNotification(); // Removed automatic test notification

      return this.expoPushToken;
    } catch (error: any) {
      console.error("❌ Error registering for push notifications:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      return null;
    }
  }

  /**
   * Test local notification to verify the system is working
   */
  private async testLocalNotification(): Promise<void> {
    try {
      console.log("🧪 Testing local notification...");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notification System Ready! 🎉",
          body: "Your push notifications are working correctly.",
          data: { test: true },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
      console.log("✅ Local notification scheduled");
    } catch (error) {
      console.error("❌ Failed to schedule local notification:", error);
    }
  }

  /**
   * Set up notification listeners for handling incoming notifications
   */
  private setupNotificationListeners(): void {
    console.log("🎧 Setting up notification listeners...");

    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📱 Notification received in foreground:", notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for when user taps on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);
        this.handleNotificationResponse(response);
      });

    console.log("✅ Notification listeners set up");
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleNotificationReceived(
    notification: Notifications.Notification
  ): void {
    const { title, body, data } = notification.request.content;

    console.log("📨 Received notification:", { title, body, data });

    // Just log the notification, don't show an alert
    // The notification will be handled by the system's notification display
  }

  /**
   * Handle notification tap (CTA functionality)
   */
  private async handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): Promise<void> {
    const data = response.notification.request.content.data as NotificationData;

    if (!data) {
      console.log("No data in notification response");
      return;
    }

    console.log("🎯 Processing notification CTA:", data);

    // Handle different types of CTAs
    if (data.screen) {
      this.navigateToScreen(data.screen, data.params);
    } else if (data.url) {
      await this.openURL(data.url);
    } else if (data.action) {
      this.handleCustomAction(data.action, data);
    }
  }

  /**
   * Navigate to a screen using deep linking
   * @param screen - Screen name to navigate to
   * @param params - Optional params as JSON string or object
   */
  private navigateToScreen(screen: string, params?: string | object): void {
    try {
      let deepLinkPath: string;
      const parsedParams = typeof params === 'string' ? JSON.parse(params || '{}') : (params || {});

      // Map screen names to deep link paths
      switch (screen) {
        case 'Shop':
        case 'ShopHome':
        case 'MarketplaceHome':
        case 'ListingDetail':
        case 'ProductDetail':
          if (parsedParams.id) {
            deepLinkPath = `shop/${parsedParams.id}`;
          } else {
            deepLinkPath = 'shop';
          }
          break;
        case 'Occasions':
        case 'OccasionsHome':
          deepLinkPath = 'occasions';
          break;
        case 'OccasionDetail':
          if (parsedParams.id) {
            deepLinkPath = `occasions/${parsedParams.id}`;
          } else {
            deepLinkPath = 'occasions';
          }
          break;
        case 'Orders':
        case 'OrderHistory':
          deepLinkPath = 'orders';
          break;
        case 'Wallet':
        case 'WalletHome':
        case 'TransactionHistory':
          deepLinkPath = 'wallet';
          break;
        case 'Profile':
          deepLinkPath = 'profile';
          break;
        case 'EditProfile':
        case 'Settings':
          deepLinkPath = 'profile/edit';
          break;
        case 'Addresses':
          deepLinkPath = 'profile/addresses';
          break;
        case 'Legal':
          deepLinkPath = 'profile/legal';
          break;
        case 'Notifications':
          deepLinkPath = 'notifications';
          break;
        case 'Checkout':
          deepLinkPath = 'checkout';
          break;
        case 'CheckoutDelivery':
          deepLinkPath = 'checkout/delivery';
          break;
        case 'CheckoutPayment':
          deepLinkPath = 'checkout/payment';
          break;
        case 'CheckoutConfirmation':
          deepLinkPath = 'checkout/confirmation';
          break;
        case 'Home':
        case 'MainTabs':
        case 'Welcome':
          deepLinkPath = '/';
          break;
        default:
          console.warn(`⚠️ Unknown screen: ${screen}`);
          // Try to use the screen name as the path directly if it matches simple routes
          deepLinkPath = screen.toLowerCase();
      }

      const url = Linking.createURL(deepLinkPath);
      console.log(`🔗 Navigating to: ${url}`);
      Linking.openURL(url);
    } catch (error) {
      console.error("❌ Error navigating to screen:", error);
    }
  }

  /**
   * Open external URL using expo-linking
   */
  private openURL(url: string): void {
    try {
      console.log("🔗 Opening URL:", url);
      Linking.openURL(url);
    } catch (error) {
      console.error("❌ Error opening URL:", error);
    }
  }

  /**
   * Handle custom actions with deep linking
   */
  private handleCustomAction(action: string, data: NotificationData): void {
    switch (action) {
      case "view_product":
      case "view_listing":
        if (data.productId || data.listingId) {
          this.navigateToScreen('ProductDetail', { id: data.productId || data.listingId });
        }
        break;
      case "view_occasion":
        if (data.occasionId) {
          this.navigateToScreen('OccasionDetail', { id: data.occasionId });
        }
        break;
      case "view_order":
        if (data.orderId) {
          this.navigateToScreen('Orders', { id: data.orderId });
        }
        break;
      case "open_wallet":
        this.navigateToScreen('WalletHome');
        break;
      case "view_profile":
        this.navigateToScreen('Profile');
        break;
      case "view_notifications":
        this.navigateToScreen('Notifications');
        break;
      default:
        console.log("🤷‍♂️ Unknown action:", action);
    }
  }

  /**
   * Send a test notification using Expo's push service
   */
  async sendNotification(
    title: string = "Test Notification",
    body: string = "This is a test from your GiftSync!",
    data?: NotificationData
  ): Promise<boolean> {
    if (!this.expoPushToken) {
      console.error("❌ No push token available");
      return false;
    }

    try {
      console.log("🚀 Starting push notification send process...");

      // Check if we have proper permissions first
      const permissions = await Notifications.getPermissionsAsync();
      console.log("📋 Current permissions before sending:", permissions);

      if (!permissions.granted) {
        console.warn(
          "⚠️ Notifications not granted, but attempting to send anyway"
        );
      }

      const message: PushNotificationPayload = {
        to: this.expoPushToken,
        title,
        body,
        data: data || { screen: "MainTabs" },
        sound: "default",
        priority: "high",
        channelId: Platform.OS === "android" ? "default" : undefined,
        ttl: 3600, // 1 hour
      };

      console.log(
        "📤 Sending notification with payload:",
        JSON.stringify(message, null, 2)
      );

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        console.error("❌ HTTP Error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        return false;
      }

      const result = await response.json();
      console.log("📤 Test notification sent successfully!");
      console.log("📤 Full response:", JSON.stringify(result, null, 2));

      // Check for errors in the response
      if (result.data) {
        if (Array.isArray(result.data)) {
          // Multiple notifications response
          const hasErrors = result.data.some(
            (item: any) => item.status === "error"
          );
          if (hasErrors) {
            console.error("❌ Some notifications failed:", result.data);
            return false;
          }
        } else if (result.data.status === "error") {
          console.error("❌ Notification service error:", result.data);
          console.error("❌ Error details:", result.data.details);
          return false;
        }
      }

      // Log success details
      console.log("✅ Push notification sent successfully!");
      console.log("🎯 Token used:", this.expoPushToken);
      console.log("📱 Check your device for the notification");

      // Check delivery receipt after a delay
      if (result.data?.id) {
        console.log("🔍 Will check delivery receipt in 10 seconds...");
        setTimeout(() => {
          this.checkNotificationReceipt(result.data.id);
        }, 10000);
      }

      return true;
    } catch (error: any) {
      console.error("❌ Error sending test notification:", error);
      console.error("❌ Network error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      return false;
    }
  }

  /**
   * Check notification delivery receipt
   */
  private async checkNotificationReceipt(
    notificationId: string
  ): Promise<void> {
    try {
      console.log(
        "🔍 Checking delivery receipt for notification:",
        notificationId
      );

      const response = await fetch(
        "https://exp.host/--/api/v2/push/getReceipts",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: [notificationId],
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "❌ Failed to get receipt:",
          response.status,
          response.statusText
        );
        return;
      }

      const result = await response.json();
      console.log("📋 Delivery receipt:", JSON.stringify(result, null, 2));

      const receipt = result.data?.[notificationId];
      if (receipt) {
        if (receipt.status === "ok") {
          console.log("✅ Notification delivered successfully to push service");
        } else if (receipt.status === "error") {
          console.error("❌ Notification delivery failed:", receipt.message);
          console.error("❌ Error details:", receipt.details);

          // Provide specific guidance based on error
          if (receipt.message?.includes("DeviceNotRegistered")) {
            console.error("🚨 Device not registered - token may be invalid");
          } else if (receipt.message?.includes("InvalidCredentials")) {
            console.error("🚨 Invalid credentials - check Expo configuration");
          } else if (receipt.message?.includes("MessageTooBig")) {
            console.error("🚨 Message too big - reduce payload size");
          }
        }
      } else {
        console.warn(
          "⚠️ No receipt found for notification ID:",
          notificationId
        );
      }
    } catch (error: any) {
      console.error("❌ Error checking notification receipt:", error);
    }
  }

  /**
   * Get detailed notification status including push notification readiness
   */
  async getNotificationStatus(): Promise<NotificationStatus> {
    try {
      console.log("📊 Gathering comprehensive notification status...");

      const permissions = await Notifications.getPermissionsAsync();

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      let devicePushToken = null;
      try {
        devicePushToken = await Notifications.getDevicePushTokenAsync();
        this.devicePushToken = devicePushToken.data
      } catch (error) {
        console.warn("⚠️ Could not get device push token:", error);
      }

      // Check if we can reach Expo's servers
      let serverReachable = false;
      try {
        const testResponse = await fetch(
          "https://exp.host/--/api/v2/push/getReceipts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [] }),
          }
        );
        serverReachable = testResponse.ok;
        console.log("🌐 Expo servers reachable:", serverReachable);
      } catch (error) {
        console.warn("⚠️ Cannot reach Expo servers:", error);
      }

      const status = {
        permissions,
        devicePushToken: devicePushToken ? devicePushToken.data : null,
        expoPushToken: this.expoPushToken,
        isDevice: Device.isDevice,
        platform: Platform.OS,
        projectId,
        serverReachable,
        // Additional debugging info
        constants: {
          expoConfig: Constants?.expoConfig?.extra,
          easConfig: Constants?.easConfig,
        },
        // Check for common issues
        issues: this.checkForCommonIssues(permissions, projectId),
      };

      return status;
    } catch (error: any) {
      console.error("❌ Error getting notification status:", error);
      return {
        permissions: null,
        devicePushToken: null,
        expoPushToken: null,
        isDevice: Device.isDevice,
        platform: Platform.OS,
        projectId: undefined,
        serverReachable: false,
        constants: {
          expoConfig: undefined,
          easConfig: undefined,
        },
        issues: ["Failed to get notification status"],
      };
    }
  }

  /**
   * Check for common configuration issues
   */
  private checkForCommonIssues(
    permissions: any,
    projectId: string | undefined
  ): string[] {
    const issues: string[] = [];

    if (!Device.isDevice) {
      issues.push(
        "Running on simulator/emulator - push notifications require physical device"
      );
    }

    if (!permissions.granted) {
      issues.push("Notification permissions not granted");
    }

    if (!projectId) {
      issues.push("No Expo project ID found in configuration");
    }

    if (!this.expoPushToken) {
      issues.push("No Expo push token generated");
    }

    if (Platform.OS === "ios" && permissions.ios?.status !== "authorized") {
      issues.push(`iOS notification status: ${permissions.ios?.status}`);
    }

    return issues;
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Get the current device push token
   */
  getDevicePushToken(): string | null {
    return this.devicePushToken;
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    console.log("🧹 Cleaning up notification service...");
    if (this.notificationListener) {
      this.notificationListener.remove;
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Set badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === "ios") {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Schedule a local notification for testing
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number = 5
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { local: true },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        },
      });
      console.log(`📅 Local notification scheduled for ${seconds} seconds`);
    } catch (error) {
      console.error("❌ Error scheduling local notification:", error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
