import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { View } from 'react-native'
import { Text, AppState } from 'react-native'

import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LogIn  from './components/LogIn';
import UsernamePage from './components/UsernamePage'
import WelcomePage from './components/Initial';
import PasswordPage from './components/PasswordPage';
import EmailPage from './components/EmailPage';
import TopThreeArtists from './components/TopThreeArtists';
import Friends from './components/Friends';

import Account from './components/Account';
import Search from './components/Search';
import Home from './components/Home';

import Song from './components/Song';
import TinderPage from './components/TinderPage';

const Stack = createStackNavigator();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function App() {

  // const [session, setSession] = useState<Session | null>(null)

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  // }, [])

  // return (
  //   <View>
      // {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
  //   </View>
  // )
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Initial">
        <Stack.Screen name="Initial" component={WelcomePage} options={{ headerShown: false }} />
        <Stack.Screen name="LogIn" component={LogIn} options={{ headerShown: false }} />
        <Stack.Screen name="UsernamePage" component={UsernamePage} options={{ headerShown: false }} />
        <Stack.Screen name="PasswordPage" component={PasswordPage} options={{ headerShown: false }} />
        <Stack.Screen name="EmailPage" component={EmailPage} options={{ headerShown: false }} />
        <Stack.Screen name="TopThreeArtists" component={TopThreeArtists} options={{ headerShown: false }} />
        <Stack.Screen name="Friends" component={Friends} options={{ headerShown: false }} />

        <Stack.Screen name="Search" component={Search} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Song" component={Song} options={{ headerShown: false }} />
        <Stack.Screen name="TinderPage" component={TinderPage} options={{ headerShown: false }} />

        <Stack.Screen
          name="Account"
          options={{ headerShown: false }}
        >
          {props => <Account {...props} session={session} />}
        </Stack.Screen>


      </Stack.Navigator>
    </NavigationContainer>
  );
}
