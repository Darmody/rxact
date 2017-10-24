// @flow
import StateStream from './stateStream'
import type { IStateStream } from './stateStream'
import { setObservable, cleanObservable } from './observable'
import isObservable from './utils/isObservable'
import type { ESObservable } from './observable'

let RealStateStream = StateStream

export type Setup = {
  Observable: ESObservable,
  plugins?: Array<Function>,
  HOStateStream?: Class<IStateStream>,
} => void

export const setup: Setup = (options) => {
  if (typeof options !== 'object') {
    throw new Error('setup(): Expected options to be an object.')
  }

  const { Observable, plugins = [], HOStateStream = StateStream } = options

  if (!isObservable(Observable)) {
    throw new Error('setup(): Expected an ES Observable. For more info: https://github.com/tc39/proposal-observable')
  }

  setObservable(Observable)

  if (!Array.isArray(plugins)) {
    throw new Error('setup(): Expected plugins to be an array')
  }

  RealStateStream = HOStateStream
  RealStateStream.addPlugin(...plugins)
}

export type Teardown = Function

export const teardown: Teardown = () => {
  cleanObservable()
  RealStateStream.removePlugin()
}
