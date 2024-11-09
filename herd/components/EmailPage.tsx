import React, { useState } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { HeaderContainer, BackButtonDiv, Container, Title, InputContainer, ButtonContainer } from './StyledComponents';
import colors from './colors';
import ProgressDots from './ProgressDots';
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function EmailPage({ navigation, route}) {
    const [loading, setLoading] = useState(true)
    // const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [email, setEmail] = useState('');

    const { username, password } = route.params;

    const [sessionGlobal, setSessionGlobal] = useState<Session | null>(null);

    async function initializeSession() {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert(error.message);
        // } else if (!session) {
        //     Alert.alert('Please check your inbox for email verification!');
        } else {
            await updateProfile({ username, website, avatar_url: avatarUrl }, session);
        }
        setLoading(false);
    }

    async function updateProfile({
        username,
        website,
        avatar_url,
    }: {
        username: string
        website: string
        avatar_url: string
    }, session: Session) { // Pass the session as a parameter
        try {
            setLoading(true);
            if (!session.user) throw new Error('No user on the session!');

            const updates = {
                id: session.user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setLoading(false);

            // navigation.navigate('Account', { session: session }); // Pass the session to the Account screen
            navigation.navigate('TopThreeArtists');
        }
    }


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

      <Title>Email</Title>
      <InputContainer>
        <Input
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Enter your email"
        />
      </InputContainer>
      
    <ButtonContainer>
      <Button 
        title="Complete Setup"
        onPress={async () => {
        Alert.alert(`Username: ${username}\nPassword: ${password}\nEmail: ${email}`);
        await initializeSession();
        }}
        // disabled={loading}
        buttonStyle={{ backgroundColor: colors.brown, height: 40, width: 200, borderRadius: 100 }}
      />
    </ButtonContainer>
        <ProgressDots currentStep={3} />
    </Container>
  );
}
