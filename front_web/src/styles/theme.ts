import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    main500: '#F9C12E',
    main300: '#FFD669',
    black: '#000000',
    white: '#ffffff',
    gray900: '#222222',
    gray800: '#424242',
    gray700: '#616161',
    gray600: '#757575',
    gray500: '#9E9E9E',
    gray400: '#BDBDBD',
    gray300: '#E0E0E0',
    gray200: '#EEEEEE',
    gray100: '#F5F5F5',
    gray50: '#FAFAFA',
  },
  fonts: {
    size: {
      xs: '8px',
      sm: '10px',
      md: '12px',
      lg: '14px',
      xl: '16px',
    },
    weight: {
      semibold: 600,
      bold: 900,
    },
  },
};

export { theme };
