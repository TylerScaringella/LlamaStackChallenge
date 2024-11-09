import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { Image, Text, ScrollView, View, Animated } from 'react-native';
import Avatar from './Avatar';
import colors from './colors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

import { HeaderContainer, NavbarLeft, NavbarRight } from './Header';
import { FooterContainer, FooterButton } from './Footer';
import { SuggestionTile, followButtonStyle, followedButtonStyle, followedTitleStyle, Container, LargeText, Row, RowLeftTextContainer, RowTitle, RowSubTitle, SectionHeader, LatoTitle, GraySubText} from './Elements';


const songData = [
    { name: 'John Doe', username: '@johndoe', avatar: 'https://via.placeholder.com/50' },
    { name: 'Jane Smith', username: '@janesmith', avatar: 'https://via.placeholder.com/50' },
    { name: 'Liam Robinson', username: '@liamrobinson', avatar: 'https://via.placeholder.com/50' },
    { name: 'Mia Thomas', username: '@miathomas', avatar: 'https://via.placeholder.com/50' },
];

const songData2 = [
    { name: 'Juan Doe', username: '@johndoe', avatar: 'https://via.placeholder.com/50' },
    { name: 'Jane Smith', username: '@janesmith', avatar: 'https://via.placeholder.com/50' },
    { name: 'Liam Robinson', username: '@liamrobinson', avatar: 'https://via.placeholder.com/50' },
    { name: 'Mia Thomas', username: '@miathomas', avatar: 'https://via.placeholder.com/50' },
    { name: 'Jane Smith', username: '@janesmith', avatar: 'https://via.placeholder.com/50' },
    { name: 'Liam Robinson', username: '@liamrobinson', avatar: 'https://via.placeholder.com/50' },
    { name: 'Mia Thomas', username: '@miathomas', avatar: 'https://via.placeholder.com/50' },
];
export default function Search({ session }) {
    const [friends, setFriends] = useState(songData.map(friend => ({ ...friend, followed: false })));
    const [friends2, setFriends2] = useState(songData2.map(friend => ({ ...friend, followed: false })));
    const [boolMusicMembers, setBoolMusicMembers] = useState(true); // Boolean to control display
    const underlinePosition = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();


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
            <Container style={{ paddingBottom: 65 }}>

                <ScrollView contentContainerStyle={{ paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
                        <View style={{width: "100%", backgroundColor: 'lightblue', height: 10, borderRadius: 10   }}></View>
                        <LatoTitle style={{fontSize: 20, paddingBottom: 20, fontWeight: 700, color: colors.black}}>Top 50: Pop</LatoTitle>
           {friends.map((friend, index) => (
    <Row key={index}>
        <CounterContainer>
            <CounterText>{index + 1}</CounterText>  
        </CounterContainer>
        <RowLeftTextContainer style={{paddingLeft: 18}}>
            <RowTitle style={{ fontSize: 18, fontWeight: 700, paddingBottom: 8, color: colors.black }}>
                {friend.name}
            </RowTitle>
            <RowSubTitle style={{ fontSize: 18, color: colors.black }}>
                {friend.username}
            </RowSubTitle>
        </RowLeftTextContainer>
    </Row>
))} 
            </ScrollView>
        </Container >
            <FooterContainer>
                <FooterButton onPress={() => navigation.navigate("Home")}>
                    <FontAwesomeIcon icon={faHouse} size={24} color={'#757575'} />
                </FooterButton>
                <FooterButton>
                    <FontAwesomeIcon icon={faMusic} size={24} />
                </FooterButton>
                <FooterButton onPress={() => navigation.navigate("Account")}>
                    <FontAwesomeIcon icon={faUser} size={24} color={'#757575'} />
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
    /* margin-right: 15px; */
`;

const HFlexContainer = styled.View`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    `;

const MusicMembersContainer = styled.View`
    padding: 0 20px;
    margin-bottom: 20px;
`;

const SearchBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: gray;
  border-radius: 10px;
  padding: 8px;
    margin-bottom: 10px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: black;
`

const CounterContainer = styled.View`
    width: 30px; /* Adjust width as needed */
    justify-content: center;
    align-items: center;
`;

const CounterText = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.black};
`;