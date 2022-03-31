class Dep {
  constructor() {
    this.subscribers = new Set() //使用set对象防止相同的副作用重复添加
  }

  // 收集依赖
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  // 执行副作用
  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

const targetMap = new WeakMap()

function getDep(raw, key) {
  // 创建WeakMap 实例， 将劫持对象作为 key ,
  let depsMap = targetMap.get(raw);
  if (!depsMap) {
    depsMap = new Map(); // 如果没有，自己创建一个map对象实例，然后将这个劫持的数据放入targetMap中
    targetMap.set(raw, depsMap);
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }

  return dep
}
/**
 * 
 * @param {需要被劫持的数据对象} raw 
 */
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set(target, key, newValue) {
      if (target[key] !== newValue) {
        const dep = getDep(target, key);
        target[key] = newValue;
        dep.notify();
      }
    }
  })

  // 拿到dep实例，执行depend收集依赖，执行notify执行副作用，此处的dep实例应该是raw中每个属性各自创建一个【避免多个属性的依赖收集再一次，触发notify时候都给执行了】
  // 劫持对象中的属性各个进行响应式监听
  // Object.keys(raw).forEach(key => {
  //   const dep = getDep(raw, key)
  //   let value = raw[key]

    // Vue2实现
    // Object.defineProperty(raw, key, {
    //   get() {
    //     // 收集依赖
    //     dep.depend()
    //     return value
    //   },
    //   set(newVal) {
    //     // 修改值，执行副作用
    //     if (value !== newVal) {
    //       value = newVal
    //       dep.notify()
    //     }
    //   }
    // })
    // return raw
  // })

}

// 副作用函数
let activeEffect = null

function watchEffect(effect) {
  activeEffect = effect
  effect() //副作用函数中可能触发依赖收集器depend，或者副作用函数执行器notify
  activeEffect = null
}

// const user = {
//   name: 'coco',
//   age: 18
// }

// const proxy = reactive(user)

// watchEffect(function () {
//   console.log(proxy.name + '---' + proxy.age);
// })

// setTimeout(() => {
//   proxy.name = 'jojo'
//   proxy.age = 28
// }, 2000);