import { getShortcutFromEvent, getShortcutLabel } from './shortcut'

describe('keyboard shortcuts', () => {
  it('normalizes modifier shortcuts', () => {
    expect(getShortcutFromEvent(new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      shiftKey: true,
    }))).toBe('Ctrl+Shift+K')
  })

  it('supports arrow shortcuts', () => {
    expect(getShortcutFromEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      altKey: true,
    }))).toBe('Alt+ArrowDown')
    expect(getShortcutLabel('Alt+ArrowDown')).toBe('Alt + ↓')
  })

  it('rejects typing keys without a control modifier', () => {
    expect(getShortcutFromEvent(new KeyboardEvent('keydown', {
      key: 'A',
      shiftKey: true,
    }))).toBe('')
  })

  it('accepts function keys without modifiers', () => {
    expect(getShortcutFromEvent(new KeyboardEvent('keydown', { key: 'F8' }))).toBe('F8')
  })
})
