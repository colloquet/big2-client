import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import Spinner from './Spinner';

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const LoadingText = styled.span`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
`;

function LoadingOverlay({ text, ...props }) {
  return ReactDOM.createPortal(
    <Container {...props}>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </Container>,
    document.body,
  );
}

LoadingOverlay.defaultProps = {
  text: 'Loading',
};

export default LoadingOverlay;
