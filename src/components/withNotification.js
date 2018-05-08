import React from 'react'

import { NotificationConsumer } from './NotificationContext'

function withNotification(Component) {
  return function ThemedComponent(props) {
    return (
      <NotificationConsumer>
        {context => (
          <Component
            {...props}
            notificationList={context.state.list}
            displayNotification={context.displayNotification}
            removeNotification={context.removeNotification}
          />
        )}
      </NotificationConsumer>
    )
  }
}

export default withNotification
