import React from 'react'
import Confetti from 'react-confetti'
import styled from 'styled-components'
import io from 'socket.io-client'
import { Spring } from 'react-spring'

import Spinner from './components/Spinner'
import LoadingOverlay from './components/LoadingOverlay'
import SidePicker from './components/SidePicker'
import NamePicker from './components/NamePicker'
import Card from './components/Card'
import Button from './components/Button'
import Muted from './components/Muted'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1rem 3rem;
`

const CardsContainer = styled.div`
  display: inline-block;
  padding-left: 50px;
  margin: 1rem 0;
`

const Modal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: rgba(255, 255, 255, 0.7);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
`

const INITIAL_STATE = {
  side: null,
  roomId: null,
  meta: null,
  chosenCards: [],
  pastTime: 0,
  won: false,
  gameFinished: false,
  rush: false,
}

const TIMEOUT = 30000

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

class App extends React.Component {
  state = {
    isConnected: false,
    ...INITIAL_STATE,
  }

  componentDidMount() {
    this.socket = io.connect('http://192.168.1.203:9000')
    this.socket.on('connect', this.init)
  }

  init = () => {
    this.setState({ isConnected: true })
    this.socket.on('player_joined', playerId => {
      console.log(`${playerId} has joined the room`)
    })
    this.socket.on('player_left', playerId => {
      alert('對方已離開房間')
      this.leaveRoom()
    })
    this.socket.on('game_start', meta => {
      this.setState({ meta })
      if (meta.turn === this.state.side) {
        this.startTimeout()
      }
    })
    this.socket.on('game_update', meta => {
      this.setState({ meta })
      if (meta.turn === this.state.side) {
        this.startTimeout()
      }
    })
    this.socket.on('game_error', message => {
      alert(message)
    })
    this.socket.on('game_finish', winner => {
      const won = this.state.side === winner.side
      this.setState({ won, gameFinished: true })
      clearTimeout(this.timeout)
      clearInterval(this.countdown)
    })
    this.socket.on('rush_player', () => {
      clearTimeout(this.rushTimeout)
      this.setState({ rush: false }, () => {
        this.setState({ rush: true })
        this.rushTimeout = setTimeout(() => {
          this.setState({ rush: false })
        }, 1000)
      })
    })
  }

  startTimeout = () => {
    this.timeout = setTimeout(() => {
      const isPrevPass = !this.state.meta.lastPlayedCards.length
      if (isPrevPass) {
        this.playRandomCard()
      } else {
        this.playPass()
      }
    }, TIMEOUT)
    this.countdown = setInterval(() => {
      this.setState({ pastTime: this.state.pastTime + 1000 })
    }, 1000)
  }

  resetGameState = () => {
    this.setState({
      ...INITIAL_STATE,
    })
    clearTimeout(this.timeout)
    clearInterval(this.countdown)
  }

  startLookingForRoom = () => {
    const { side, name } = this.state
    this.socket.emit('choose_side', { side, name }, roomId => {
      this.setState({ roomId })
    })
  }

  pickSide = side => {
    const playerSide = side === 'BOT' ? 'A' : side
    this.setState({ side: playerSide })
  }

