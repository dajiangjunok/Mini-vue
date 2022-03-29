/**
 * 创建一个Dep的类
 * 1.依赖收集器
 * 2.监听器
 */
class Dep {
  constructor() {
    this.subscribers = new Set() //保证收集的依赖没有重复
  }

  // 依赖收集器【收集副作用】
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  // 监听器【执行副作用】
  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  effect() // 这个副作用函数必须执行，函数中对相应的数据的引用会触发数据劫持，从而添加依赖
  activeEffect = null
}

/**
 * 
 * @param {传入的对象} target 
 * @param {对象中的属性} key 
 * @returns 
 */
const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象(target)取出对应的Map对象
  let depsMap = targetMap.get(target); //查询 targetMap map对象中是否已经存在这个劫持的数据
  if (!depsMap) {
    depsMap = new Map(); // 如果没有，自己创建一个map对象实例，然后将这个劫持的数据放入targetMap中
    targetMap.set(target, depsMap);
  }

  // 2.取出具体的dep对象
  let dep = depsMap.get(key); // 去depsMap 中去取出 Dep实例，然后将实例返回【首次必然没有这个实例，那么创建这个实例，然后将这个dep实例放入depsMap对象中】
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }

  // 最终生成了一个targetMap 对象
  // targetMap = {
  //   需要被劫持的对象1: depsMap对象1:{ key1:dep实例1 , key2:dep实例2 , key3:dep实例3},
  //   需要被劫持的对象2: depsMap对象2:{ key:dep实例 },
  // }

  return dep;
}

/**
 * // 数据劫持
 * @param {需要被劫持的数据对象} raw 
 */
function reactive(raw) {
  // 此时的raw 尚未被添加到依赖，应使用方法将传入的数据添加到依赖
  Object.keys(raw).forEach(key => {
    let val = raw[key]
    const dep = getDep(raw, key) //被劫持对象中的每个属性都应该对应一个dep,创建getDep去拿到对应的dep

    Object.defineProperty(raw, key, {
      get() {
        // 当使用的时候相应进行依赖收集
        dep.depend()
        return val
      },
      set(newVal) {
        if (val !== newVal) {
          val = newVal;
          // 因监听值发生变化，执行依赖收集器中的副作用函数
          dep.notify();
        }
      }
    })
  })
  return raw
}

const user = reactive({
  name: 'wyj',
  age: 66
});

watchEffect(function () {
  console.log('我是：' + user.name + '666');
})

watchEffect(function () {
  console.log('我今年：' + user.age + '岁');
})

setTimeout(() => {
  user.name = '周润发'
  user.age = 88
}, 2000);