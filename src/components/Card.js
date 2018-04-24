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
  color: ${props => getColor(props.suit)};
  cursor: ${props => props.onClick ? 'pointer' : 'auto'};
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

const Pass = styled.strong`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

function getCardNumber(number) {
  return {
    1: 'A',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
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
  return suit % 2 === 0 ? 'inherit' : '#bd081c'
}

function Card({ card, onClick, isChosen, index, isPass }) {
  const chosenStyle = isChosen ? { transform: 'translateY(-1rem)' } : {}
  return (
    <Container
      suit={card.suit}
      onClick={onClick ? () => onClick(card) : null}
      style={{
        zIndex: index,
        ...chosenStyle,
      }}
    >
      {isPass ? (
        <Pass>PASS</Pass>
      ) : (
        <Meta>
          <span>{getCardNumber(card.number)}</span>
          <Suit>{getCardSuit(card.suit)}</Suit>
        </Meta>
      )}
    </Container>
  )
}

Card.defaultProps = {
  card: {
    suit: 0,
  },
  index: 1,
  isChosen: false,
  isPass: false,
}

export default Card
