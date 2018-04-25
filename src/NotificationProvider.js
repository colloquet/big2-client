import React from 'react'

import NotificationList from './components/NotificationList'

let notificationId = 0

class NotificationProvider extends React.Component {
  state = {
    list: [],
  }

  addNotification = item => {
    this.setState({
      list: [item, ...this.state.list],
    })
  }

  removeNotification = id => {
    this.setState({
      list: this.state.list.filter(item => item.id !== id),
    })
  }

  displayNotification = payload => {
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

  render() {
    const { list } = this.state
    const { children } = this.props

    return (
      <React.Fragment>
        <NotificationList list={list} onDismiss={this.removeNotification} />
        {React.cloneElement(children, {
          displayNotification: this.displayNotification,
        })}
      </React.Fragment>
    )
  }
}

export default NotificationProvider
