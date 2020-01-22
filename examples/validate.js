/**
 * decorate demo of legacy and current proposal
 * @author imcuttle
 */

import { extendsToPrototype, getDecorateConfig } from '..'

export default rule => {
  return (...argv) => {
    return extendsToPrototype('check', rule, argv)
  }
}

export function check(target) {
  const rules = getDecorateConfig(target, 'check')
  if (!rules) {
    return null
  }

  const result = []
  rules.forEach(([name, rule]) => {
    const error = rule(target[name], target)
    if (typeof error === 'string') {
      result.push({
        name,
        error
      })
    }
  })
  return result
}
