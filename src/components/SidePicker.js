import React from 'react'

import Modal from './Modal'
import Button from './Button'
import Muted from './Muted'

function SidePicker({ onPick, onBack, stats, mode }) {
  return (
    <Modal>
      <span>請選擇位置</span>
      <Button onClick={() => onPick('A')}>
        A
        {stats[mode] && stats[mode].A && (
          <Muted small>
            <br />
            {` (勝率：${stats[mode].A}％)`}
          </Muted>
        )}
      </Button>
      <Button onClick={() => onPick('B')}>
        B
        {stats[mode] && stats[mode].B && (
          <Muted small>
            <br />
            {` (勝率：${stats[mode].B}％)`}
          </Muted>
        )}
      </Button>
      <Button onClick={onBack}>返回</Button>
    </Modal>
  )
}

export default SidePicker
