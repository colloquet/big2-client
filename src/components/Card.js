import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: inline-block;
  position: relative;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  width: 80px;
  height: 120px;
  margin-left: -50px;
  margin-bottom: 1rem;
  color: ${props => getColor(props.suit)};
  cursor: pointer;
`

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
`

const Suit = styled.span`
  font-size: 0.8rem;
`

function getCardNumber(number) {
  if (number <= 10) {
    return number
  }

  return {
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
    15: '2',
  }[number]
}

function getCardSuit(suit) {
  return {
    1: '♦',
    2: '♣',
    3: '♥',
    4: '♠',
  }[suit]
}

function getColor(suit) {
  return suit % 2 === 0 ? 'inherit' : 'red'
}

function Card({ card, onClick, isChosen, index }) {
  const chosenStyle = isChosen ? { transform: 'translateY(-1rem)' } : {}
  return (
    <Container
      suit={card.suit}
      onClick={() => onClick(card)}
      style={{
        zIndex: index,
        ...chosenStyle,
      }}
    >
      <Meta>
        <span>{getCardNumber(card.number)}</span>
        <Suit>{getCardSuit(card.suit)}</Suit>
      </Meta>
    </Container>
  )
}

export default Card
