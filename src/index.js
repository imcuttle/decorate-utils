export function isLegacyDecorateByArgs(argvs) {
  if (argvs && argvs.length === 1 && ['method', 'accessor', 'field', 'hook'].includes(argvs[0].kind)) {
    return false
  }
  return true
}

const addHideProps = (target, name, value) => {
  Object.defineProperty(target, name, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  })
}

export function extendsToPrototypeLegacy(name, data, argvs) {
  const [target, keyName, descriptor] = argvs
  name = getInjectPropName(name)

  if (!target[name]) {
    addHideProps(target, name, [[keyName, data]])
  } else {
    let prevConfig = target[name]
    if (!target.hasOwnProperty(name)) {
      // inheritance
      prevConfig = prevConfig.slice()
    }
    const pos = prevConfig.findIndex(config => config[0] === keyName)
    if (pos >= 0) {
      prevConfig[pos][1] = data
    } else {
      prevConfig.push([keyName, data])
    }

    if (!target.hasOwnProperty(name)) {
      // inheritance
      addHideProps(target, name, prevConfig)
    }
  }

  return descriptor
}

export const getInjectPropName =
  typeof Symbol === 'function' ? name => Symbol.for(`[[${name}]]`) : name => `[[${name}]]`

export function getDecorateConfig(target, name) {
  return target[getInjectPropName(name)]
}

export function extendsToPrototype(name, data, argvs) {
  if (isLegacyDecorateByArgs(argvs)) {
    return extendsToPrototypeLegacy(name, data, argvs)
  } else {
    // https://tc39.es/proposal-decorators/
    const decorateConfig = argvs[0]
    return {
      ...decorateConfig,
      initializer: function() {
        // Babel 目前对于当前版本标准版本的 decorators 支持不完全，所以暂时使用比较滞后的  成员遍历 运行时 initializer 注入数据
        // 再每一次 new 实例的过程中，都会执行该方法
        extendsToPrototypeLegacy(name, data, [
          Object.getPrototypeOf(this),
          decorateConfig.key,
          decorateConfig.descriptor
        ])
        return decorateConfig.initializer.apply(this, arguments)
      }
    }
    //   extras: (decorateConfig.extras || []).concat({
    //     kind: 'field',
    //     key: name,
    //     placement: 'prototype',
    //     descriptor: {
    //       enumerable: false,
    //       configurable: true,
    //       writable: true
    //     },
    //     // initializer() {
    //     //   extendsToPrototypeLegacy(name, data, [this, decorateConfig.key, decorateConfig.descriptor])
    //     //   return this[name]
    //     // }
    //   })
    // }
  }
}
