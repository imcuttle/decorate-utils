/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
const decorateDemo = require('../examples/validate').default
const check = require('../examples/validate').check
const { getDecorateConfig } = require('..')

class Person {
  @decorateDemo(a => !(a > 10) && '需要大于10')
  age = 12

  @decorateDemo(v => !['M', 'W'].includes(v) && 'W or M')
  gender = 12
}

describe('decorateDemo', function() {
  it('should current', function() {
    const person = new Person()
    expect(getDecorateConfig(person, 'check')).toBe(getDecorateConfig(Object.getPrototypeOf(person), 'check'))

    expect(check(person)).toMatchInlineSnapshot(`
      Array [
        Object {
          "error": "W or M",
          "name": "gender",
        },
      ]
    `)
  })

  it('should inheritance', function() {
    class OldMan extends Person {
      @decorateDemo(v => !(v > 70) && '需要大于70')
      age = 12
    }

    const man = new OldMan()
    expect(check(new OldMan())).toMatchInlineSnapshot(`
Array [
  Object {
    "error": "需要大于70",
    "name": "age",
  },
  Object {
    "error": "W or M",
    "name": "gender",
  },
]
`)
    expect(getDecorateConfig(man, 'check')).toMatchInlineSnapshot(`
Array [
  Array [
    "age",
    [Function],
  ],
  Array [
    "gender",
    [Function],
  ],
]
`)
  })
})
