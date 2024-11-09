import React, { useState } from 'react';
import { Alert, View, Text, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import styled from 'styled-components/native';
import { Dimensions } from 'react-native'

import { useFonts } from 'expo-font';
import { Italiana_400Regular } from '@expo-google-fonts/italiana';

import colors from './colors';
const screenHeight = Dimensions.get('window').height;

export default function LogIn({ navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);

    if (!error) {
      navigation.navigate('Account');
    }
  }

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Italiana_400Regular,
  });

  return (
    <Container>
    <HeaderContainer>
      <BackButtonDiv>
        <Button 
          icon={{ type: 'font-awesome', name: 'arrow-left' }}
          onPress={() => navigation.goBack()} 
          buttonStyle={{ 
        backgroundColor: 'none', 
        padding: 0,
        margin: 0,
        height: 25, 
        width: 55, 
        borderRadius: 100, 
          }} 
          titleStyle={{ fontFamily: 'Lato' }}
        />
      </BackButtonDiv>
      <Image source={require('../assets/favicon.png')} style={{ width: 50, height: 50 }} />
    </HeaderContainer>
      <Title>Welcome Back</Title>
      <InputContainer>
        <Input
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email or Username"
          autoCapitalize={'none'}
          inputStyle={{ fontFamily: 'Lato' }}
        />
      </InputContainer>
      <InputContainer>
        <Input
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          inputStyle={{ fontFamily: 'Lato', fontSize: 20 }}
        />
      </InputContainer>
      <ButtonContainer>
        <Button 
          title="Sign in" 
          disabled={loading} 
          onPress={() => signInWithEmail()} 
          buttonStyle={{ backgroundColor: colors.brown, height: 40, width: Dimensions.get('window').width / 2, borderRadius: 100 }}
          titleStyle={{ fontFamily: 'Merriweather' }}
        />
      </ButtonContainer>
      <ButtonContainer>
        <Button
          title="Forgot password"
          onPress={() => null}
          buttonStyle={{
        backgroundColor: 'none',
        padding: 0,
        margin: 0,
        borderRadius: 100,
          }}
          titleStyle={{ fontFamily: 'Lato', color: '#838383' }}
        />
      </ButtonContainer>
    </Container>
  );
}

const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  height: 50px;
  justify-content: center;
  position: relative;
  align-items: center;
`
const BackButtonDiv = styled.View`
  position: absolute;
  left: 0;
  transform: translateX(-15px);
` 

// Styled Components
const Container = styled.View`
  margin-top: 80px;
  padding: 0 30px;
`;

const Title = styled.Text`
  font-family: 'Merriweather';
  font-size: 40px;
  color: ${colors.brown};
  padding-top: 50px;
  padding-bottom: 40px;
`;

const InputContainer = styled.View`
  padding-top: 4px;
  padding-bottom: 4px;
  align-self: stretch;
`;

const ButtonContainer = styled.View`
  overflow: hidden;
  display: flex;
  align-items: center;
  padding-top: 40px;
`
