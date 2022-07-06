import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      main500: string;
      main300: string;
      black: string;
      white: string;
      gray900: string;
      gray800: string;
      gray700: string;
      gray600: string;
      gray500: string;
      gray400: string;
      gray300: string;
      gray200: string;
      gray100: string;
      gray50: string;
    };
    fonts: {
      size: {
        px10: string;
        px12: string;
        px14: string;
        px16: string;
      };
      weight: {
        semibold: number;
        bold: number;
      };
    };
  }
}
