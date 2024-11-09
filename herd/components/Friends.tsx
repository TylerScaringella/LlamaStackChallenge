// Friends.js
import React, { useState } from 'react';
import { View, Image, ScrollView, Text } from 'react-native';
import { Button } from '@rneui/themed';
import styled from 'styled-components/native';
import { HeaderContainer, BackButtonDiv, Container, Title, GraySubText } from './Elements';
import { followButtonStyle, followedButtonStyle, followedTitleStyle } from './Elements';
import colors from './colors';

const friendsData = [
  { name: 'John Doe', username: '@johndoe', avatar: 'https://via.placeholder.com/50' },
  { name: 'Jane Smith', username: '@janesmith', avatar: 'https://via.placeholder.com/50' },
  { name: 'Alice Johnson', username: '@alicejohnson', avatar: 'https://via.placeholder.com/50' },
  { name: 'Bob Brown', username: '@bobbrown', avatar: 'https://via.placeholder.com/50' },
  { name: 'Charlie White', username: '@charliewhite', avatar: 'https://via.placeholder.com/50' },
  { name: 'Emily Davis', username: '@emilydavis', avatar: 'https://via.placeholder.com/50' },
  { name: 'Frank Harris', username: '@frankharris', avatar: 'https://via.placeholder.com/50' },
  { name: 'Grace Lee', username: '@gracelee', avatar: 'https://via.placeholder.com/50' },
  { name: 'Henry Kim', username: '@henrykim', avatar: 'https://via.placeholder.com/50' },
  { name: 'Ivy Martinez', username: '@ivymartinez', avatar: 'https://via.placeholder.com/50' },
  { name: 'Jack Wilson', username: '@jackwilson', avatar: 'https://via.placeholder.com/50' },
  { name: 'Katie Anderson', username: '@katieanderson', avatar: 'https://via.placeholder.com/50' },
  { name: 'Liam Robinson', username: '@liamrobinson', avatar: 'https://via.placeholder.com/50' },
  { name: 'Mia Thomas', username: '@miathomas', avatar: 'https://via.placeholder.com/50' },
  { name: 'Noah Clark', username: '@noahclark', avatar: 'https://via.placeholder.com/50' },
  { name: 'Olivia Lopez', username: '@olivialopez', avatar: 'https://via.placeholder.com/50' },
  { name: 'Peter Hall', username: '@peterhall', avatar: 'https://via.placeholder.com/50' },
  { name: 'Quinn Young', username: '@quinnyoung', avatar: 'https://via.placeholder.com/50' },
  { name: 'Rachel King', username: '@rachelking', avatar: 'https://via.placeholder.com/50' },
  { name: 'Sam Walker', username: '@samwalker', avatar: 'https://via.placeholder.com/50' }
];

export default function Friends({ navigation }) {
  const [friends, setFriends] = useState(friendsData.map(friend => ({ ...friend, followed: false })));

  const toggleFollow = (index) => {
    setFriends(prevFriends => {
      const updatedFriends = [...prevFriends];
      updatedFriends[index].followed = !updatedFriends[index].followed;
      return updatedFriends;
    });
  };

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

      <Title>Friends</Title>
      <GraySubText>Follow friends in the Herd</GraySubText>

      <ScrollView showsVerticalScrollIndicator={false}>
        {friends.map((friend, index) => (
          <FriendRow key={index}>
            <ProfileImage source={{ uri: friend.avatar }} />
            <NameContainer>
              <Name>{friend.name}</Name>
              <Username>{friend.username}</Username>
            </NameContainer>
            <Button
              title={friend.followed ? "Followed" : "Follow"}
              buttonStyle={friend.followed ? followedButtonStyle : followButtonStyle}
              titleStyle={friend.followed ? followedTitleStyle : {}}
              onPress={() => toggleFollow(index)}
            />
          </FriendRow>
        ))}
      </ScrollView>
    </Container>
  );
}

const FriendRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const ProfileImage = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
`;

const NameContainer = styled.View`
  flex: 1;
`;

const Name = styled.Text`
  font-family: 'Merriweather';
  font-size: 16px;
  color: ${colors.brown};
`;

const Username = styled.Text`
  font-family: 'Lato';
  font-size: 14px;
  color: #838383;
`;
