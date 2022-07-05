import { ReactNode } from 'react';

import Routes from './pages/Routes';

function App() {
  return (
    <div className="App">
      <Layout>
        <Routes />
      </Layout>
    </div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export default App;
