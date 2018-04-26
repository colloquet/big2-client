import React from 'react'
import ReactDOM from 'react-dom'

import NotificationProvider from './NotificationProvider'
import App from './App'
import './index.css'

ReactDOM.render(
  <NotificationProvider>
    <App />
  </NotificationProvider>,
  document.getElementById('root'),
)
