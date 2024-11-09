// Import necessary modules and components
import { useState, useMemo } from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import colors from './colors';
import {
  LargeImageWrapper,
  WideImage,
  Container,
  SectionHeader,
  Row,
  RowLeftTextContainer,
  RowTitle,
  RowSubTitle,
  LatoTitle,
  GraySubText,
} from './Elements';
import { HeaderContainer, NavbarLeft, NavbarRight } from './Header';
import { FooterContainer, FooterButton } from './Footer';
import { Input } from '@rneui/themed';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { faPerson } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
// Import KeyboardAwareScrollView
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Sample data for friends section
const friendsData = [
  { name: 'Alice Johnson', score: '8.5' },
  { name: 'Bob Smith', score: '9.0' },
  { name: 'Charlie Davis', score: '7.5' },
];

export default function NewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

const averageScore = useMemo(() => {
  const totalScore = friendsData.reduce((sum, friend) => sum + parseFloat(friend.score), 0);
  return (totalScore / friendsData.length).toFixed(1);
}, [friendsData]);

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <HeaderContainer>
        <NavbarLeft>
          <TouchableOpacity style={{ paddingLeft: 20 }}>
            <FontAwesomeIcon icon={faArrowLeft} size={24} color={colors.black} />
          </TouchableOpacity>
        </NavbarLeft>
        <PlaceholderIcon />
        <NavbarRight>
          <TouchableOpacity style={{ paddingRight: 10 }}>
            <FontAwesomeIcon icon={faArrowUpFromBracket} size={24} color={colors.black} />
          </TouchableOpacity>
        </NavbarRight>
      </HeaderContainer>

      <Container style={{ marginBottom: 60 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ paddingVertical: 20 }}
          enableOnAndroid={true}
          extraScrollHeight={150} // Adjust this value as needed
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardOpeningTime={500}
        >
          <LargeImageWrapper>
            <WideImage source={require('../assets/yeAlbum.jpg')} resizeMode="contain" />
            <IconContainer>
              <TouchableOpacity>
                <FontAwesomeIcon icon={faPlus} size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesomeIcon icon={faHeart} size={20} color="white" />
              </TouchableOpacity>
            </IconContainer>
          </LargeImageWrapper>

          <TwoColumnLayout>
            <LeftColumn>
              <RowTitle
                style={{
                  color: colors.black,
                  fontSize: 30,
                  fontFamily: 'Merriweather',
                  fontWeight: '600',
                }}
              >
                Everything I Am
              </RowTitle>
              <TagsText
                style={{
                  fontSize: 16,
                  paddingBottom: 10,
                  lineHeight: 30,
                  color: colors.black,
                }}
              >
                Anthem &#183; Banger &#183; The Boys
              </TagsText>
              <RowTitle
                style={{
                  paddingTop: 5,
                  color: colors.black,
                  fontSize: 23,
                  fontFamily: 'Lato',
                  fontWeight: '600',
                }}
              >
                Kanye West
              </RowTitle>
              <TagsText
                style={{
                  fontSize: 16,
                  fontStyle: 'italic',
                  color: colors.black,
                  lineHeight: 32,
                }}
              >
                Graduation
              </TagsText>
              <TagsText style={{ fontSize: 16, fontStyle: 'italic', color: colors.black }}>
                Hip Hop
              </TagsText>
            </LeftColumn>
            <RightColumn>
              <RoundedImage source={require('../assets/yeHeadshot.jpg')} resizeMode="cover" />
            </RightColumn>
          </TwoColumnLayout>

          <StatsRow>
            <StatItem>
              <LargeGreenNumber>9.9</LargeGreenNumber>
              <Caption>Herd Score</Caption>
            </StatItem>
            <StatItem>
              <LargeGreenNumber>9.9</LargeGreenNumber>
              <Caption>Friends Score</Caption>
            </StatItem>
            <StatItem>
              <LargeGreenNumber>9.9</LargeGreenNumber>
              <Caption>Predicted Score</Caption>
            </StatItem>
          </StatsRow>

          <LatoTitle>Live</LatoTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LiveImage source={require('../assets/yeLive.webp')} />
            <LiveImage source={require('../assets/yeLive.webp')} />
            <LiveImage source={require('../assets/yeLive.webp')} />
          </ScrollView>

          <LatoTitle>Journal</LatoTitle>
          <JournalItem>
            <FontAwesomeIcon icon={faBook} size={15} style={{ marginRight: 16 }} color={'#757575'} />
            <JournalText>Add Thoughts</JournalText>
          </JournalItem>
          <JournalItem>
            <FontAwesomeIcon icon={faPencil} size={15} style={{ marginRight: 16 }} color={'#757575'} />
            <JournalText>Add a favorite lyric</JournalText>
          </JournalItem>
          <JournalItem>
            <FontAwesomeIcon icon={faCalendar} size={15} style={{ marginRight: 16 }} color={'#757575'} />
            <JournalText>Add a date</JournalText>
          </JournalItem>
          <JournalItem>
            <FontAwesomeIcon icon={faClock} size={15} style={{ marginRight: 16 }} color={'#757575'} />
            <JournalText>Add a memory</JournalText>
          </JournalItem>
          <JournalItem>
            <FontAwesomeIcon icon={faPerson} size={15} style={{ marginRight: 16 }} color={'#757575'} />
            <JournalText>Add a person</JournalText>
          </JournalItem>

          <LatoTitle style={{paddingBottom: 15}}>Friends</LatoTitle>
          <HorizontalContainer>
          <SearchBarContainer style={{maxWidth: '80%'}}>
            <Input
              style ={{paddingTop: 22, paddingLeft: 10}}
              placeholder="Search Friends"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => {
                if (searchQuery === '') setIsSearchActive(false);
              }}
              containerStyle={{ flex: 1, paddingHorizontal: 0 }}
              inputContainerStyle={{ borderBottomWidth: 0, height: 20 }}
            />
            {isSearchActive && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setIsSearchActive(false);
                  Keyboard.dismiss();
                }}
              >
                <CancelText>Cancel</CancelText>
              </TouchableOpacity>
            )}
          </SearchBarContainer>
                      <ScoreCircle>
              <ScoreText>{averageScore}</ScoreText>
            </ScoreCircle>
          </HorizontalContainer>
          {filteredFriends.map((friend, index) => (
            <Row key={index}>
              <RowLeftTextContainer style={{ marginLeft: 8  }}>
                <RowTitle style={{ fontFamily: 'Lato', color: colors.black }}>
                  {friend.name}
                </RowTitle>
              </RowLeftTextContainer>
              <RowTitle
                style={{
                  color: 'darkgreen',
                  fontFamily: 'Lato',
                  marginRight: 8,
                  fontWeight: 'bold',
                }}
              >
                {friend.score}
              </RowTitle>
            </Row>
          ))}
        </KeyboardAwareScrollView>
      </Container>

      <FooterContainer>
        <FooterButton>
          <FontAwesomeIcon icon={faHouse} size={24} color={'#757575'} />
        </FooterButton>
        <FooterButton>
          <FontAwesomeIcon icon={faMusic} size={24} />
        </FooterButton>
        <FooterButton>
          <FontAwesomeIcon icon={faUser} size={24} color={'#757575'} />
        </FooterButton>
      </FooterContainer>
    </>
  );
}

