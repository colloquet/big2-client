import React from 'react'
import styled from 'styled-components'

import Button from './Button'
import Muted from './Muted'

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const Separator = Muted.extend`
  margin: 0.5rem 0;
`

function SidePicker({ onPick }) {
  return (
    <Container>
      <span>請選擇位置</span>
      <Button onClick={() => onPick('A')}>A</Button>
      <Button onClick={() => onPick('B')}>B</Button>
      {/* <Separator small>或</Separator>
      <Button onClick={() => onPick('BOT')}>Play with Bot</Button> */}
    </Container>
  )
}

export default SidePicker
