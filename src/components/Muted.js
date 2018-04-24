import styled from 'styled-components'

const Muted = styled.span`
  color: #999;
  font-size: ${props => (props.small ? '0.8rem' : '1rem')};
`

export default Muted
