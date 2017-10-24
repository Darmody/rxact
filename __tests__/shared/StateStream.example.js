import { setup, teardown } from '../../src/helpers'
import StateStream from '../../src/stateStream'

export default (Observable) => {
  beforeEach(() => {
    setup({ Observable })
  })

  afterEach(() => {
    teardown()
  })

  describe('StateStream', () => {
    it('exposes the static API', () => {
      expect(StateStream.plugins).toBeDefined()
      expect(StateStream.addPlugin).toBeDefined()
    })

    it('exposes the public API', () => {
      const stateStream = new StateStream('stream')

      expect(stateStream.streamName).toBeDefined()
      expect(stateStream.state$).toBeDefined()
      expect(stateStream.getState).toBeDefined()
      expect(stateStream.next).toBeDefined()
      expect(stateStream.eventRunner).toBeDefined()
      expect(stateStream.emitter).toBeDefined()
      expect(stateStream.emitters).toBeDefined()
      expect(stateStream.dispose).toBeDefined()
      expect(stateStream.installPlugins).toBeDefined()
    })

    it('throw if stream name is invalid', () => {
      expect(() =>
        new StateStream('stream')
      ).not.toThrow()

      expect(() =>
        new StateStream(1)
      ).toThrow()

      expect(() =>
        new StateStream('')
      ).toThrow()

      expect(() =>
        new StateStream({})
      ).toThrow()

      expect(() =>
        new StateStream()
      ).toThrow()

      expect(() =>
        new StateStream(() => {})
      ).toThrow()
    })

    describe('plugins', () => {
      it('throw error if plugin is not a function', () => {
        expect(() => {
          StateStream.addPlugin(() => {})
        }).not.toThrow()

        expect(() => {
          StateStream.addPlugin('')
        }).toThrow()

        expect(() => {
          StateStream.addPlugin({})
        }).toThrow()
      })

      it('add plugins', () => {
        StateStream.addPlugin(() => {})
        expect(StateStream.plugins.length).toBe(1)
        StateStream.addPlugin(() => {}, () => {})
        expect(StateStream.plugins.length).toBe(3)
      })

      it('use proxy returned by plugin', () => {
        StateStream.addPlugin(instance => new Proxy(instance, {
          get: (target, prop) => {
            if (prop === 'test') {
              return 'test'
            }

            return target[prop]
          }
        }))

        const stream = new StateStream('stream')

        expect(stream.test).toEqual('test')
        expect(stream.state$).toBeDefined()
      })

      it('remove plugin', () => {
        const plugin1 = () => {}
        const plugin2 = () => {}
        const plugin3 = () => {}
        const plugin4 = () => {}
        const plugin5 = () => {}
        StateStream.addPlugin(plugin1, plugin2, plugin3, plugin4)
        expect(StateStream.plugins.length).toBe(4)
        StateStream.removePlugin(plugin5)
        expect(StateStream.plugins.length).toBe(4)
        StateStream.removePlugin(plugin4)
        expect(StateStream.plugins.length).toBe(3)
        StateStream.removePlugin(plugin3, plugin2)
        expect(StateStream.plugins.length).toBe(1)
        StateStream.removePlugin()
        expect(StateStream.plugins.length).toBe(0)
      })

      it('access instance in plugin', () => {
        const plugin = (instance) => {
          expect(instance).toBeInstanceOf(StateStream)
        }

        StateStream.addPlugin(plugin)

        new StateStream('stream', 0)
      })

      it('add instance function in plugin', () => {
        const plugin = (instance) => {
          instance.newMethd = () => {}
        }
        StateStream.addPlugin(plugin)

        const stream = new StateStream('stream', 0)
        expect(stream.newMethd).toBeDefined()
      })
    })

    describe('state$', () => {
      it('always can get current value whenever subscribing', () => {
        const initialState = 0
        const stateStream = new StateStream('stream', initialState)
        const newState = 1

        const mockSubscriber1 = jest.fn()
        const mockSubscriber2 = jest.fn()

        stateStream.state$.subscribe(mockSubscriber1)

        stateStream.next(() => newState)

        stateStream.state$.subscribe(mockSubscriber2)

        expect(mockSubscriber1.mock.calls).toEqual([[0], [1]])
        expect(mockSubscriber2.mock.calls).toEqual([[1]])
      })

      it('multiple subscribers receive same state at meantime', () => {
        const stateStream = new StateStream('stream', 0)
        const newState = 1
        const mockSubscriber1 = jest.fn()
        const mockSubscriber2 = jest.fn()

        stateStream.state$.subscribe(mockSubscriber1)
        stateStream.state$.subscribe(mockSubscriber2)

        stateStream.next(preState => preState + newState)

        expect(mockSubscriber1.mock.calls).toEqual([[0], [1]])
        expect(mockSubscriber2.mock.calls).toEqual([[0], [1]])
      })
    })

    describe('getState', () => {
      it('get current state', () => {
        const initialState = 0
        const stateStream = new StateStream('stream', initialState)
        const emit = (value) => stateStream.next(() => value)
        const mockFn = jest.fn()

        stateStream.state$.subscribe(value => {
          mockFn(value, stateStream.getState())
        })

        emit(1)
        emit(2)
        emit(3)

        expect(mockFn.mock.calls).toEqual([
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
        ])
      })
    })

    describe('next', () => {
      it('throw if next don\'t receive function param', () => {
        const stateStream = new StateStream('stream', 0)
        expect(() => {
          stateStream.next(state => state)
        }).not.toThrow()

        expect(() => {
          stateStream.next()
        }).toThrow()

        expect(() => {
          stateStream.next('')
        }).toThrow()

        expect(() => {
          stateStream.next(1)
        }).toThrow()

        expect(() => {
          stateStream.next({})
        }).toThrow()
      })

      it('emit new state through next', () => {
        const stateStream = new StateStream('stateStream', 0)
        const mockFn = jest.fn()

        stateStream.state$.subscribe(mockFn)
        stateStream.next(() => 1)

        expect(mockFn.mock.calls).toEqual([[0], [1]])
      })

      it('emit new state based on previous state', () => {
        const stateStream = new StateStream('stateStream', 0)
        const mockFn = jest.fn()

        stateStream.state$.subscribe(mockFn)
        stateStream.next(count => count + 1)
        stateStream.next(count => count + 2)

        expect(mockFn.mock.calls).toEqual([[0], [1], [3]])
      })
    })

    describe('eventRunner', () => {
      it('throw error if factory is not a function', () => {
        const stateStream = new StateStream('stateStream', 0)

        expect(() => {
          stateStream.eventRunner()
        }).not.toThrow()

        expect(() => {
          stateStream.eventRunner(event$ => event$)
        }).not.toThrow()

        expect(() => {
          stateStream.eventRunner('')
        }).toThrow()
      })

      it ('throw error if factory do not return an observable', () => {
        const stateStream = new StateStream('stateStream', 0)

        expect(() => {
          stateStream.eventRunner(() => {})
        }).toThrow()

        expect(() => {
          stateStream.eventRunner(() => '')
        }).toThrow()
      })

      it('make state as input source if no source passed', () => {
        const stateStream = new StateStream('stateStream', 0)

        stateStream.eventRunner(event$ => {
          event$.subscribe(state => {
            expect(state).toEqual(0)
          })

          return event$
        })
      })

      it('accept input source if it is an observable', () => {
        const stateStream = new StateStream('stateStream', 0)

        stateStream.eventRunner(event$ => {
          event$.subscribe(state => {
            expect(state).toEqual('value')
          })

          return event$
        }, stateStream.Observable.of('value'))
      })

      it(
        'transform input source to observable if it is not null and not observable',
        () => {
          const stateStream = new StateStream('stateStream', 0)

          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual('value')
            })

            return event$
          }, 'value')
          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual(1)
            })

            return event$
          }, 1)
          stateStream.eventRunner(event$ => {
            event$.subscribe(state => {
              expect(state).toEqual({})
            })

            return event$
          }, {})
        })

      it('return new event stream$ by eventRunner', () => {
        const stateStream = new StateStream('stateStream', 0)
        const mockListener = jest.fn()

        stateStream.eventRunner(null).subscribe(state => {
          expect(state).toEqual(0)
        })

        stateStream.eventRunner(() => {
          return new stateStream.Observable(observer => {
            mockListener()

            observer.next(1)
          })
        }).subscribe(state => {
          expect(state).toEqual(1)
        })

        expect(mockListener.mock.calls.length).toEqual(1)
      })

      it(
        'works fine if stream$ returned by eventRunner subscribe before emitting',
        () => {
          const stateStream = new StateStream('stateStream', 0)
          let next
          const observable = new stateStream.Observable(observer => {
            next = value => observer.next(value)

            return { unsubscribe: () => {} }
          })

          const mockSubscriber = jest.fn()

          stateStream.eventRunner(null, observable).subscribe(mockSubscriber)
          next(1)

          expect(mockSubscriber.mock.calls).toEqual([[1]])
        })

      it('unsubscribe stream$ returned by eventRunner', () => {
        const stateStream = new StateStream('stateStream', 0)
        const mockSubscriber = jest.fn()

        const subscription = stateStream
          .eventRunner(null, stateStream.state$)
          .subscribe(mockSubscriber)

        stateStream.next(() => 1)

        expect(mockSubscriber.mock.calls.length).toEqual(2)

        subscription.unsubscribe()
        stateStream.next(() => 2)

        expect(mockSubscriber.mock.calls.length).toEqual(2)
      })
    })

    describe('emitter', () => {
      it('throw error if name is invalid', () => {
        const stateStream = new StateStream('stateStream', 0)
        expect(() => stateStream.emitter('', () => {})).toThrow()
        expect(() => stateStream.emitter('test', () => {})).not.toThrow()
      })

      it('throw error if updater is not a function', () => {
        const stateStream = new StateStream('stateStream', 0)
        expect(() => stateStream.emitter('test1')).toThrow()
        expect(() => stateStream.emitter('test2', () => {})).not.toThrow()
      })

      it('update state through emitter', () => {
        const mockSubscriber = jest.fn()
        const stateStream = new StateStream('stateStream', 0)

        stateStream.emitter('emitter1', value => prevState => (prevState + value))
        stateStream.state$.subscribe(mockSubscriber)
        stateStream.emitter1(1)

        expect(stateStream.emitter1).toBeDefined()
        expect(stateStream.emitters.emitter1).toBeDefined()
        expect(mockSubscriber.mock.calls).toEqual([[0], [1]])
      })
    })


    describe('dispose', () => {
      it('cannot calling next after stateStream disposed', () => {
        global.console = { warn: jest.fn() }
        const stateStream = new StateStream('stateStream', 0)
        const mockSubscriber = jest.fn()

        stateStream.state$.subscribe(mockSubscriber)

        stateStream.dispose()
        stateStream.next(() => 1)

        expect(mockSubscriber.mock.calls.length).toEqual(1)
      })
    })

    describe('installPlugins', () => {
      it('throw error if plugin is not a function', () => {
        StateStream.plugins = ['']
        expect(() => new StateStream('stateStream', 0)).toThrow()
      })
    })
  })
}
