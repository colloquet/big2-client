import React from 'react'
import Confetti from 'react-confetti'
import styled from 'styled-components'
import io from 'socket.io-client'

import Spinner from './components/Spinner'
import LoadingOverlay from './components/LoadingOverlay'
import SidePicker from './components/SidePicker'
import NamePicker from './components/NamePicker'
import Button from './components/Button'
import Muted from './components/Muted'
import Rusher from './components/Rusher'
import GameBoard from './components/GameBoard'
import github from './assets/images/github.svg'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1rem 5rem;
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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const Info = Muted.extend`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.6rem;
  margin-right: 0.5rem;
`

const LoadingBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 200px;
`

const IconLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f5f7f9;
  box-shadow: 0 3px 0 0 #ccd1d7;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  margin-right: 0.5rem;

  > img {
    width: 18px;
    height: 18px;
  }
`

const ActionBar = styled.div`
  @media (max-width: 480px) {
    position: fixed;
    box-shadow: 0 -2px 6px 0 rgba(0, 0, 0, 0.05);
    background: #fff;
    bottom: 0;
    left: 0;
    padding: 0.5rem;
    width: 100%;
    z-index: 996;
  }
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
    this.socket.on('connect', () => {
      if (!this.initialized) {
        this.init()
      }
    })
  }

  init = () => {
    this.setState({ isConnected: true })

    this.socket
      .on('disconnect', () => {
        this.props.displayNotification('線已斷')
        this.resetGameState()
      })
      .on('reconnect', () => {
        this.props.displayNotification('已重新連線')
      })
      .on('client_count', clientCount => {
        this.setState({ clientCount })
      })
      .on('player_joined', playerId => {
        console.log(`${playerId} has joined the room`)
      })
      .on('player_left', () => {
        this.props.displayNotification('對方已離開房間')
        this.leaveRoom()
      })
      .on('game_start', meta => {
        this.setState({ meta })
      })
      .on('game_update', meta => {
        this.setState({ meta })
      })
      .on('game_error', message => {
        this.props.displayNotification(message)
      })
      .on('game_finish', winner => {
        const won = this.state.side === winner.side
        this.setState({ won, gameFinished: true })
      })
      .on('rush_player', () => {
        clearTimeout(this.rushTimeout)
        this.setState({ rush: false }, () => {
          this.setState({ rush: true })
          this.rushTimeout = setTimeout(() => {
            this.setState({ rush: false })
          }, 1000)
        })
      })
    this.initialized = true
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
      <ActionBar>
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
      </ActionBar>
    )
  }

  render() {
    const { isConnected, side, roomId, meta, chosenCards, won, gameFinished, rush, clientCount } = this.state
    const opponentSide = side === 'A' ? 'B' : 'A'

    return (
      <Container>
        {isConnected || <LoadingOverlay text="連線到伺服器中" />}

        <Rusher active={rush} />

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
              <Header>
                <Info small>
                  房間ID：{roomId}
                  <br />
                  在線玩家：{clientCount}
                </Info>
                <IconLink href="https://github.com/colloquet/big2-client" target="_blank" rel="noopener noreferrer">
                  <img style={{ display: 'block' }} src={github} alt="GitHub" />
                </IconLink>
                <Button small style={{ margin: 0 }} onClick={this.onLeaveRoomClick}>
                  離開房間
                </Button>
              </Header>
            )}
            {meta ? (
              <GameBoard
                meta={meta}
                mySide={side}
                opponentSide={opponentSide}
                chosenCards={chosenCards}
                onCardClick={this.chooseCard}
                renderActionBar={this.renderActionBar}
              />
            ) : (
              <LoadingBlock>
                <Spinner style={{ marginBottom: '1rem' }} />
                等待對手中...
              </LoadingBlock>
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
