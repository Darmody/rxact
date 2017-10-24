<h1 align="center">Rxact</h1>

[![npm version](https://img.shields.io/npm/v/rxact.svg?style=flat-square)](https://www.npmjs.com/package/rxact)
[![CircleCI master](https://img.shields.io/circleci/project/github/Darmody/rxact/master.svg?style=flat-square)](https://circleci.com/gh/Darmody/rxact/tree/master)
[![Coveralls master](https://img.shields.io/coveralls/github/Darmody/rxact/master.svg?style=flat-square)](https://coveralls.io/github/Darmody/rxact)

Rxact 是一个基于 `Observable` 实现的 `Javascript app` 应用管理库。

## 介绍
Rxact 致力于帮助应用管理数据与业务逻辑，与 Redux 等 state 容器不同的是，Rxact 在管理 state 之外，还会帮助开发者很好地封装应用逻辑。需要注意的是，使用 Rxact 将会涉及 **reactive programing** 的概念，请确保这是你熟悉或希望使用的特性。

## 核心概念

### 没有 Store

在 Rxact 中没有 Store 的概念，但是依然可以存储数据。在类似于 Redux 的 state 容器中都会有 Store 的概念，这是因为他们的设计理念本身就是对 state 进行管理。但是对于现在越来越复杂的 Javascript 应用来说，只有 state 管理是不够的，还需要很好的业务逻辑管理。因此 Rxact 以流的概念来管理 state 和业务逻辑。

### 流

现在开始自顶向下地构想你的应用逻辑，从用户登录开始直到某个按钮的点击行为，是不是可以看到一条条完整的**逻辑流**，不同的逻辑流之间还有可能互相融合或者分流到其他流中。这就是 Rxact 希望做到的，通过**流**来管理你的应用。

### StateStream

`Rxact` 中最核心的组件就是 **StateStream**，StateStream 就是一个数据流。在这个数据流中你可以定义你的数据如何变化，你有哪些针对这些数据的事件流或操作。甚至还可以把不同的 StateStream 组合起来形成一个新的 StateStream。这就是 `Rxact` 组织和管理应用的方式。

## 安装

```
yarn add rxact
```

## 起步

第一步, 选择你喜欢的 Observable 库。

`Rxact` 支持任何基于[ECMAScript Observable 标准](https://github.com/tc39/proposal-observable) 的实现。
目前可以配合使用的库包括（但不仅限于）:
* [RxJS 5](https://github.com/ReactiveX/rxjs)
* [zen-observable](https://github.com/zenparsing/zen-observable)
* [xstream](https://github.com/staltz/xstream) (配合使用：[rxact-xstream](https://github.com/Darmody/rxact-xstream))
* 更多...

第二步，配置 `Rxact`。

假设你选择了 `RxJS` 作为 `Observable` 实现，现在你需要配置 `Rxact`:

```javascript
import { StateStream } from 'rxact'
import Rx from 'rxjs'
import { setup } from 'rxact'

setup({ Observable: Rx.Observable })
```

第三步，我们以计数器为例写一个简单的样例

```javascript
import { StateStream } from 'rxact'

/**
 * StateStream 是一个管理 state 的流。
 * 你需要为流起一个名字，并赋予一个初始值。有了这个流后，就可以往流里更新新的数据，
 * 并监听流的变化，做出相应的动作
 */
const stream = new StateStream('stream', 0)

/**
 * emitter 用于定义数据的更新操作，这里定义了一个名为 increment 的操作，
 * 每次执行这个操作，"stream"流将会得到之前数据加上输入值的新值。
*/
stream.emitter('increment', value => prevState => (prevState + value))

/**
 * 通过订阅 stream 获取最新的值并打印出来。
 * 在 subscribe 时就会立刻输出当前值，在这里就是初始值 0
**/
stream.subscribe(value => { console.log(value) })

stream.increment(1)
// subscribe 将会输出 1
stream.increment(1)
// subscribe 将会输出 2
stream.increment(2)
// subscribe 将会输出 4
```

更多信息请查看详细文档。

## 示例

下面是更复杂，更多功能的示例

* [计数器](https://darmody.github.io/rxact-examples/counter)
* [TodoMVC](https://darmody.github.io/rxact-examples/todomvc)
* [异步事件案例](https://darmody.github.io/rxact-examples/async)
* [贴近现实的复杂案例](https://darmody.github.io/rxact-examples/real-world)

你可以在 [rxact-examples](https://github.com/darmody/rxact-examples) 看到上述例子的源代码。

## 插件

`Rxact` 可以配置插件来增强功能。常用的插件有：
* [Rxact-React](https://github.com/Darmody/rxact-react) `Rxact` 对 `React` 的支持。
* [Rxact-Debugger](https://github.com/Darmody/rxact-debugger) `Rxact` 调试插件，可以在浏览器控制台下调用 `StateStream`， 并有友好的日志帮助调试。
* [Rxact-Rxjs](https://github.com/Darmody/rxact-rxjs) `Rxact` 天然支持 `Rxjs`, 这个组件提供了更高级的功能支持。
* [Rxact-Xstream](https://github.com/Darmody/rxact-xstream) `Rxact` 对 `xstream` 的支持。

## 文档

敬请期待...

## 协议

[MIT](https://github.com/darmody/rxact/blob/master/LICENSE)
