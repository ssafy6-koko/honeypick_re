import { ReactNode } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import Routes from './pages/Routes';
import { FlexColumn } from './styles/global-styles';
import { theme } from './styles/theme';

const Container = styled.div`
  ${FlexColumn}
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

function App(): JSX.Element {
  return (
    <Layout>
      <Routes />
    </Layout>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Container>{children}</Container>
    </ThemeProvider>
  );
}
export default App;
