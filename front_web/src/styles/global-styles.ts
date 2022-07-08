import styled from 'styled-components';

// 컨테이너 (container)
export const FlexRow = `
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const FlexColumn = `
  display: flex;
  flex-direction: column;
`;

// 텍스트 (text)
export const TextXs = styled.small`
  font-size: ${(props) => props.theme.fonts.size.xs};
`;

export const TextSm = styled.p`
  font-size: ${(props) => props.theme.fonts.size.sm};
`;

export const TextMd = styled.p`
  font-size: ${(props) => props.theme.fonts.size.md};
`;

export const TextLg = styled.p`
  font-size: ${(props) => props.theme.fonts.size.lg};
`;

export const TextXl = styled.p`
  font-size: ${(props) => props.theme.fonts.size.xl};
`;

// 이미지 (image)
export const Img = styled.img`
  width: 100%;
`;

// 입력창 (input)
const commonInput = `
  border: unset;
  background: transparent;
`;

export const BaseInput = styled.input`
  ${commonInput}
  border-bottom: 1.5px ${({ theme }) => theme.colors.main500} solid;

  &:focus-visible {
    outline: unset;
  }
`;

// 버튼 (button)
const commonButton = `
  width: 100%;
  padding: 10px;
  text-align: center;
  border: unset;
  border-radius: 7px;
`;

export const BaseButton = styled.button`
  ${commonButton}
  background-color: ${({ theme }) => theme.colors.main500};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};

  &:active {
    background-color: ${({ theme }) => theme.colors.main300};
  }
`;
