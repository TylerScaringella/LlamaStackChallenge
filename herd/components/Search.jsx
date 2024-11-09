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

    useEffect(() => {
        Animated.timing(underlinePosition, {
            toValue: boolMusicMembers ? 1 : 0, // Move to the right if true, left if false
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [boolMusicMembers]);

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

                    <MusicMembersContainer>
                        <HFlexContainer>
                            <Button
                                onPress={() => setBoolMusicMembers(false)}
                                title="Music"
                                type="clear"
                                titleStyle={{
                                    color: boolMusicMembers ? 'gray' : colors.brown,
                                    fontSize: 25,
                                    fontFamily: 'Lato',
                                    fontWeight: '500'
                                }}
                                containerStyle={{ flex: 1, alignItems: 'center' }}
                            />
                            <Button
                                onPress={() => setBoolMusicMembers(true)}
                                title="Members"
                                type="clear"
                                titleStyle={{
                                    color: boolMusicMembers ? colors.brown : 'gray',
                                    fontSize: 25,
                                    fontFamily: 'Lato',
                                    fontWeight: '500'
                                }}
                                containerStyle={{ flex: 1, alignItems: 'center' }}
                            />
                        </HFlexContainer>
                        <Animated.View
                            style={{
                                height: 2,
                                width: '30%',
                                backgroundColor: colors.brown,
                                position: 'absolute',
                                bottom: 0,
                                left: underlinePosition.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['16%', '65.6%'], // 0% for "Music", 50% for "Members"
                                }),
                            }}
                        />
                    </MusicMembersContainer>
                    <>
                        {boolMusicMembers ? (
                            <>
                                <SearchBarContainer>
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        size={20}
                                        color={'#bebebe'}
                                        style={{ marginRight: 10, marginLeft: 5, marginTop: 5, marginBottom: 5 }}
                                    />
                                    <SearchInput placeholder="Search for members, users..." placeholderTextColor="gray" />
                                </SearchBarContainer>
                                <LatoTitle>Recent </LatoTitle>
                                {friends.map((friend, index) => (
                                    <Row key={index}>
                                        <RowLeftTextContainer>
                                            <RowTitle>{friend.name}</RowTitle>
                                            <RowSubTitle>{friend.username}</RowSubTitle>
                                        </RowLeftTextContainer>
                                        <Button
                                            icon={<FontAwesomeIcon icon={faX} size={10} color={friend.followed ? colors.brown : 'gray'} />}
                                            onPress={() => {
                                                const newFriends = [...friends];
                                                newFriends[index].followed = !newFriends[index].followed;
                                                setFriends(newFriends);
                                            }}
                                            buttonStyle={{
                                                backgroundColor: 'none',
                                                padding: -1,
                                                margin: -1,
                                                height: 24,
                                                width: 54,
                                                borderRadius: 99,
                                            }}
                                        />
                                    </Row>
                                ))}
                                <LatoTitle>Suggestions</LatoTitle>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10}}>
                                    {friends2.map((friend, index) => (
                                        <SuggestionTile key={index}>
                                            <ProfileImage source={{ uri: friend.avatar }} />
                                            <Text style={{ fontFamily: 'Lato', fontSize: 14, fontWeight: 500, marginTop: 10, marginBottom: 10 }}>{friend.name}</Text>
                                            <Button
                                                title={friend.followed ? 'Following' : 'Follow'}
                                                onPress={() => {
                                                    const updatedFriends = [...friends2];
                                                    updatedFriends[index].followed = !updatedFriends[index].followed;
                                                    setFriends2(updatedFriends);
                                                }}
                                                buttonStyle={friend.followed ? followedButtonStyle : followButtonStyle}
                                                titleStyle={friend.followed ? followedTitleStyle : {fontSize: 14}}
                                                containerStyle={{ marginTop: 5 }}
                                            />
                                        </SuggestionTile>
                                    ))}
                                </ScrollView>
                            </>
                        ) : (

                            <>
                                <SearchBarContainer>
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        size={20}
                                        color={'#bebebe'}
                                        style={{ marginRight: 10, marginLeft: 5, marginTop: 5, marginBottom: 5 }}
                                    />
                                    <SearchInput placeholder="Search for members, users..." placeholderTextColor="gray" />
                                </SearchBarContainer>
                                <LatoTitle>Recent </LatoTitle>
                                {friends2.map((friend, index) => (
                                    <Row key={index}>
                                        <RowLeftTextContainer>
                                            <RowTitle>{friend.name}</RowTitle>
                                            <RowSubTitle>{friend.username}</RowSubTitle>
                                        </RowLeftTextContainer>
                                        <Button
                                            icon={<FontAwesomeIcon icon={faX} size={10} color={friend.followed ? colors.brown : 'gray'} />}
                                            onPress={() => {
                                                const newFriends = [...friends];
                                                newFriends[index].followed = !newFriends[index].followed;
                                                setFriends(newFriends);
                                            }}
                                            buttonStyle={{
                                                backgroundColor: 'none',
                                                padding: -1,
                                                margin: -1,
                                                height: 24,
                                                width: 54,
                                                borderRadius: 99,
                                            }}
                                            titleStyle={{ fontFamily: 'Lato' }}
                                        />
                                    </Row>
                                ))}
                                <LatoTitle>Recommended </LatoTitle>
                                {friends2.map((friend, index) => (
                                    <Row key={index}>
                                        <RowLeftTextContainer>
                                            <RowTitle>{friend.name}</RowTitle>
                                            <RowSubTitle>{friend.username}</RowSubTitle>
                                        </RowLeftTextContainer>
                                        <Button
                                            icon={<FontAwesomeIcon icon={faX} size={10} color={friend.followed ? colors.brown : 'gray'} />}
                                            onPress={() => {
                                                const newFriends = [...friends];
                                                newFriends[index].followed = !newFriends[index].followed;
                                                setFriends(newFriends);
                                            }}
                                            buttonStyle={{
                                                backgroundColor: 'none',
                                                padding: -1,
                                                margin: -1,
                                                height: 24,
                                                width: 54,
                                                borderRadius: 99,
                                            }}
                                            titleStyle={{ fontFamily: 'Lato' }}
                                        />
                                    </Row>
                                ))}
                            </>
                        )}
                    </>

                </ScrollView>
            </Container>
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
`;