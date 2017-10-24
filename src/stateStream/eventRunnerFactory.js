// @flow
import type { ESObservable, IESObservable } from '../observable'
import isObservable from '../utils/isObservable'

type Factory = IESObservable => IESObservable

export type EventRunner = (
  factory?: Factory, inputSource$?: IESObservable
) => IESObservable

type EventRunnerFactory = (
  Observable: ESObservable, getState: Function
) => EventRunner

const defaultFactory = source => source

const source$Creator = (inputSource$, Observable, getState) => {
  if (inputSource$ === undefined) {
    return Observable.of(getState())
  }

  if (isObservable(inputSource$)) {
    return inputSource$
  }

  return Observable.of(inputSource$)
}

const eventRunnerFactory: EventRunnerFactory = (Observable, getState) => {
  const eventRunner = (factory?, inputSource$?) => {
    const source$ = source$Creator(inputSource$, Observable, getState)

    if (factory === null || factory === undefined) {
      factory = defaultFactory
    }

    if (typeof factory !== 'function') {
      throw new Error('Expected first parameter of eventRunner to be a function.')
    }

    const outputSource$ = factory(source$)

    if (!outputSource$ || !isObservable(outputSource$)) {
      throw new Error(
        'Expected an Observable object returned by factory in eventRunner'
      )
    }

    let output
    let next
    let subscription

    const stream$ = new Observable(observer => {
      if (output !== undefined) {
        observer.next(output)
      }

      next = value => observer.next(value)

      return {
        unsubscribe: () => {
          subscription.unsubscribe()
        }
      }
    })

    subscription = outputSource$.subscribe((value) => {
      if (typeof next === 'function') {
        next(value)
      }

      output = value
    })

    return stream$
  }

  return eventRunner
}

export default eventRunnerFactory
