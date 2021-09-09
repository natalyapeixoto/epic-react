// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'

import {
  PokemonDataView,
  PokemonErrorBoundary,
  PokemonForm,
  PokemonInfoFallback,
  fetchPokemon,
} from '../pokemon'

const useSafeDispatch = (dispatch) => {
  const mountedRef = React.useRef(false)
  
  React.useLayoutEffect(() => {
    mountedRef.current = true
    return () => mountedRef.current = false
  },[])

  return React.useCallback(
    (...args) => {
      mountedRef.current ? dispatch(...args) : void 0
    },
    [dispatch],
  )
}
// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
  
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
    
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
   
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const useAsync = (initialState) => {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status:  'idle',
    data: null,
    error: null,
    ...initialState
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = React.useCallback(
    promise => {
      dispatch({type: 'pending'})
      promise.then(
        data => {
          dispatch({type: 'resolved', data})
        },
        error => {
          dispatch({type: 'rejected', error})
        },
      )}, [dispatch])
  

  return {...state, run}
}

function PokemonInfo({pokemonName}) {
  // 🐨 move both the useReducer and useEffect hooks to a custom hook called useAsync
  // here's how you use it:
  const {data, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])


  if (status === 'idle') {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={data} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  
  const pokeRef = React.useRef(null)
  React.useEffect(() => {
    pokeRef.current = 'abrobro'
    console.log(pokeRef.current)
  })
  
  const ref = React.useRef(true)
  if(ref.current) {
    console.log('é aqio')
  }
  ref.current = false
  
  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm ref={pokeRef} pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
