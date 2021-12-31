/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

/**
 * 拦截的数组方法列表
 * 其中sort和reverse不增删元素
 */
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {

  // 原始方法
  const original = arrayProto[method]

  /**
   * @param arrayMethods 要defineProperty的对象
   * @param method 要define的property，其实就是要覆写的方法的名字
   * @param mutator 经过Vue加工的方法内容
   */
  def(arrayMethods, method, function mutator (...args) {

    const result = original.apply(this, args)
    



    /*---------Vue增加的逻辑---------*/
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        /**
         * unshift是在头部插入元素
         * 为什么不处理shift呢？
         * 因为Vue并不关心从数组中有哪些元素被移除，
         * 只关心新增了哪些元素，
         * 是否需要对他们做响应式加工
         */
        inserted = args
        break
      case 'splice':
        /**
         * args.slice(2)就是获取args数组从第3个到结尾的所有元素
         * 而arr.splice(start, deleteCount, items...) 从第3个到结尾的所有元素
         * 就是要新插入的那批元素
         */
        inserted = args.slice(2)
        break
    }
    // 如果有新元素被插入进来，要求Observer为新增元素做变化观测
    if (inserted) ob.observeArray(inserted)
    
    // 通知依赖更新
    ob.dep.notify()
    /*-----------------------------*/
    
    // 这整个方法做的事情相当于：中途拦截数组原始方法，加入自定义逻辑，执行完毕后再放行原始方法





    return result
  })
})