// Styled-components

const TwoColumnLayout = styled.View`
  flex-direction: row;
  margin: 20px 10px;
`;

const LeftColumn = styled.View`
  width: 70%;
`;

const RightColumn = styled.View`
  width: 30%;
  width: 100px;
`;

const RoundedImage = styled.Image`
  width: 100%;
  height: 150px;
  border-radius: 10px;
  border-width: 0.5px;
  border-color: #6b6b6b;
`;

const TagsText = styled.Text`
  font-family: 'Lato';
  color: ${colors.brown};
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 7px;
  margin-bottom: 0px;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const LargeGreenNumber = styled.Text`
  font-size: 28px;
  color: green;
  font-family: 'Lato';
  font-weight: bold;
`;

const Caption = styled.Text`
  font-size: 15px;
  color: ${colors.black};
  font-family: 'Lato';
  padding-top: 5px;
`;

const LiveImage = styled.Image`
  width: 150px;
  height: 100px;
  margin-right: 10px;
  border-radius: 10px;
`;

const JournalItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
  padding-left: 8px;
`;

const JournalText = styled.Text`
  font-family: 'Lato';
  font-size: 16px;
  color: gray;
`;

const PlaceholderIcon = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #00000050;
`;

const IconContainer = styled.View`
  position: absolute;
  bottom: 10px;
  right: 10px;
  flex-direction: row;
  gap: 20px;
  background-color: rgba(82, 82, 82, 0.699);
  padding: 12px;
  border-radius: 8px;
`;

const SearchBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 7px;
  margin-bottom: 10px;
  border: 1px solid ${colors.brown};
  border-radius: 20px;
  align-items: center;
`;

const CancelText = styled.Text`
  color: ${colors.brown};
  font-family: lato;
  margin-left: 10px;
  font-size: 16px;
`;

const ScoreCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #d4edda;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  margin-bottom: 5px;
`;

const ScoreText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: darkgreen;
`;

const HorizontalContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;