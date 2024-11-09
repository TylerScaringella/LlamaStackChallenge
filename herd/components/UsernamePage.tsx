import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Italiana_400Regular } from '@expo-google-fonts/italiana';
import { HeaderContainer, BackButtonDiv, Container, Title, InputContainer, ButtonContainer } from './StyledComponents';
import colors from './colors';
import ProgressDots from './ProgressDots';


export default function UsernamePage({ navigation }) {
  const [username, setUsername] = useState('');
  const [fontsLoaded] = useFonts({ Italiana_400Regular });

  return (
    <Container>
      <HeaderContainer>
        <BackButtonDiv>
          <Button 
            icon={{ type: 'font-awesome', name: 'arrow-left' }}
            onPress={() => navigation.goBack()} 
            buttonStyle={{ backgroundColor: 'none', padding: 0, margin: 0, height: 25, width: 55, borderRadius: 100 }} 
          />
        </BackButtonDiv>
        <Image source={require('../assets/favicon.png')} style={{ width: 50, height: 50 }} />
      </HeaderContainer>
      
      <Title>Username</Title>
      <InputContainer>
        <Input
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Enter your username"
        />
      </InputContainer>
      
      <ButtonContainer>
        <Button 
          title="Next"
          onPress={() => navigation.navigate('PasswordPage', { username })}
          buttonStyle={{ backgroundColor: colors.brown, height: 40, width: 200, borderRadius: 100 }}
        />
      </ButtonContainer>
            <ProgressDots currentStep={1} />
    </Container>
  );
}
