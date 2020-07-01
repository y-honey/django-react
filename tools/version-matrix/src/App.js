import React from 'react';
import Versions from './Versions';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0; 
    padding: 0;
    font-family: 'Roboto Condensed', sans-serif;
  }

  a:link, a:visited {
    color: #000;
  }
`;

const Container = styled.div`
  margin: 10px auto;
  max-width: 900px;
`;

function App() {
  return (
    <div className="App">
      <GlobalStyles />

      <Container>
        <Versions />
      </Container>
    </div>
  );
}

export default App;
