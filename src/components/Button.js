import styled from 'styled-components'

const Button = styled.button`
  flex-shrink: 0;
  height: ${props => (props.small ? '2rem' : '3rem')};
  min-width: ${props => (props.small ? '4rem' : '10rem')};
  background: #f5f7f9;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 3px 0 0 #ccd1d7;
  padding: 0 0.5rem;
  margin: 0.5rem;
  cursor: pointer;
  outline: 0;
  font-size: 1rem;

  &:active {
    box-shadow: 0 1px 0 0 #ccd1d7;
    transform: translateY(2px);
  }

  &:disabled {
    opacity: 0.6;
  }
`

export default Button
