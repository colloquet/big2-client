import React from 'react'
import styled from 'styled-components'

import Button from './Button'
import Muted from './Muted'

import mode1 from '../assets/images/mode-1.jpg'
import mode1Thumbnail from '../assets/images/mode-1-thumbnail.jpg'
import mode2 from '../assets/images/mode-2.jpg'
import mode2Thumbnail from '../assets/images/mode-2-thumbnail.jpg'

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

const Image = styled.img`
  display: block;
  border-radius: 6px;
  max-width: 200px;
`

function ModePicker({ onPick, stats }) {
  return (
    <Container>
      <p>請選擇模式</p>

      <Button onClick={() => onPick(1)} style={{ padding: '0.5rem' }}>
        <Image src={mode1Thumbnail} alt="Mode 1" />
      </Button>
      <a href={mode1} target="_blank">
        <Muted>原圖</Muted>
      </a>

      <Button onClick={() => onPick(2)} style={{ marginTop: '2rem', padding: '0.5rem' }}>
        <Image src={mode2Thumbnail} alt="Mode 2" />
      </Button>
      <a href={mode2} target="_blank">
        <Muted>原圖</Muted>
      </a>
    </Container>
  )
}

export default ModePicker
