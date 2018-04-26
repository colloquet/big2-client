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

function SidePicker({ onPick, stats }) {
  return (
    <Container>
      <span>請選擇位置</span>
      <Button onClick={() => onPick('A')}>
        A
        {stats.A && (
          <Muted small>
            <br />
            {` (勝率：${stats.A}％)`}
          </Muted>
        )}
      </Button>
      <Button onClick={() => onPick('B')}>
        B
        {stats.B && (
          <Muted small>
            <br />
            {` (勝率：${stats.B}％)`}
          </Muted>
        )}
      </Button>
    </Container>
  )
}

export default SidePicker
