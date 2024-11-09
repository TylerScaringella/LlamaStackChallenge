import React, { useState, useRef } from 'react';
import { Text, Image, TouchableOpacity, Animated, PanResponder, Dimensions, Easing } from 'react-native';
import { Button, Input } from '@rneui/themed';
import styled from 'styled-components/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMusic, faHeart } from '@fortawesome/free-solid-svg-icons';
import colors from './colors';
import { HeaderContainer, NavbarLeft, NavbarRight } from './Header';

import { Container } from './Elements';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const data = [
  { id: '1', uri: require('../assets/yeAlbum.jpg') },
  { id: '2', uri: require('../assets/yeYeezus.webp') },
  { id: '3', uri: require('../assets/yeAlbum.jpg') },
];

const TinderPage = () => {
  const position = useRef(new Animated.ValueXY()).current;
  const splashPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // Swap the scale interpolation for left and right icons
  const leftIconScale = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH + 500],
    outputRange: [1, 2],
    extrapolate: 'extend',
  });

  const rightIconScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH - 500, 0],
    outputRange: [2, 1],
    extrapolate: 'extend',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.2 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start(() => {
            handleSwipe();
          });
        } else if (gestureState.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start(() => {
            handleSwipe();
          });
        } else {
          Animated.timing(position, {
            toValue: { x: 0, y: 0 },
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = () => {
    Animated.sequence([
      Animated.timing(splashPosition, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(splashPosition, {
        toValue: -SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      splashPosition.setValue(SCREEN_HEIGHT);
    });

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
      position.setValue({ x: 0, y: 0 });
    }, 500);
  };

  const handleUndo = () => {
  Animated.sequence([
    Animated.timing(splashPosition, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.delay(200),
    Animated.timing(splashPosition, {
      toValue: -SCREEN_HEIGHT,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]).start(() => {
    splashPosition.setValue(SCREEN_HEIGHT);
  });

  setTimeout(() => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length); // Decrement index with wrap-around
    position.setValue({ x: 0, y: 0 });
  }, 500);
};

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotate },
    ],
  };

  return (
    <>
      <HeaderContainer>
        <NavbarLeft>
          <TouchableOpacity style={{ paddingLeft: 10 }}>
            <FontAwesomeIcon icon={faArrowLeft} size={24} color={colors.black} />
          </TouchableOpacity>
        </NavbarLeft>
        <PlaceholderIcon />
        <NavbarRight>
          <Image source={require('../assets/favicon.png')} style={{ width: 25, height: 25 }} />
        </NavbarRight>
      </HeaderContainer>
      <Container style={{ alignItems: "center", paddingLeft: 5, paddingRight: 5, paddingTop: 30, paddingBottom: 30 }}>
        <LatoTitle>Everything I Am</LatoTitle>
        <LatoTitle style={{ fontSize: 15, paddingBottom: 15 }}>Kanye West</LatoTitle>

        <AnimatedIconContainer style={{ left: 20, transform: [{ scale: leftIconScale }] }}>
          <IconCircle>
            <FontAwesomeIcon icon={faHeart} size={30} color={'#fff'} />
          </IconCircle>
        </AnimatedIconContainer>

        <AnimatedIconContainer style={{ right: 20, transform: [{ scale: rightIconScale }] }}>
          <IconCircle>
            <FontAwesomeIcon icon={faMusic} size={30} color={'#fff'} />
          </IconCircle>
        </AnimatedIconContainer>

        {data
          .map((item, i) => {
            if (i < currentIndex) {
              return null;
            } else if (i === currentIndex) {
              return (
                <LargeCard
                  key={item.id}
                  {...panResponder.panHandlers}
                  style={animatedCardStyle}
                >
                  <ImageStyled source={item.uri} />
                </LargeCard>
              );
            } else {
              return null;
            }
          })
          .reverse()}

        <SmallCardContainer>
          <SmallCard source={require('../assets/yeLive.webp')} />
        </SmallCardContainer>



        <LatoTitle style={{ paddingTop: 35 }}>Everything I Am</LatoTitle>
        <LatoTitle style={{ fontSize: 15, paddingTop: 0 }}>Kanye West</LatoTitle>
      </Container>
      <FooterContainer style={{zIndex: 100}}>
        <TouchableOpacity onPress={handleUndo}>
          <FontAwesomeIcon icon={faUndo} size={24} color={colors.black} />
        </TouchableOpacity>

        <PlaceholderIcon />

        <TouchableOpacity onPress={() => console.log('Redo action')}>
          <FontAwesomeIcon icon={faRedo} size={24} color={colors.black} />
        </TouchableOpacity>
      </FooterContainer>
        <SplashScreen style={{ transform: [{ translateY: splashPosition }], zIndex: 1000}}>
          <FontAwesomeIcon icon={faMusic} size={50} color="#f0f0f0" />
        </SplashScreen>
    </>
  );
};

export default TinderPage;

const LatoTitle = styled.Text`
font-family: 'Lato';
font-size: 25px;
font-weight: 500;
color: ${colors.black};
`

const LargeCard = styled(Animated.View)`
  width: 100%;
  aspect-ratio: 1;
  background-color: #8d3939;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 25px;
  border-width: 2px;
  border-color: #ffffff;
`;

const ImageStyled = styled.Image`
  width: 100%;
  height: 100%;
`;

const AnimatedIconContainer = styled(Animated.View)`
  position: absolute;
  top: ${(SCREEN_HEIGHT - 360) / 2}px;
  z-index: -1;
`;

const IconCircle = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #dddddd;
  justify-content: center;
  align-items: center;
`;

const SmallCardContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  align-items: center;
  margin-top: 0;
`;

const SmallCard = styled.Image`
  width: ${SCREEN_WIDTH / 3.2}px;
  height: ${SCREEN_WIDTH / 3.2}px;
  margin-top: -${SCREEN_WIDTH / 8}px;
  aspect-ratio: 1;
  border-radius: 10px;
  border-width: 2px;
  border-color: #ffffff;
`;

const SplashScreen = styled(Animated.View)`
  position: absolute;
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  background-color: #e8e8e8;
  justify-content: center;
  align-items: center;
`;
const FooterContainer = styled.View`
  position: absolute;
  bottom: 20px;
  width: 90%;
  height: 60px;
  background-color: #d3d3d3;
  border-radius: 30px;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  align-self: center;
  padding: 10px;
`;

const PlaceholderIcon = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #00000050;
`;