  pickName = name => {
    this.setState({ name }, this.startLookingForRoom)
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
      this.setState({ chosenCards: [], pastTime: 0 })
      clearTimeout(this.timeout)
      clearInterval(this.countdown)
    })
  }

  playRandomCard = () => {
    this.setState({ chosenCards: [] })
    const randomCard = getRandomFromArray(this.state.meta.cards[this.state.side])
    this.chooseCard(randomCard)
    this.playChosenCards()
  }

  resetChosenCards = () => {
    this.setState({ chosenCards: [] })
  }

  playPass = () => {
    this.socket.emit('play_cards', [], () => {
      this.setState({ chosenCards: [], pastTime: 0 })
      clearTimeout(this.timeout)
      clearInterval(this.countdown)
    })
  }

  rushPlayer = () => {
    this.socket.emit('rush_player')
  }

  leaveRoom = () => {
    this.socket.emit('leave_room', () => {
      this.resetGameState()
    })
  }

  onLeaveRoomClick = () => {
    if (window.confirm('確定要離開房間？')) {
      this.leaveRoom()
    }
  }

  renderActionBar = () => {
    const { meta, side, chosenCards, pastTime } = this.state
    return (
      <div>
        {meta.turn === side ? (
          <React.Fragment>
            <Button small onClick={this.playPass} disabled={!meta.lastPlayedCards.length}>
              Pass
            </Button>
            <Button small onClick={this.playChosenCards} disabled={!chosenCards.length}>
              出牌
            </Button>
            <Button small onClick={this.resetChosenCards} disabled={!chosenCards.length}>
              重置
            </Button>
            <Muted small>剩餘時間：{(TIMEOUT - pastTime) / 1000}</Muted>
          </React.Fragment>
        ) : (
          <Button small onClick={this.rushPlayer}>
            快D啦
          </Button>
        )}
      </div>
    )
  }

  render() {
    const { isConnected, side, roomId, meta, chosenCards, won, gameFinished, rush } = this.state
    const opponentSide = side === 'A' ? 'B' : 'A'
    return (
      <Container>
        {isConnected || <LoadingOverlay text="連線到伺服器中…" />}

        <Spring
          from={{ scale: 0 }}
          to={{
            scale: rush ? 1 : 0,
          }}
        >
          {({ scale }) => (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                fontSize: '3rem',
                zIndex: 997,
              }}
            >
              <span role="img" aria-label="quick la">
                🖕快D啦
              </span>
            </div>
          )}
        </Spring>

        {won && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 998 }}>
            <Confetti width={window.innerWidth} height={window.innerHeight} />
          </div>
        )}

        {gameFinished && (
          <Modal>
            <div style={{ textAlign: 'center' }}>
              <h1>{won ? 'You win!' : 'You lose!'}</h1>
              <Button onClick={this.leaveRoom}>離開房間</Button>
            </div>
          </Modal>
        )}

        {side && roomId ? (
          <div>
            {roomId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Muted small>房間ID: {roomId}</Muted>
                <Button small onClick={this.onLeaveRoomClick}>
                  離開房間
                </Button>
              </div>
            )}
            {meta ? (
              <div>
                <div style={{ marginTop: '1rem' }}>
                  <Muted>對手 ({meta.members[opponentSide]})</Muted>
                  <div>
                    <CardsContainer>
                      {meta.cards[opponentSide].map((card, index) => (
                        <Card key={`${card.number}-${card.suit}`} card={card} index={index} />
                      ))}
                    </CardsContainer>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#f5f7f9', borderRadius: '8px' }}>
                  <strong>出牌記錄</strong>
                  {meta.history.length ? (
                    <div>
                      {meta.history.map((playedCards, index) => (
                        <CardsContainer key={index} style={{ marginRight: '1rem' }}>
                          {!!playedCards.length
                            ? playedCards.map((card, index) => (
                                <Card key={`${card.number}-${card.suit}`} card={card} index={index} />
                              ))
                            : !!meta.turnCount && <Card key="pass" isPass />}
                        </CardsContainer>
                      ))}
                    </div>
                  ) : (
                    <Muted> - 暫無歷史</Muted>
                  )}
                </div>

                {side === meta.turn && <h1>到你啦！</h1>}

                <div style={{ marginTop: '1rem' }}>
                  <Muted>自己 ({meta.members[side]})</Muted>
                  <div>
                    <CardsContainer>
                      {meta.cards[side].map((card, index) => (
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
                  {this.renderActionBar()}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  minHeight: '200px',
                }}
              >
                <Spinner style={{ marginBottom: '1rem' }} />
                等待對手中...
              </div>
            )}
          </div>
        ) : (
          <React.Fragment>
            {side ? (
              <NamePicker onPick={this.pickName} onBack={() => this.setState({ side: null })} />
            ) : (
              <SidePicker onPick={this.pickSide} />
            )}
          </React.Fragment>
        )}
      </Container>
    )
  }
}

export default App
