import React from 'react'
import styled from 'styled-components'

import Muted from './Muted'
import Card from './Card'

const CardsContainer = styled.div`
  display: inline-block;
  padding-left: 50px;
  margin: 1rem 0;
`

const HistoryContainer = styled.div`
  padding: 1rem;
  background: #f5f7f9;
  border-radius: 8px;
`

function GameBoard({ meta, mySide, opponentSide, chosenCards, onCardClick, renderActionBar }) {
  const myTurn = mySide === meta.turn
  const myCards = meta.cards[mySide]
  const opponentCards = meta.cards[opponentSide]
  const myName = meta.members[mySide]
  const opponentName = meta.members[opponentSide]

  return (
    <div>
      <div style={{ marginTop: '1rem' }}>
        <Muted>對手 ({opponentName})</Muted>
        <div>
          <CardsContainer>
            {opponentCards.map((card, index) => <Card key={`${card.number}-${card.suit}`} card={card} index={index} />)}
          </CardsContainer>
        </div>
      </div>

      <HistoryContainer>
        <strong>出牌記錄</strong>
        {meta.history.length ? (
          <div>
            {meta.history.map((playedCards, index) => (
              <CardsContainer key={index} style={{ marginRight: '1rem' }}>
                {!!playedCards.length ? (
                  playedCards.map((card, index) => (
                    <Card key={`${card.number}-${card.suit}`} card={card} index={index} />
                  ))
                ) : (
                  <Card isPass />
                )}
              </CardsContainer>
            ))}
          </div>
        ) : (
          <Muted> - 暫無歷史</Muted>
        )}
      </HistoryContainer>

      {myTurn && <h1>到你啦！</h1>}

      <div style={{ marginTop: '1rem' }}>
        <Muted>自己 ({myName})</Muted>
        <div>
          <CardsContainer>
            {myCards.map((card, index) => (
              <Card
                key={`${card.number}-${card.suit}`}
                card={card}
                onClick={onCardClick}
                isChosen={chosenCards.includes(card)}
                index={index}
              />
            ))}
          </CardsContainer>
        </div>
        {renderActionBar()}
      </div>
    </div>
  )
}

export default GameBoard
