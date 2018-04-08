
function timeout(ms) {
  return new Promise((resolve => {
    setTimeout(resolve, ms)
 }))
}

async function asyncPrint(val, ms) {
  await timeout(ms)
  console.log(val)
}

asyncPrint('hello world', 5000)
