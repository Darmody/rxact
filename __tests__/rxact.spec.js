import * as Rxact from '../src/index'
describe('rxact', () => {
  it('exposes the public API', () => {
    expect(Rxact.StateStream).toBeDefined()
    expect(Rxact.setup).toBeDefined()
    expect(Rxact.teardown).toBeDefined()
    expect(Rxact.getObservable).toBeDefined()
    expect(Rxact.isObservable).toBeDefined()
  })
})
