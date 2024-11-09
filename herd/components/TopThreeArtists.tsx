// TopThreeArtists.js
import React, { useState } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import { Input, Button, ListItem } from '@rneui/themed';
import styled from 'styled-components/native';
import { HeaderContainer, GraySubText, BackButtonDiv, Container, Title, ButtonContainer } from './StyledComponents';
import colors from './colors';

const artists = ["Adele", "Beyoncé", "Drake", "Eminem", "Kanye West", "Lady Gaga", "Michael Jackson", "Taylor Swift"]; // Replace with a more extensive list as needed

export default function TopThreeArtists({ navigation }) {
  const [artist1, setArtist1] = useState('');
  const [artist2, setArtist2] = useState('');
  const [artist3, setArtist3] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // Track which input is active

  const handleChange = (text, setArtist, inputIndex) => {
    setArtist(text);
    setActiveInput(inputIndex);
    setSuggestions(artists.filter((artist) => artist.toLowerCase().includes(text.toLowerCase())));
  };

  const handleSuggestionSelect = (artist, setArtist) => {
    setArtist(artist);
    setSuggestions([]);
    setActiveInput(null); // Clear active input after selection
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

      <Title>Top 3</Title>
      <GraySubText>Who are your all-time top artists?</GraySubText>

      {[{label: '1', value: artist1, setter: setArtist1},
        {label: '2', value: artist2, setter: setArtist2},
        {label: '3', value: artist3, setter: setArtist3}].map((item, index) => (
        <View key={index}>
          <Input
            placeholder={`Artist ${item.label}`}
            value={item.value}
            onChangeText={(text) => handleChange(text, item.setter, index)}
            onFocus={() => setActiveInput(index)} // Set active input on focus
            onBlur={() => setActiveInput(null)}  // Clear active input on blur
          />
          {suggestions.length > 0 && activeInput === index && (
            <SuggestionsContainer>
              {suggestions.map((artist, i) => (
                <ListItem key={i} onPress={() => handleSuggestionSelect(artist, item.setter)}>
                  <ListItem.Content>
                    <ListItem.Title>{artist}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))}
            </SuggestionsContainer>
          )}
        </View>
      ))}

      <ButtonContainer>
        <Button
          title="Next"
          buttonStyle={{ backgroundColor: colors.brown, height: 40, width: 200, borderRadius: 100 }}
          onPress={() => 
            // Alert.alert(`Your Top 3 Artists:\n1. ${artist1}\n2. ${artist2}\n3. ${artist3}`)
            navigation.navigate('Friends')
          }
        />
      </ButtonContainer>
    </Container>
  );
}


const SuggestionsContainer = styled.View`
  background-color: #f0f0f0;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
`;
