import React, { Component } from 'react'
import io from 'socket.io-client'

const INITIAL_STATE = {
  side: null,
  roomId: null,
  meta: null,
  chosenCards: [],
}

class App extends Component {
  state = {
    isConnected: false,
    ...INITIAL_STATE,
  }

  componentDidMount() {
    this.socket = io.connect('http://localhost:9000')
    this.socket.on('connect', this.init)
  }

  init = () => {
    this.setState({ isConnected: true })
    this.socket.on('player_joined', playerId => {
      console.log(`${playerId} has joined the room`)
    })
    this.socket.on('player_left', playerId => {
      console.log(`${playerId} has left the room`)
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
      this.resetGame()
    })
  }

  resetGame = () => {
    this.setState({
      ...INITIAL_STATE,
    })
    this.leaveRoom()
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
      console.log('successfully left room')
      this.setState({ side: null, roomId: null })
    })
  }

  render() {
    const { isConnected, side, roomId, meta, chosenCards } = this.state
    return (
      <div>
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
                    <ul>
                      <li>
                        <strong>last played</strong>
                      </li>
                      {!!meta.lastPlayedCards.length ? (
                        meta.lastPlayedCards.map(card => (
                          <li key={`${card.number}-${card.suit}`}>
                            {card.number} - {card.suit}
                          </li>
                        ))
                      ) : (
                        <li>pass!</li>
                      )}
                    </ul>
                  </div>
                )}
                {Object.keys(meta.cards).map(key => {
                  const cardList = meta.cards[key]
                  const myCards = key === side
                  return (
                    <ul key={key}>
                      <li>
                        <strong>{key}</strong>
                        {myCards && <strong>(my cards)</strong>}
                      </li>
                      {cardList.map(card => (
                        <li
                          key={`${card.number}-${card.suit}`}
                          onClick={() => this.chooseCard(card)}
                          style={{ marginLeft: chosenCards.includes(card) ? '1rem' : 0 }}
                        >
                          {card.number} - {card.suit}
                        </li>
                      ))}
                    </ul>
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
      </div>
    )
  }
}

export default App
