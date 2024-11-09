import styled from 'styled-components/native';
import colors from './colors';

export const Container = styled.View`
    flex: 1;
    padding: 0 20px;
    background-color: #f0f0f0;
`;

export const LargeText = styled.Text`
    font-size: 30px;
    padding: 10px 0;
    font-family: 'Merriweather';
`;

export const Row = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 15px 0;
    border-bottom-width: 1px;
    border-bottom-color: #e0e0e0;
`;

export const RowLeftTextContainer = styled.View`
    flex: 1;
`;

export const RowTitle = styled.Text`
    font-family: 'Merriweather';
    font-size: 16px;
    color: ${colors.brown};
`;

export const RowSubTitle = styled.Text`
    font-family: 'Lato';
    font-size: 14px;
    color: #838383;
`;

export const SectionHeader = styled.Text`
    font-size: 50px;
    padding: 10px 0;
    font-family: 'Italiana';
`;

export const HeaderContainer = styled.View`
  display: flex;
  flex-direction: row;
  height: 50px;
  justify-content: center;
  position: relative;
  align-items: center;
`;

export const BackButtonDiv = styled.View`
  position: absolute;
  left: 0;
  transform: translateX(-15px);
`;

export const ContainerTopPadding = styled.View`
  margin-top: 80px;
  padding: 0 30px;
`;

export const Title = styled.Text`
  font-family: 'Merriweather';
  font-size: 40px;
  color: ${colors.brown};
  padding-top: 50px;
  padding-bottom: 40px;
`;

export const InputContainer = styled.View`
  padding-top: 4px;
  padding-bottom: 4px;
  align-self: stretch;
`;

export const ButtonContainer = styled.View`
  overflow: hidden;
  display: flex;
  align-items: center;
  padding-top: 40px;
`;

export const GraySubText = styled.Text`
  font-family: 'Lato';
  font-size: 20px;
  color: gray;
  margin-top: -15px;
  margin-bottom: 40px;
`;

export const LatoTitle = styled.Text`
    font-family: 'Lato';
    font-size: 25px;
    color: ${colors.brown};
    padding-top: 25px;
    font-weight: 500;
    padding-bottom: 10px;
`;

export const SuggestionTile = styled.View`
  width: 120px;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid ${colors.brown};
  border-radius: 15px;
  align-items: center;
`;


export const followButtonStyle = {
  backgroundColor: colors.brown,
  borderRadius: 20,
  paddingHorizontal: 20,
  borderWidth: 1,
  borderColor: '#f0f0f0', // Changed border color to black
};

export const followedButtonStyle = {
  backgroundColor: '#f5e0d7', // Light brown background
  borderColor: colors.brown,
  borderWidth: 1,
  borderRadius: 20,
  paddingHorizontal: 20,
};

export const followedTitleStyle = {
  color: colors.brown,
  fontSize: 14,
};

export const LargeImageWrapper = styled.View`
    width: 100%;
    aspect-ratio: 1;
    background-color: #8d3939;
    border-radius: 10px;
    overflow: hidden;
`

export const WideImage = styled.Image`
  width: 100%;
  height: 100%;
  /* height: auto; */
`;