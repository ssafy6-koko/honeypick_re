import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      main: string;
      secondary: string;
      text: {
        main: string;
        secondary: string;
      }
    };
    fonts: {
      small: string;
      medium: string;
      large: string;
      semibold: number;
      bold: number;
    };
  }
}