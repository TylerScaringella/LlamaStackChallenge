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
  LatoText,
  LatoTitle,
  GraySubText,
    MerriweatherText
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

        <TwoColumnLayout>
            <LeftColumn>
              <RoundedImage source={require('../assets/yeAlbum.jpg')} resizeMode="cover" />
            </LeftColumn>
            <RightColumn>
                <SongArtistStack>
                    <LatoText style={{fontWeight: 700}}>Congratulations (feat. Bilal)</LatoText>
                    <LatoText style={{fontSize: 15}}>Mac Miller, Bital</LatoText>
                </SongArtistStack>
            </RightColumn>
          </TwoColumnLayout>

        <TwoColumnLayout style={{ flexDirection: "column", marginTop: 10 , alignItems: "center"}}>
           <LatoTitle style={{paddingTop: 10, paddingBottom: 0, fontSize: 40, color: colors.black, fontWeight: 700, margin: 5}}>4th</LatoTitle>
           <LatoTitle style={{paddingTop: 0, fontSize: 21, color: colors.black, fontWeight: 400, margin: 5}}>Rank</LatoTitle>
            
          </TwoColumnLayout>
        <TwoColumnLayout style={{ flexDirection: "column", marginTop: 10, alignItems: "center" }}>
           <LatoTitle style={{paddingTop: 10, paddingBottom: 0, fontSize: 40, color: '#006907', fontWeight: 700, margin: 5}}>9.9</LatoTitle>
           <LatoTitle style={{paddingTop: 0, fontSize: 21, color: colors.black, fontWeight: 400, margin: 5}}>Rating</LatoTitle>
            
          </TwoColumnLayout>
            <HorizontalContainer style={{justifyContent: 'center', marginTop: 10}}>
              <GutCheckButton style={{backgroundColor: colors.brown, width: "60%"}}>
          <GutCheckButtonText style={{fontSize: 20, color: 'white' }}>Done</GutCheckButtonText>
              </GutCheckButton>
            </HorizontalContainer>
          
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
const GutCheckBubble = styled.View`
    background-color: #b8b8b811;
    border-radius: 15px;
    padding: 10px;
    border: 1px #0f0f0f14;
`
const TwoColumnLayout = styled.View`
  flex-direction: row;
  color: lightblue;
    background-color: #b8b8b811;
    border-radius: 15px;
    padding: 10px;
    border: 1px #0f0f0f14;
`;

const LeftColumn = styled.View`
`;

const RightColumn = styled.View`
  /* width: 30%; */
  /* width: 100px; */
  justify-content: center;
`;

const GutCheckButton = styled.TouchableOpacity`
    height: 45px;
    width: 32%;
    margin: 3px;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    border: 1px solid #0000001c;
    
`;

const GutCheckButtonText = styled.Text`
    font-family: 'Lato';
    font-size: 16px;
    font-weight: 600;
    color: #000000b3; 
`
const SongArtistStack = styled.View`
    gap: 5px;
    padding: 10px;
    padding-left: 20px;
    flex-direction: column;
`
const RoundedImage = styled.Image`
  height: 100px;
  border-radius: 10px;
  border-width: 0.5px;
  aspect-ratio: 1;
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
`