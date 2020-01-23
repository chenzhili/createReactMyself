# 自己实现react框架这块的 所有东西
## 所有内容
    1、The createElement Function => 这是模版字符串，创建react的component或者Node对应的 Object
    2、The render Function
    3、Concurrent Mode => 这种模式，是指 可以 打断的模式，能够 中途停止 低优先级的操作，做 高优先级的 事情；
    4、Fibers
    5、Render and Commit Phases => 这里 在上一步 fiber 都生成成功，并且没有 nextUnitWork 的时候，递归将 所有的 fiberDOM => 放到 浏览器上
    6、Reconciliation
    7、Function Components
    8、Hooks

### 4、Fibers
```js
// https://pomb.us/build-your-own-react/
// https://segmentfault.com/a/1190000021464737 中文的
// 这个 函数 执行 成功 后，会 返回 下一个 执行单元 ，如果有的化
function performUnitOfWork(fiber) {
    /* 做下面 三件事情 */
   // TODO add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    // 这里将 fiber 的 DOM 挂载到 parent 上 有待 商榷
    /* 因为 这一步 如果 这样做了；
        思想上：是想 把 每一步 生成 dom 进行 分流 处理，但是 这一步没有 必要的原因 是：
            在这里 放到页面上，这里 是 可以 被中断的，说明 在 一个 组件上 可能会 显示 不完整，呈现 在 浏览器上；这种业务是有问题的，
            应该是 让 所有的 fiber 工作 都 完成后，在 一起 呈现到 页面上；这里可中断，呈现到页面上 这个 过程 不可中断，这样在 体验和 业务上 才是 正确的；
    */
    /* if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    } */
    // TODO create new fibers
    // 对应的 数据结构，看图片
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while (index < elements.length) {
        const element = elements[index]

        //这是 fiber 的结构
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }

        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
    // TODO return next unit of work
    /* 
        next unit 的 顺序
        Finally we search for the next unit of work. We first try with the child, then with the sibling, then with the uncle, and so on
    */
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}
​
```
