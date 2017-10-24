import { getObservable, setObservable, cleanObservable } from '../../src/observable'
import isObservable from '../../src/utils/isObservable'
import { teardown } from '../../src/helpers'

export default (Observable) => {
  describe('Observable', () => {
    afterEach(() => {
      teardown()
    })

    it('Throw error if Observable did not configure', () => {
      expect(() => {
        getObservable()
      }).toThrow()
    })

    it('Throw error if setObservable called after Observable configured', () => {
      setObservable(Observable)

      expect(() => {
        setObservable(Observable)
      }).toThrow()
    })

    it('Clean the Observable configuration', () => {
      setObservable(Observable)

      cleanObservable()

      expect(() => {
        setObservable(Observable)
      }).not.toThrow()
    })

    describe('Observable implement', () => {
      it('exposes the public API', () => {
        const observable = new Observable(() => {})

        expect(isObservable(observable)).toBeTruthy()
        expect(observable.subscribe).toBeDefined()
      })

      it('exposes the static API', () => {
        expect(Observable.of).toBeDefined()
        expect(Observable.from).toBeDefined()
      })

      it('construct with SubscriptionObserver', () => {
        const observable = new Observable(observer => {
          observer.next(0)

          return {
            unsubscribe: () => {}
          }
        })
        const mockSubscriber = jest.fn()

        observable.subscribe(mockSubscriber)

        expect(mockSubscriber.mock.calls).toEqual([[0]])
      })

      it('subscribe() with observer', () => {
        const observable = new Observable(observer => {
          observer.next(0)

          return {
            unsubscribe: () => {}
          }
        })
        const mockSubscriber = jest.fn()

        const observer = {
          next: mockSubscriber
        }

        observable.subscribe(observer)

        expect(mockSubscriber.mock.calls).toEqual([[0]])
      })

      it('subscribe() with onNext, onComplete, onError', () => {
        const observable = new Observable(observer => {
          observer.next(0)

          return {
            unsubscribe: () => {}
          }
        })
        const mockSubscriber = jest.fn()

        observable.subscribe(mockSubscriber)

        expect(mockSubscriber.mock.calls).toEqual([[0]])
      })
    })
  })
}
