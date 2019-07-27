import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  background: #fff;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: scroll;
  z-index: 997;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - (1rem * 2));
  margin: 1rem auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Modal({ children }) {
  return (
    <Container>
      <Inner>
        <Content>{children}</Content>
      </Inner>
    </Container>
  );
}

export default Modal;
