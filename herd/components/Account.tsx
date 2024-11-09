import { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { Image, Text, ScrollView } from 'react-native';
import Avatar from './Avatar';
import colors from './colors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

import { HeaderContainer, NavbarLeft, NavbarRight } from './Header';
import { FooterContainer, FooterButton } from './Footer';
import { Container, LargeText, Row, RowLeftTextContainer, RowTitle, RowSubTitle, SectionHeader } from './Elements';


const songData = [
  { name: 'John Doe', username: '@johndoe', avatar: 'https://via.placeholder.com/50' },
  { name: 'Jane Smith', username: '@janesmith', avatar: 'https://via.placeholder.com/50' },
  { name: 'Liam Robinson', username: '@liamrobinson', avatar: 'https://via.placeholder.com/50' },
  { name: 'Mia Thomas', username: '@miathomas', avatar: 'https://via.placeholder.com/50' },
  { name: 'Noah Clark', username: '@noahclark', avatar: 'https://via.placeholder.com/50' },
  { name: 'Olivia Lopez', username: '@olivialopez', avatar: 'https://via.placeholder.com/50' },
  { name: 'Peter Hall', username: '@peterhall', avatar: 'https://via.placeholder.com/50' },
  { name: 'Quinn Young', username: '@quinnyoung', avatar: 'https://via.placeholder.com/50' },
  { name: 'Rachel King', username: '@rachelking', avatar: 'https://via.placeholder.com/50' },
  { name: 'Sam Walker', username: '@samwalker', avatar: 'https://via.placeholder.com/50' }
];

export default function Account({ session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [friends, setFriends] = useState(songData.map(friend => ({ ...friend, followed: false })));
    const navigation = useNavigation();

    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) throw error

            if (data) {
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({ username, website, avatar_url }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <HeaderContainer>
                <NavbarLeft>
                    <Text style={{ fontFamily: 'Italiana', fontSize: 30, paddingLeft: 25 }}>herd</Text>
                </NavbarLeft>
                <Image source={require('../assets/favicon.png')} style={{ width: 25, height: 25 }} />
                <NavbarRight>
                    <Button
                        icon={{ type: 'font-awesome', name: 'bars' }}
                        // onPress={() => navigation.goBack()}
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
                </NavbarRight>
            </HeaderContainer>
        <Container style={{ paddingBottom: 65}}>
            
            <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
                <AvatarWrapper>
                    <Avatar
                        size={100}
                        url={avatarUrl}
                        onUpload={(url) => {
                            setAvatarUrl(url)
                            updateProfile({ username, website, avatar_url: url })
                        }}
                    />
                </AvatarWrapper>
                <HFlexContainer>
                    <LargeText style={{ fontFamily: 'Lato' }}>Drake</LargeText>
                    <FontAwesomeIcon icon={faChevronRight} size={24} color={'#bebebe'} style={{paddingRight: 40}}/>
                </HFlexContainer>
                <HFlexContainer>
                <LargeText style={{ fontFamily: 'Lato', color: '#5a5a5a' }}>The Beatles</LargeText>
                    <FontAwesomeIcon icon={faChevronRight} size={24} color={'#bebebe'} style={{paddingRight: 40}}/>
                </HFlexContainer>
                <HFlexContainer>
                <LargeText style={{ fontFamily: 'Lato', color: '#777777' }}>Childish Gambino</LargeText>
                    <FontAwesomeIcon icon={faChevronRight} size={24} color={'#bebebe'} style={{paddingRight: 40}}/>
                </HFlexContainer>

                <SectionHeader style={{ paddingTop: 50 }}>Discography</SectionHeader>
                {friends.map((friend, index) => (
                    <Row key={index}>
                        <ProfileImage source={{ uri: friend.avatar }} />
                        <RowLeftTextContainer>
                            <RowTitle>{friend.name}</RowTitle>
                            <RowSubTitle>{friend.username}</RowSubTitle>
                        </RowLeftTextContainer>
                        <RowTitle style={{ color: 'darkgreen' }}>10.0</RowTitle>
                    </Row>
                ))}
            </ScrollView>
        </Container>
            <FooterContainer>
                <FooterButton onPress={() => navigation.navigate("Home")}>
                    <FontAwesomeIcon icon={faHouse} size={24} color={'#757575'}/>
                </FooterButton>
                <FooterButton onPress={() => navigation.navigate("Search")}>
                    <FontAwesomeIcon icon={faMusic} size={24} color={'#757575'}/>
                </FooterButton>
                <FooterButton>
                    <FontAwesomeIcon icon={faUser} size={24} />
                </FooterButton>
            </FooterContainer>
            </>
    )
}

const AvatarWrapper = styled.View`
    margin: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ProfileImage = styled.Image`
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 15px;
`;

const HFlexContainer = styled.View`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    `;
