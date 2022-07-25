module.exports = retry

async function * retry (opts = {}) {
  const max = opts.max === undefined ? 0 : opts.max
  const delay = opts.delay === undefined ? 0 : opts.delay
  const strategy = opts.strategy
  const jitter = opts.jitter === undefined ? 0 : opts.jitter

  for (let count = 1; count <= max + 1; count++) {
    yield function backoff (error) {
      if (count > max) {
        throw error
      }

      let time
      if (!strategy || strategy === 'none') time = delay
      else if (strategy === 'linear') time = delay * count
      else if (strategy === 'exponential') time = (delay * count) ** 2
      else if (Array.isArray(strategy)) time = indexOrLast(strategy, count - 1)
      else if (typeof strategy === 'function') time = strategy({ delay, count, jitter })
      else throw new Error('Backoff strategy not supported (' + strategy + ')')

      if (jitter) {
        time += Math.round(jitter * Math.random())
      }

      return sleep(time)
    }
  }
}

retry.indexOrLast = indexOrLast

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function indexOrLast (array, index) {
  if (index < array.length) {
    return array[index]
  }
  return array[array.length - 1]
}
