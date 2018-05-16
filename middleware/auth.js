export default function ({store, redirect}) {
  // console.log('middleware/auth.js ' + store.state.user.email)
  if (!store.state.user || !store.state.user.email) {
    console.log('11111111111111111')
    return redirect('/login')
  }
}
