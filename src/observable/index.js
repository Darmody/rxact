// @flow
// https://github.com/tc39/proposal-observable
import isObservable from '../utils/isObservable'
import type { ESObservable } from './index'

let Observable: ?ESObservable = null

export const setObservable = (ObservableImplement: ESObservable) => {
  if (isObservable(Observable)) {
    throw new Error('Expected setup once in your app lifetime.')
  }
  Observable = ObservableImplement
}

export const getObservable = (): ESObservable => {
  if (!Observable) {
    throw Error('You must configure Observable first.')
  }

  return Observable
}

export const cleanObservable = () => {
  Observable = null
}
