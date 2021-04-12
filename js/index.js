new Promise((res) => {
  console.log('1')
  res(2)
}).then(data => console.log(data))

process.nextTick(() => {
  console.log(3)
})