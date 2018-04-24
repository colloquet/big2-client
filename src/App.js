import React from 'react'
import Confetti from 'react-confetti'
import styled from 'styled-components'
import io from 'socket.io-client'
import { Spring } from 'react-spring'

import NotificationList from './components/NotificationList'
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
  padding: 1rem 1rem 5rem;
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

const Info = Muted.extend`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.6rem;
`

const INITIAL_STATE = {
  side: null,
  roomId: null,
  meta: null,
  chosenCards: [],
  won: false,
  gameFinished: false,
  rush: false,
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

let notificationId = 0

class App extends React.Component {
  state = {
    clientCount: 0,
    isConnected: false,
    notificationList: [],
    ...INITIAL_STATE,
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      this.socket = io.connect('https://dee.ireserve.me')
    } else {
      this.socket = io.connect('http://localhost:8080')
    }
    this.socket.on('connect', this.init)
  }

  init = () => {
    console.log('init')
    this.setState({ isConnected: true })
    this.socket.on('disconnect', this.resetGameState)
    this.socket.on('client_count', clientCount => {
      this.setState({ clientCount })
    })
    this.socket.on('player_joined', playerId => {
      console.log(`${playerId} has joined the room`)
    })
    this.socket.on('player_left', () => {
      this.displayNotification('對方已離開房間')
      this.leaveRoom()
    })
    this.socket.on('game_start', meta => {
      this.setState({ meta })
    })
    this.socket.on('game_update', meta => {
      this.setState({ meta })
    })
    this.socket.on('game_error', message => {
      this.displayNotification(message)
    })
    this.socket.on('game_finish', winner => {
      const won = this.state.side === winner.side
      this.setState({ won, gameFinished: true })
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

  addNotification = (item) => {
    this.setState({
      notificationList: this.state.notificationList.concat(item),
    })
  }

  removeNotification = (id) => {
    this.setState({
      notificationList: this.state.notificationList.filter(item => item.id !== id),
    })
  }

  displayNotification = (payload) => {
    const id = (notificationId += 1)
    const isString = typeof payload === 'string'
    const text = isString ? payload : payload.text
    const duration = isString ? 5000 : payload.duration || 5000

    this.addNotification({
      id,
      text,
    })

    setTimeout(() => {
      this.removeNotification(id)
    }, duration)
  }

  resetGameState = () => {
    this.setState({
      ...INITIAL_STATE,
    })
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
      alert('請先選擇卡牌！')
      return
    }

    this.socket.emit('play_cards', this.state.chosenCards, () => {
      this.setState({ chosenCards: [] })
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
      this.setState({ chosenCards: [] })
    })
  }

  rushPlayer = () => {
    this.socket.emit('rush_player')
  }

  leaveRoom = () => {
    console.log('leave')
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
    const { meta, side, chosenCards } = this.state
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
    const { isConnected, side, roomId, meta, chosenCards, won, gameFinished, rush, clientCount, notificationList } = this.state
    const opponentSide = side === 'A' ? 'B' : 'A'
    return (
      <Container>
        {isConnected || <LoadingOverlay text="連線到伺服器中" />}

        <NotificationList notificationList={notificationList} removeNotification={this.removeNotification} />

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
                <Info small>
                  房間ID：{roomId}
                  <br />
                  在線玩家：{clientCount}
                </Info>
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
