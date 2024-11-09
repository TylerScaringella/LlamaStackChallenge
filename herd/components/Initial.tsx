import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { Dimensions } from 'react-native'
import { useFonts } from 'expo-font'
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather'
import styled from 'styled-components/native'
import colors from './colors'

// Get screen height
const screenHeight = Dimensions.get('window').height;

export default function WelcomePage({ navigation }) {
  
  const [fontsLoaded] = useFonts({
    Merriweather_400Regular,
  });

  return (
    <Container>
      <CreateAccountContainer>
        <CreateAccountText 
          onPress={() => navigation.navigate('UsernamePage')}
        >
          Create account
        </CreateAccountText>
      </CreateAccountContainer>
      <LoginContainer>
        <LoginText>
          Already have an account? 
          <LoginLink 
            onPress={() => navigation.navigate('LogIn')}
          >
            Log-in
          </LoginLink>
        </LoginText>
      </LoginContainer>
    </Container>
  )
}

// Styled Components with screen height calculations
const Container = styled.View`
  padding: 0 20px;
`

const CreateAccountContainer = styled.View`
  padding-top: ${screenHeight * 0.2}px;
`

const LoginContainer = styled.View`
  padding-top: ${screenHeight * 0.1}px;
`

const CreateAccountText = styled.Text`
  font-size: 35px;
  font-family: 'Merriweather_400Regular';
  color: ${colors.brown};
`

const LoginText = styled.Text`
  font-size: 35px;
  font-family: 'Merriweather_400Regular';
`

const LoginLink = styled.Text`
  color: ${colors.brown};
`
