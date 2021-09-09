// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

function countReducer(state, action) {
  switch(action.type) {
    case 'increment': 
      return {
        ...state,
        count: action.data + state.count
      }
    default:
      return {
        ...state,
      }
  }
}

// lazy initialization
// This could be useful if our init function read into localStorage or something else that we wouldn’t want happening every re-render.
function init() {
  return {
   count: 4
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, { count: initialCount }, init)

  const { count } = state

  const increment = () => dispatch({type: 'increment', data: step})

  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
