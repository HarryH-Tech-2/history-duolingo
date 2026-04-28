import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import LearnScreen from './src/screens/LearnScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MusicPlayer from './src/components/MusicPlayer';
import { colors, fonts } from './src/theme';
import { UserProvider, useUser } from './src/state/UserContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgDeep,
    text: colors.textPrimary,
    border: 'transparent',
    primary: colors.gold,
  },
};

function TabBarIcon({ name, focused }) {
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? colors.gold : colors.textMuted}
    />
  );
}

function TabLabel({ label, focused }) {
  return (
    <Text
      style={{
        fontFamily: fonts.serifBold,
        fontSize: 11,
        letterSpacing: 0.5,
        color: focused ? colors.gold : colors.textMuted,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgDeep,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
          height: 80,
          paddingTop: 10,
          paddingBottom: 16,
        },
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <StatusBar style="light" />
          <MusicPlayer />
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

