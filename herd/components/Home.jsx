import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import { Image, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import Avatar from './Avatar';
import colors from './colors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { LatoTitle } from './Elements';
import {
  faBars,
  faHouse,
  faMusic,
  faUser
//   faThumbsUp,
//   faComment,
} from '@fortawesome/free-solid-svg-icons';
import { faComment, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { useNavigation } from '@react-navigation/native';

import {
  HeaderContainer,
  NavbarLeft,
  NavbarRight,
} from './Header';
import {
  FooterContainer,
  FooterButton,
} from './Footer';
import {
  Container,
} from './Elements';

const bins = [
  { title: 'Daily 5' },
  { title: 'Top 10 New' },
  { title: 'Top 10 Friends' },
  { title: 'Weekly Picks' },
  { title: 'Mood Booster' },
];

// Array of progressively lighter colors
const binColors = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'];


const feedData = [
  {
    friendName: 'John Doe',
    songName: 'Imagine',
    artist: 'John Lennon',
    ranking: 5,
  },
  {
    friendName: 'Jane Smith',
    songName: 'Bohemian Rhapsody',
    artist: 'Queen',
    ranking: 4,
  },
  {
    friendName: 'Liam Robinson',
    songName: 'Shape of You',
    artist: 'Ed Sheeran',
    ranking: 3,
  },
];

export default function Home({ session }) {
  const navigation = useNavigation();

  const handleBinPress = (binTitle) => {
    console.log(`Clicked on ${binTitle}`);
  };

  return (
    <>
      <HeaderContainer>
        <NavbarLeft>
          <Text
            style={{
              fontFamily: 'Italiana',
              fontSize: 30,
              paddingLeft: 25,
            }}
          >
            herd
          </Text>
        </NavbarLeft>
        <Image
          source={require('../assets/favicon.png')}
          style={{ width: 25, height: 25 }}
        />
        <NavbarRight>
          <Button
            icon={{ type: 'font-awesome', name: 'bars' }}
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
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <LatoTitle>Bins</LatoTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingVertical: 10 }}
          >
            {bins.map((bin, index) => (
              <TouchableOpacity key={index} onPress={() => handleBinPress(bin.title)}>
                <BinTile style={{ backgroundColor: binColors[index] }}>
                  <BinText>{bin.title}</BinText>
                </BinTile>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <LatoTitle style={{ paddingBottom: 25, paddingTop: 40 }}>Feed</LatoTitle>
          {feedData.map((item, index) => (
            <FeedRow key={index} style={{ paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <View style={{ flex: 0.8 }}>
                <FeedText>
                  <Text style={{ fontWeight: '600' }}>{item.friendName}</Text> ranked{' '}
                  <Text style={{ fontWeight: '700' }}>{item.songName}</Text> by{' '}
                  <Text style={{ fontWeight: '700' }}>{item.artist}</Text> a{' '}
                  <Text style={{ color: 'green', fontWeight: '700' }}>{item.ranking}</Text>
                </FeedText>
              </View>
              <IconContainer>
                <FontAwesomeIcon icon={faThumbsUp} size={20} />
                <FontAwesomeIcon icon={faComment} size={20} />
              </IconContainer>
            </FeedRow>
          ))}
        </ScrollView>
      </Container>
      <FooterContainer>
        <TouchableOpacity>
          <FontAwesomeIcon icon={faHouse} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <FontAwesomeIcon icon={faMusic} size={24} color={'#757575'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <FontAwesomeIcon icon={faUser} size={24} color={'#757575'} />
        </TouchableOpacity>
      </FooterContainer>
    </>
  );
}

const BinTile = styled.View`
  width: 125px;
  height: 125px;
  border-radius: 10px;
  margin-right: 10px;
  justify-content: flex-end;
  padding: 10px;
`;

const BinText = styled.Text`
  color: white;
  font-family: 'Lato';
  font-size: 18px;
  font-weight: 600;
  opacity: 0.7;
`;

const FeedRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const FeedText = styled.Text`
  font-family: 'Lato';
  font-size: 18px;
  line-height: 30px;
`;

const IconContainer = styled.View`
  flex: 0.2;
  flex-direction: row;
  justify-content: space-around;
  margin-left: 20px;
`;
