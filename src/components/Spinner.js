import styled, { keyframes } from 'styled-components'
import spinner from '../assets/images/spinner.png'

const spin = keyframes`
  0% { transform: rotate(0); }
  to { transform: rotate(360deg); }
`

const Spinner = styled.div`
  display: inline-block;
  animation: ${spin} 1.2s steps(12) infinite;
  background-image: url('${spinner}');
  background-size: cover;
  height: 1.5rem;
  width: 1.5rem;
`

export default Spinner
