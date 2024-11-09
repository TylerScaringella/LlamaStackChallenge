// Import necessary modules and components
import React, { useRef } from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import colors from './colors';
import {
  Container,
  // ... other imports if necessary
} from './Elements';
import { HeaderContainer, NavbarLeft, NavbarRight } from './Header';
import { FooterContainer, FooterButton } from './Footer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_MARGIN = 10;
const SLIDE_WIDTH = SCREEN_WIDTH - 80;
const TOTAL_SLIDE_WIDTH = SLIDE_WIDTH + SLIDE_MARGIN * 2;
const PADDING_HORIZONTAL = (SCREEN_WIDTH - SLIDE_WIDTH) / 2;

const items = [
  {
    id: '1',
    title: 'Slide 1',
    description: 'description',
    image: require('../assets/yeAlbum.jpg'),
  },
  {
    id: '2',
    title: 'Slide 2',
    description: 'description',
    image: require('../assets/yeYeezus.webp'),
  },
  {
    id: '3',
    title: 'Slide 3',
    description: 'description',
    image: require('../assets/yeAlbum.jpg'),
  },
  {
    id: '4',
    title: 'Slide 4',
    description: 'description',
    image: require('../assets/yeYeezus.webp'),
  },
  {
    id: '5',
    title: 'Slide 5',
    description: 'description',
    image: require('../assets/yeAlbum.jpg'),
  },
];

export default function NewPage() {
  // Create a reference to the ScrollView
  const scrollViewRef = useRef(null);

  // Function to scroll to the desired slide
  const scrollToSlide = (index) => {
    if (scrollViewRef.current) {
      const xOffset = index * TOTAL_SLIDE_WIDTH - 10;
      scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  };

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

      <Container style={{ marginBottom: 60, marginTop: 30 }}>
        <BubbleHFlex>
          {items.map((item, index) => (
            <FlexImgWrapper
              key={item.id}
              style={{ borderRadius: 10, overflow: 'hidden' }}
              onPress={() => scrollToSlide(index)}
            >
              <Image source={item.image} style={{ height: '100%', aspectRatio: 1 }} />
            </FlexImgWrapper>
          ))}
        </BubbleHFlex>

        <ScrollView
          ref={scrollViewRef} // Attach the ref to ScrollView
          horizontal
          pagingEnabled
          contentInset={{ left: 20, right: 20 }}
          snapToInterval={TOTAL_SLIDE_WIDTH} // Include slide width and margins
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginRight: PADDING_HORIZONTAL,
          }}
        >
          {items.map((item) => (
              <Slide key={item.id}>
                  <View style={{ width: '90%', aspectRatio: 1, marginBottom: 30 }}>
                      <Image
                          source={item.image}
                          style={{ width: '100%', height: '100%', borderRadius: 10 }}
                      />
                  </View>
                  <HorizontalFlex>
                      <View>
                          <SlideTitle>{item.title}</SlideTitle>
                          <SlideDescription>{item.description}</SlideDescription>
                      </View>
                          <TouchableOpacity style={{  paddingHorizontal: 20, height: 50, marginLeft: 20, backgroundColor: colors.brown, borderRadius: 10, justifyContent: 'center' }}>
                              <Text style={{ color: '#f0f0f0ed', fontWeight: 'bold', fontSize: 20 }}>Rate</Text>
                          </TouchableOpacity>
                  </HorizontalFlex>
              </Slide>
          ))}
        </ScrollView>
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

// Styled Components
const BubbleHFlex = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  margin-bottom: 10px;
  gap: 10px;
      background-color: #b8b8b811;
    border-radius: 15px;
    padding: 10px;
    border: 1px #0f0f0f14;
`;

const FlexImgWrapper = styled.TouchableOpacity`
  flex: 1;
  aspect-ratio: 1;
`;

const PlaceholderIcon = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #00000050;
`;

const Slide = styled.View`
  width: ${SLIDE_WIDTH}px;
  height: 500px;
  justify-content: center;
  align-items: center;
  margin: ${SLIDE_MARGIN}px;
  /* background-color: #f9f9f9; */
`;

const SlideTitle = styled.Text`
  font-size: 23px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const SlideDescription = styled.Text`
  font-size: 18px;
  color: #666;
  text-align: center;
`;

const HorizontalFlex = styled.View`
  width: 90%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  padding-top: 0px;
`;