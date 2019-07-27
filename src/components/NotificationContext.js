import React from 'react';

let notificationId = 0;

const NotificationContext = React.createContext();

export class NotificationProvider extends React.Component {
  state = {
    list: [],
  };

  addNotification = item => {
    this.setState({
      list: [item, ...this.state.list],
    });
  };

  removeNotification = id => {
    this.setState({
      list: this.state.list.filter(item => item.id !== id),
    });
  };

  displayNotification = payload => {
    const id = (notificationId += 1);
    const isString = typeof payload === 'string';
    const text = isString ? payload : payload.text;
    const duration = isString ? 5000 : payload.duration || 5000;

    this.addNotification({
      id,
      text,
    });

    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  };

  render() {
    return (
      <NotificationContext.Provider
        value={{
          state: this.state,
          removeNotification: this.removeNotification,
          displayNotification: this.displayNotification,
        }}
      >
        {this.props.children}
      </NotificationContext.Provider>
    );
  }
}

export const NotificationConsumer = NotificationContext.Consumer;
