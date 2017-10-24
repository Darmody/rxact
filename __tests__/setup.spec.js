import Observable from 'zen-observable'
import StateStream from '../src/stateStream'
import { setup, teardown } from '../src/helpers'

describe('setup', () => {
  beforeEach(() => {
    teardown()
  })

  it('throw error if options is not an object', () => {
    expect(() => {
      setup(Observable)
    }).toThrow()

    expect(() => {
      setup('')
    }).toThrow()
  })

  it('throw error when setup with invalid observable', () => {
    expect(() => {
      setup({ Observable: '' })
    }).toThrow()
    expect(() => {
      setup({ Observable })
    }).not.toThrow()
  })

  it('Expect setup only once in app lifetime', () => {
    setup({ Observable })
    expect(() => {
      setup({ Observable })
    }).toThrow()
  })

  it('throw error if \'plugins\' is not an array', () => {
    expect(() => {
      setup({ Observable, plugins: '' })
    }).toThrow()
  })

  it('setup plugins', () => {
    expect(StateStream.plugins.length).toBe(0)
    setup({ Observable, plugins: [() => {}] })
    expect(StateStream.plugins.length).toBe(1)
  })
})
