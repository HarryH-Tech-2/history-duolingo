import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import LearnScreen from './src/screens/LearnScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MusicPlayer from './src/components/MusicPlayer';
import { fonts } from './src/theme';
import { UserProvider, useUser, useThemeColors } from './src/state/UserContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function makeNavTheme(c, isDark) {
  return {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: c.bg,
      card: c.bgDeep,
      text: c.textPrimary,
      border: 'transparent',
      primary: c.gold,
    },
  };
}

function TabBarIcon({ name, focused }) {
  const c = useThemeColors();
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? c.gold : c.textMuted}
    />
  );
}

function TabLabel({ label, focused }) {
  const c = useThemeColors();
  return (
    <Text
      style={{
        fontFamily: fonts.serifBold,
        fontSize: 11,
        letterSpacing: 0.5,
        color: focused ? c.gold : c.textMuted,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  );
}

function Tabs() {
  // Lift the bar above the device's bottom safe-area (gesture pill / nav buttons).
  // Fall back to a small inset on devices that report 0 so the labels still breathe.
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const c = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.bgDeep,
          borderTopWidth: 1,
          borderTopColor: c.borderSubtle,
          height: 64 + bottomInset,
          paddingTop: 10,
          paddingBottom: bottomInset,
        },
        tabBarActiveTintColor: c.gold,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.serifBold,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="book" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Learn" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="shield" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Quests" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="person" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { hasOnboarded } = useUser();
  const c = useThemeColors();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      {!hasOnboarded && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
      )}
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function ThemedNavigation() {
  const { settings, themeColors } = useUser();
  const isLight = settings.theme === 'Parchment Light';
  return (
    <>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <NavigationContainer theme={makeNavTheme(themeColors, !isLight)}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <MusicPlayer />
          <ThemedNavigation />
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

