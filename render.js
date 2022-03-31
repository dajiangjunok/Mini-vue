const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  // 1.创建节点
  const el = vnode.el = document.createElement(vnode.tag)

  // 2.将属性放到节点上
  if (vnode.props ) {
    // 有属性
    for (const key in vnode.props) {
      const value = vnode.props[key]
       
      if (key.startsWith('on')) {
        // 说明是监听器
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        // 说明是属性
        el.setAttribute(key, value)
      }
    }
  }

  // 3.解析子节点
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(child => {
        mount(child, el)
      })
    }
  }


  container.appendChild(el)
}


const patch = (n1, n2) => {
  // 当外层tag不一致时，说明整个不一样，直接删除原来的，换上最新的
  if (n1.tag !== n2.tag) {
    const parentElement = n1.el.parentElement
    parentElement.removeChild(n1.el) 
    mount(n2, parentElement);
  } else {
    // tag 一致开始对比props
    // 1.将n1的el存到n2 【因为他两一致】
    const el = n2.el = n1.el;
   
    // 2.处理props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];

      // 新旧值不同的时候则要进行更新
      if (oldValue !== newValue) {
        if (key.startsWith("on")) { // 对事件监听的判断
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }

     // 2.2.删除旧的props
     for (const key in oldProps) {
      if (key.startsWith("on")) { // 对事件监听的判断
        const value = oldProps[key];
        el.removeEventListener(key.slice(2).toLowerCase(), value)
      } 
      if (!(key in newProps)) {
        el.removeAttribute(key);
      }
    }

     // 3.处理children
     const oldChildren = n1.children || [];
     const newChidlren = n2.children || [];
 
     if (typeof newChidlren === "string") { // 情况一: newChildren本身是一个string
       // 边界情况 (edge case)
       if (typeof oldChildren === "string") {
         if (newChidlren !== oldChildren) {
           el.textContent = newChidlren
         }
       } else {
         el.innerHTML = newChidlren;
       }
     } else { // 情况二: newChildren本身是一个数组
       if (typeof oldChildren === "string") {
         el.innerHTML = "";
         newChidlren.forEach(item => {
           mount(item, el);
         })
       } else {
         // oldChildren: [v1, v2, v3, v8, v9]
         // newChildren: [v1, v5, v6]
         // 1.前面有相同节点的原生进行patch操作
         const commonLength = Math.min(oldChildren.length, newChidlren.length);
         for (let i = 0; i < commonLength; i++) {
           patch(oldChildren[i], newChidlren[i]);
         }
 
         // 2.newChildren.length > oldChildren.length
         if (newChidlren.length > oldChildren.length) {
           newChidlren.slice(oldChildren.length).forEach(item => {
             mount(item, el);
           })
         }
 
         // 3.newChildren.length < oldChildren.length
         if (newChidlren.length < oldChildren.length) {
           oldChildren.slice(newChidlren.length).forEach(item => {
             el.removeChild(item.el);
           })
         }
       }
     }
    
  }
}