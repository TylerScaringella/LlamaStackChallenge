import styled from 'styled-components/native';

export const HeaderContainer = styled.View`
    display: flex;
    flex-direction: row;
    height: 50px;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    margin: 0 20px;
    margin-top: 50px;
`;

export const NavbarLeft = styled.View`
    position: absolute;
    left: 0;
    transform: translateX(-15px);
`;

export const NavbarRight = styled.View`
    position: absolute;
    right: 0;
`;
