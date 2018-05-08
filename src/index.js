import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import { NotificationProvider } from './components/NotificationContext'
import NotificationList from './components/NotificationList'
import App from './App'

ReactDOM.render(
  <NotificationProvider>
    <NotificationList />
    <App />
  </NotificationProvider>,
  document.getElementById('root'),
)
