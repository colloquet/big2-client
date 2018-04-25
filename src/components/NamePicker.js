import React from 'react'
import Recaptcha from 'react-recaptcha'
import styled from 'styled-components'
import store from 'store'

import Spinner from './Spinner'
import Button from './Button'

const Container = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const Input = styled.input`
  height: 3rem;
  width: 10rem;
  border-radius: 8px;
  border: 0;
  background: #f5f7f9;
  font-size: 1rem;
  padding: 0.5rem;
  margin: 0.5rem;
`

class NamePicker extends React.Component {
  state = {
    name: store.get('name') || '',
    isLoading: true,
  }

  onNameChange = event => {
    this.setState({ name: event.target.value })
  }

  onSubmit = (response) => {
    this.setState({ isLoading: true })
    this.recaptcha.execute()
  }

  verifyCaptcha = response => {
    if (!this.state.name.trim()) {
      alert('名稱不能為空白')
      return
    }

    if (this.state.name.length > 20) {
      alert('名稱不能多過 20 個字')
      return
    }
    
    store.set('name', this.state.name)
    this.props.onPick(this.state.name, response, this.onError)
  }

  onError = () => {
    this.setState({ isLoading: false })
  }

  render() {
    const { name, isLoading } = this.state
    const { onBack } = this.props
    return (
      <React.Fragment>
        <Container>
          {isLoading ? (
            <Spinner />
          ) : (
            <React.Fragment>
              請輸入名稱
              <Input type="text" value={name} onChange={this.onNameChange} placeholder="名稱" />
              <Button onClick={this.onSubmit}>確定</Button>
              <Button onClick={onBack}>返回</Button>
            </React.Fragment>
          )}
        </Container>
        <Recaptcha
          ref={e => (this.recaptcha = e)}
          sitekey="6LecdlUUAAAAAASEwZyngHOfp9Ayc63XsYT8fSDg"
          size="invisible"
          onloadCallback={() => this.setState({ isLoading: false })}
          verifyCallback={this.verifyCaptcha}
        />
      </React.Fragment>
    )
  }
}

export default NamePicker
