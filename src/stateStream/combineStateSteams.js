// @flow
import StateStream from './index'
import isObservable from '../utils/isObservable'
import type { IESObservable } from '../observable'
import type { StateStreams } from './'

function combineStateStreams(
  state$: IESObservable, streamName: string, stateStreams?: StateStreams,
) {
  if (!stateStreams || stateStreams.length === 0) {
    return state$
  }

  const streamNames = {}
  const streams = [...stateStreams, { streamName, state$ }]

  streams.forEach((stream) => {
    if (
      !(stream instanceof StateStream) && (
        !isObservable(stream.state$) ||
        !stream.streamName
      )
    ) {
      throw new Error(
        'Expected the element of stateStreams to be instance of StateStream.'
      )
    }

    streamNames[stream.streamName] = true
  })

  if (Object.keys(streamNames).length !== streams.length) {
    throw new Error('StateStreams\' name should be unique.')
  }

  const combinedState$ = new this.Observable(observer => {
    let currentState = {}

    const subscriptions = streams.map((source) => source.state$.subscribe((state) => {
      const sourceName = source.streamName

      const nextState = { ...currentState, [sourceName]: state }
      currentState = nextState

      if (Object.keys(currentState).length === streams.length) {
        observer.next(currentState)
      }
    }))

    this.subscriptions = this.subscriptions.concat(subscriptions)

    return {
      unsubscribe: () => {
        subscriptions.forEach((subscription) => {
          subscription.unsubscribe()
        })
      }
    }
  })

  return combinedState$
}

export default combineStateStreams
