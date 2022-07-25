const tape = require('tape')
const retry = require('./')

tape('default', async function (t) {
  let [c, r, MAX] = [0, 0, 3]

  try {
    for await (const backoff of retry()) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, 0))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('none', async function (t) {
  let [c, r, MAX] = [0, 0, 3]

  try {
    for await (const backoff of retry({ strategy: 'none' })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, 0))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('zero retries', async function (t) {
  let [c, r, MAX, started] = [0, 0, 0, Date.now()]

  try {
    for await (const backoff of retry({ max: MAX })) {
      c++
      await backoff(new Error('ok'))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }
  t.ok(isAround(Date.now() - started, 0))

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('one retry', async function (t) {
  let [c, r, MAX] = [0, 0, 1]

  try {
    for await (const backoff of retry({ max: MAX })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, 0))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('two retries', async function (t) {
  let [c, r, MAX] = [0, 0, 2]

  try {
    for await (const backoff of retry({ max: MAX })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, 0))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('delay', async function (t) {
  let [c, r, MAX, DELAY] = [0, 0, 2, 100]

  try {
    for await (const backoff of retry({ max: MAX, delay: DELAY })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, DELAY))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('jitter', async function (t) {
  let [c, r, MAX, DELAY, JITTER] = [0, 0, 100, 10, 20]
  const precision = 5

  try {
    for await (const backoff of retry({ max: MAX, delay: DELAY, jitter: JITTER })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      const diff = Date.now() - started
      if (diff < DELAY || diff > DELAY + JITTER + precision) {
        throw new Error('Not within the delay range')
      }
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('linear', async function (t) {
  let [c, r, MAX, DELAY] = [0, 0, 5, 50]

  try {
    for await (const backoff of retry({ max: MAX, delay: DELAY, strategy: 'linear' })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, c * DELAY))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('exponential', async function (t) {
  let [c, r, MAX, DELAY] = [0, 0, 5, 5]

  try {
    for await (const backoff of retry({ max: MAX, delay: DELAY, strategy: 'exponential' })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, (DELAY * c) ** 2))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('array', async function (t) {
  let [c, r, MAX, DELAYS] = [0, 0, 5, [25, 100, 250]]

  try {
    for await (const backoff of retry({ max: 5, strategy: DELAYS })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      const value1 = DELAYS[r] ? DELAYS[r] : DELAYS[DELAYS.length - 1]
      const value2 = retry.indexOrLast(DELAYS, r)
      t.is(value1, value2)
      t.ok(isAround(Date.now() - started, DELAYS[r] ? DELAYS[r] : DELAYS[DELAYS.length - 1]))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

tape('custom', async function (t) {
  let [c, r, MAX, DELAY] = [0, 0, 5, 2]

  const strategy = ({ delay, count, jitter }) => delay ** count
  try {
    for await (const backoff of retry({ max: MAX, delay: DELAY, strategy })) {
      c++
      const started = Date.now()
      await backoff(new Error('ok'))
      t.ok(isAround(Date.now() - started, DELAY ** c))
      r++
    }
  } catch (error) {
    t.is(error.message, 'ok')
  }

  t.is(c, MAX + 1)
  t.is(r, MAX)
})

function isAround (delay, real, precision = 5) {
  const diff = Math.abs(delay - real)
  return diff <= precision
}
