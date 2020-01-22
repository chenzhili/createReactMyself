# 自己实现react框架这块的 所有东西
## 所有内容
    1、The createElement Function => 这是模版字符串，创建react的component或者Node对应的 Object
    2、The render Function
    3、Concurrent Mode => 这种模式，是指 可以 打断的模式，能够 中途停止 低优先级的操作，做 高优先级的 事情；
    4、Fibers
    5、Render and Commit Phases
    6、Reconciliation
    7、Function Components
    8、Hooks

### 4、Fibers
```js
// https://pomb.us/build-your-own-react/
function performUnitOfWork(fiber) {
    /* 做下面 三件事情 */
   // TODO add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }
    // TODO create new fibers
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
