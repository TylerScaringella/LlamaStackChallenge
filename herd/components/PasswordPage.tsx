import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { HeaderContainer, BackButtonDiv, Container, Title, InputContainer, ButtonContainer } from './StyledComponents';
import colors from './colors';
import ProgressDots from './ProgressDots';

export default function PasswordPage({ navigation, route }) {
  const { username } = route.params;
  const [password, setPassword] = useState('');

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

      <Title>Password</Title>
      <InputContainer>
        <Input
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Enter your password"
        />
      </InputContainer>
      
      <ButtonContainer>
        <Button 
          title="Next"
          onPress={() => navigation.navigate('EmailPage', { username, password })}
          buttonStyle={{ backgroundColor: colors.brown, height: 40, width: 200, borderRadius: 100 }}
        />
      </ButtonContainer>
            <ProgressDots currentStep={2} />
    </Container>
  );
}
