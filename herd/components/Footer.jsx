import styled from 'styled-components/native';

export const FooterContainer = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: #f0f0f0;
    border-top-width: 1px;
    border-top-color: #e0e0e0;
    padding-bottom: 40px;
    padding-top: 20px;
`;

export const FooterButton = styled.TouchableOpacity`
    flex: 1;
    align-items: center;
`;
