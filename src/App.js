import React from 'react'
import styled from 'styled-components'
import io from 'socket.io-client'

import Card from './components/Card'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
`

const CardsContainer = styled.div`
  padding-left: 50px;
`

const INITIAL_STATE = {
  side: null,
  roomId: null,
  meta: null,
  chosenCards: [],
}

class App extends React.Component {
  state = {
    isConnected: false,
    ...INITIAL_STATE,
  }

  componentDidMount() {
    this.socket = io.connect('https://big2-server-mwjpnruize.now.sh')
    this.socket.on('connect', this.init)
  }

  init = () => {
    this.setState({ isConnected: true })
    this.socket.on('player_joined', playerId => {
      console.log(`${playerId} has joined the room`)
    })
    this.socket.on('player_left', playerId => {
      console.log(`${playerId} has left the room`)
      this.leaveRoom()
    })
    this.socket.on('game_start', meta => {
      this.setState({ meta })
    })
    this.socket.on('game_update', meta => {
      this.setState({ meta })
    })
    this.socket.on('game_error', message => {
      alert(message)
    })
    this.socket.on('game_finish', info => {
      alert(`player ${info.playerId} (side ${info.side}) has won the game!`)
      this.leaveRoom()
      this.resetGameState()
    })
  }

  resetGameState = () => {
    this.setState({
      ...INITIAL_STATE,
    })
  }

  chooseSide = side => {
    this.socket.emit('choose_side', side, roomId => {
      this.setState({ side, roomId })
    })
  }

  chooseCard = card => {
    const isMyTurn = this.state.side === this.state.meta.turn
    if (!isMyTurn) return

    const isBelongToPlayer = this.state.meta.cards[this.state.side].includes(card)
    if (!isBelongToPlayer) return

    const chosen = this.state.chosenCards.includes(card)
    this.setState({
      chosenCards: chosen
        ? this.state.chosenCards.filter(_card => _card !== card)
        : this.state.chosenCards.concat(card),
    })
  }

  playChosenCards = () => {
    if (!this.state.chosenCards.length) {
      alert('please choose cards to play!')
      return
    }

    this.socket.emit('play_cards', this.state.chosenCards, () => {
      this.setState({ chosenCards: [] })
    })
  }

  resetChosenCards = () => {
    this.setState({ chosenCards: [] })
  }

  playPass = () => {
    this.socket.emit('play_cards', [], () => {
      this.setState({ chosenCards: [] })
    })
  }

  leaveRoom = () => {
    this.socket.emit('leave_room', () => {
      this.resetGameState()
    })
  }

  render() {
    const { isConnected, side, roomId, meta, chosenCards } = this.state
    return (
      <Container>
        {isConnected ? 'Connected' : 'Connecting...'}
        {side ? (
          <div>
            {roomId && (
              <div>
                you are in room: <strong>{roomId}</strong>
                <button onClick={this.leaveRoom}>leave room</button>
              </div>
            )}
            you are side: <strong>{side}</strong>
            {meta && (
              <div>
                who's turn: <strong>{meta.turn}</strong>
                {side === meta.turn && <strong>(it is your turn!)</strong>}
                {meta.turnCount > 0 && (
                  <div>
                    <div>
                      <p>
                        <strong>last played</strong>
                      </p>
                      {!!meta.lastPlayedCards.length ? (
                        <CardsContainer>
                          {meta.lastPlayedCards.map((card, index) => (
                            <Card key={`${card.number}-${card.suit}`} card={card} index={index} />
                          ))}
                        </CardsContainer>
                      ) : (
                        <span>pass!</span>
                      )}
                    </div>
                  </div>
                )}
                {Object.keys(meta.cards).map(key => {
                  const cardList = meta.cards[key]
                  const myCards = key === side
                  return (
                    <div key={key}>
                      <p>
                        <strong>{key}</strong>
                        {myCards && <strong>(my cards)</strong>}
                      </p>
                      <CardsContainer>
                        {cardList.map((card, index) => (
                          <Card
                            key={`${card.number}-${card.suit}`}
                            card={card}
                            onClick={this.chooseCard}
                            isChosen={chosenCards.includes(card)}
                            index={index}
                          />
                        ))}
                      </CardsContainer>
                    </div>
                  )
                })}
                {side === meta.turn && <button onClick={this.playPass}>pass</button>}
                {!!chosenCards.length && (
                  <React.Fragment>
                    <button onClick={this.playChosenCards}>play</button>
                    <button onClick={this.resetChosenCards}>reset</button>
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            choose A or B
            <button onClick={() => this.chooseSide('A')}>A</button>
            <button onClick={() => this.chooseSide('B')}>B</button>
          </div>
        )}
      </Container>
    )
  }
}

export default App
