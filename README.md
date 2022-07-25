# like-retry

Retry and backoff using generators.

![](https://img.shields.io/npm/v/like-retry.svg) ![](https://img.shields.io/npm/dt/like-retry.svg) ![](https://img.shields.io/badge/tested_with-tape-e683ff.svg) ![](https://img.shields.io/github/license/LuKks/like-retry.svg)

```
npm i like-retry
```

## Usage
```javascript
const retry = require('like-retry')

for await (const backoff of retry({ max: 3, delay: 3000 })) {
  try {
    return await axios.get(...)
  } catch (error) {
    await backoff(error) // 3s, 3s, 3s and finally throws
  }
}
```

## Jitter
```javascript
for await (const backoff of retry({ max: 5, delay: 1000, jitter: 500 })) {
  await backoff(new Error()) // 1489ms, 1142ms, 1276ms, 1088ms, 1337ms and finally throws
}
```

## Linear
```javascript
for await (const backoff of retry({ max: 5, delay: 3000, strategy: 'linear' })) {
  await backoff(new Error()) // 3s, 6s, 9s, 12s, 15s, 18s and finally throws
}
```

## Exponential
```javascript
for await (const backoff of retry({ max: 5, delay: 20, strategy: 'exponential' })) {
  await backoff(new Error()) // 0.4s, 1.6s, 3.6s, 6.4s, 10s and finally throws
}
```

## Array
```javascript
for await (const backoff of retry({ max: 5, strategy: [1000, 5000, 15000] })) {
  await backoff(new Error()) // 1s, 5s, 15s, 15s, 15s and finally throws
}
```

## Custom
```javascript
const strategy = ({ delay, count, jitter }) => delay ** count

for await (const backoff of retry({ max: 5, delay: 2, strategy })) {
  await backoff(new Error()) // 4ms, 16ms, 64ms, 256ms, 1024ms and finally throws
}
```

## None
It's the same as no setting any strategy.

```javascript
for await (const backoff of retry({ max: 3, delay: 3000, strategy: 'none' })) {
  await backoff(new Error()) // 3s, 3s, 3s and finally throws
}
```

## License
MIT
