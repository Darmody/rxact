// @flow
import type {
  ESObservable,
  IESObservable,
  ISubscription,
  ISubscriptionObserver,
} from '../observable'
import type { EventRunner as EventRunnerType } from './eventRunnerFactory'
import { getObservable } from '../observable'
import stateFactory from './stateFactory'
import combineStateStreams from './combineStateSteams'
import eventRunnerFactory from './eventRunnerFactory'

export interface IStateStream {
  static plugins: Array<Function>,

  static addPlugin: (...Array<Function>) => void,
  static removePlugin: (...Array<Function>) => void,

  constructor(streamName: string, initialState: any): void,

  streamName: string,

  Observable: ESObservable,

  state$: IESObservable,

  emitters: Object,

  emitter(name: string, updater: Function): void,

  subscriptions: Array<ISubscription>,

  observers: Array<ISubscriptionObserver>,

  next(updater: Function): void,

  getState(): any,

  eventRunner: Function,

  dispose(): void,

  installPlugins: () => Proxy<IStateStream> | IStateStream,
}

export type StateStreams = Array<IStateStream>
export type EventRunner = EventRunnerType

class StateStream implements IStateStream {
  state$: IESObservable
  streamName: string
  Observable: ESObservable
  getState: Function
  next: Function
  eventRunner: Function

  static plugins = []

  static addPlugin = (...plugins) => {
    plugins.forEach(plugin => {
      if (typeof plugin !== 'function') {
        throw new Error('Expected plugin to be a function.')
      }
    })

    StateStream.plugins = [...StateStream.plugins, ...plugins]
  }

  static removePlugin = (...plugins) => {
    let finalPlugins = []
    if (plugins.length !== 0) {
      finalPlugins = StateStream.plugins.filter(
        plugin => !plugins.find(removedPlugin => removedPlugin === plugin)
      )
    }

    StateStream.plugins = finalPlugins
  }

  constructor(streamName: string, initialState: any, stateStreams?: StateStreams) {
    if (typeof streamName !== 'string' || !streamName) {
      throw new Error('Expected the streamName to be a not none string.')
    }

    this.streamName = streamName
    this.Observable = getObservable()

    this.state$ = stateFactory.call(this, initialState)
    this.state$ = combineStateStreams.call(this, this.state$, streamName, stateStreams)
    this.eventRunner = eventRunnerFactory(this.Observable, this.getState)
    return this.installPlugins()
  }

  emitters = {}

  subscriptions = []

  observers = []

  emitter(name: string, updater: Function) {
    if (!name) {
      throw new Error('emitter(): name should not be blank.')
    }

    if (typeof updater !== 'function') {
      throw new Error('emitter(): expect second parameter to be a function.')
    }

    // $flow-ignore
    this[name] = (...params) => {
      this.next(updater(...params))
    }
    // $flow-ignore
    this.emitters[name] = this[name]
  }

  dispose = () => {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  installPlugins = () => {
    let proxy = this
    StateStream.plugins.forEach(plugin => {
      if (typeof plugin !== 'function') {
        throw new Error('Expected plugin to be a function.')
      }

      const pluginProxy = plugin(proxy)

      if (pluginProxy) {
        proxy = pluginProxy
      }
    })

    return proxy
  }
}

export default StateStream
