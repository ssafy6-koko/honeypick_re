import styled from 'styled-components';

// const Text = `

// `;

export const FlexRow = `
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const FlexColumn = `
  display: flex;
  flex-direction: column;
`;

export const BigText = styled.p`
  font-size: ${(props) => props.theme.fonts.size.large};
`;

export const MediumText = styled.p`
  font-size: ${(props) => props.theme.fonts.size.medium};
`;

export const SmallText = styled.small`
  font-size: ${(props) => props.theme.fonts.size.small};
`;

export const Img = styled.img`
  width: 100%;
`;
