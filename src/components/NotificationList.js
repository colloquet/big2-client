import React from 'react'
import ReactDOM from 'react-dom'
import { Transition } from 'react-spring/renderprops'
import styled from 'styled-components'

import withNotification from './withNotification'

const List = styled.ul`
  position: fixed;
  list-style: none;
  padding: 0;
  margin: 1rem;
  top: 0;
  right: 0;
`

const Item = styled.li`
  border-radius: 4px;
  background: #222;
  padding: 0.8rem 1rem;
  color: #fff;

  & + & {
    margin-top: 0.5rem;
  }
`

function NotificationList({ notificationList, removeNotification }) {
  return ReactDOM.createPortal(
    <List>
      <Transition
        items={notificationList}
        keys={item => item.id}
        from={{ opacity: 0, x: 100 }}
        enter={{ opacity: 1, x: 0 }}
        leave={{ opacity: 0, x: 100 }}
      >
        {item => ({ opacity, x }) => (
          <Item
            style={{
              opacity,
              transform: `translate3d(${x}%, 0, 0)`,
            }}
            onClick={() => removeNotification(item.id)}
          >
            {item.text}
          </Item>
        )}
      </Transition>
    </List>,
    document.body,
  )
}

export default withNotification(NotificationList)
