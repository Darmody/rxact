// @flow
const disposedFn = () => {
  console.warn('You are calling function on a disposed StateStream.')
}

function stateFactory(initialState: any) {
  let disposed = false
  let state = initialState
  this.observers = []

  this.getState = () => state

  this.next = (updater: Function) => {
    if (disposed) {
      return
    }

    if (typeof updater !== 'function') {
      throw new Error('Expected passing a function to emitState.')
    }

    const nextState = updater(state)
    state = nextState
    this.observers.forEach(observer => {
      observer.next(nextState)
    })
  }

  const state$ = new this.Observable(observer => {
    this.observers.push(observer)

    observer.next(state)

    return {
      unsubscribe: () => {
        this.observers = this.observers.filter(item => item !== observer)
      }
    }
  })

  this.subscriptions.push({
    unsubscribe: () => {
      disposed = true
      this.next = disposedFn

      this.observers.forEach(observer => {
        observer.complete()
      })
      this.observers = []
    }
  })

  return state$
}


export default stateFactory
