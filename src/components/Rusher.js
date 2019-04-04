import React from 'react'
import { Spring } from 'react-spring/renderprops'
import styled from 'styled-components'

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  font-size: 2.5rem;
  z-index: 997;
  pointer-events: none;
`

function Rusher({ active }) {
  return (
    <Spring
      from={{ scale: 0 }}
      to={{
        scale: active ? 1 : 0,
      }}
    >
      {({ scale }) => (
        <Container
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <span role="img" aria-label="quick la">
            🖕快D啦
          </span>
        </Container>
      )}
    </Spring>
  )
}

export default Rusher
