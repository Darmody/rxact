// @flow
import $$observable from 'symbol-observable'

export type IsObservable = any => boolean

const isObservable: IsObservable = (Observable) => {
  if (!Observable) {
    return false
  }

  if (Observable[$$observable]) {
    return true
  }

  if (Observable.prototype && Observable.prototype[$$observable]) {
    return true
  }

  return false
}

export default isObservable
