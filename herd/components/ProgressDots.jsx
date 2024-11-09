// ProgressDots.js
import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import colors from './colors';


export default function ProgressDots({ currentStep }) {
  return (
    <DotsContainer>
      <Dot active={currentStep === 1} />
      <Dot active={currentStep === 2} />
      <Dot active={currentStep === 3} />
    </DotsContainer>
  );
}

const Dot = styled.View`
  width: 10px;
  height: 10px;
  margin: 0 5px;
  border-radius: 5px;
  background-color: ${props => props.active ? colors.brown : '#e0e0e0'};
`;

const DotsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`;
