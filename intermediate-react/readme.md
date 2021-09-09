# React

links: 
* https://github.com/btholt/complete-intro-to-react-v5
* https://btholt.github.io/complete-intro-to-react-v5/hooks-in-depth

# Hooks

## UseEffect
Effects are how you recreate componentDidMount, componentDidUpdate, and componentDidUnmount from React. Inside useEffect, you can do any sort of sidd-effect type action that you would have previously done in one of React's lifecycle method. You can do things like fire AJAX requests, integrate with third party libraries (like a jQuery plugin), fire off some telemetry, or anything else that need to happen on the side for your component.

In our case, we want our component to continually update to show the time so we use setTimeout inside our effect. After the timeout calls the callback, it updates the state. After that render happens, it schedules another effect to happen, hence why it continues to update. You could provide a second parameter of [] to useEffect (after the function) which would make it only update once. This second array is a list of dependencies: only re-run this effect if one of these parameters changed. In our case, we want to run after every render so we don't give it this second parameter.

``` 
import React, { useState, useEffect } from "react";

const EffectComponent = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(setTime(new Date()), 1000);
    return () => clearTimeout(timer);
  });

  return <h1>useEffect Example: {time.toLocaleTimeString()}</h1>;
};

export default EffectComponent;
```

## UseContext

An early problem with the React problem is called "data tunneling" or "prop drilling". This is when you have a top level component (in our case the parent component) and a child component way down in the hierarchy that need the same data (like the user object.) We could pass that data down, parent-to-child, for each of the intermediary components but that sucks because now each of LevelTwo, LevelThree, and LevelFour all have to know about the user object even when they themselves don't need it, just their children. This is prop drilling: passing down this data in unnecessary intermediaries.

Enter context. Context allows you to create a wormhole where stuff goes in and a wormhole in a child component where that same data comes out and the stuff in the middle doesn't know it's there. Now that data is available anywhere inside of the UserContext.Provider. useContext just pulls that data out when given a Context object as a parameter. You don't have to use useState and useContext together (the data can be any shape, not just useState-shaped) but I find it convenient when child components need to be able to update the context as well.

In general, context adds a decent amount of complexity to an app. A bit of prop drilling is fine. Only put things in context that are truly application-wide state like user information or auth keys and then use local state for the rest.

Often you'll use context instead of Redux or another state store. You could get fancy and use useReducer and useContext together to get a pretty great approximation of Redux-like features.

```
import React, { useState, useContext, createContext } from "react";

const UserContext = createContext([
  {
    firstName: "Bob",
    lastName: "Bobberson",
    suffix: 1,
    email: "bobbobberson@example.com"
  },
  obj => obj
]);

const LevelFive = () => {
  const [user, setUser] = useContext(UserContext);

  return (
    <div>
      <h5>{`${user.firstName} ${user.lastName} the ${user.suffix} born`}</h5>
      <button
        onClick={() => {
          setUser(Object.assign({}, user, { suffix: user.suffix + 1 }));
        }}
      >
        Increment
      </button>
    </div>
  );
};

const LevelFour = () => (
  <div>
    <h4>fourth level</h4>
    <LevelFive />
  </div>
);

const LevelThree = () => (
  <div>
    <h3>third level</h3>
    <LevelFour />
  </div>
);

const LevelTwo = () => (
  <div>
    <h2>second level</h2>
    <LevelThree />
  </div>
);

const ContextComponent = () => {
  const userState = useState({
    firstName: "James",
    lastName: "Jameson",
    suffix: 1,
    email: "jamesjameson@example.com"
  });

  return (
    <UserContext.Provider value={userState}>
      <h1>first level</h1>
      <LevelTwo />
    </UserContext.Provider>
  );
};

export default ContextComponent;
```

## useRef

Refs are useful for several things, we'll explore two of the main reasons in these examples. I want to show you the first use case: how to emulate instance variables from React.

In order to understand why refs are useful, you need to understand how closures work. In our component, when a user clicks, it sets a timeout to log both the state and the ref's number after a second. One thing to keep in mind that the state and the ref's number are always the same. They are never out of lockstep since they're updated at the same time. However, since we delay the logging for a second, when it alerts the new values, it will capture what the state was when we first called the timeout (since it's held on to by the closure) but it will always log the current value since that ref is on an object that React consistently gives the same object back to you. Because it's the same object and the number is a property on the object, it will always be up to date and not subject to the closure's scope.

Why is this useful? It can be useful for things like holding on to setInterval and setTimeout IDs so they can be cleared later. Or any bit of statefulness that could change but you don't want it to cause a re-render when it does.

It's also useful for referencing DOM nodes directly and we'll see that a bit later in this section.

```
import React, { useState, useEffect, useRef } from "react";

const RefComponent = () => {
  const [stateNumber, setStateNumber] = useState(0);
  const numRef = useRef(0);

  function incrementAndDelayLogging() {
    setStateNumber(stateNumber + 1);
    numRef.current++;
    setTimeout(
      () => alert(`state: ${stateNumber} | ref: ${numRef.current}`),
      1000
    );
  }

  return (
    <div>
      <h1>useRef Example</h1>
      <button onClick={incrementAndDelayLogging}>delay logging</button>
      <h4>state: {stateNumber}</h4>
      <h4>ref: {numRef.current}</h4>
    </div>
  );
};

export default RefComponent;
```

## useReducer

useReducer allows us to do Redux-style reducers but inside a hook. Here, instead of having a bunch of functions to update our various properties, we have one reducer that handles all the updates based on an action type. This is a preferable approach if you have complex state updates or if you have a situation like this: all of the state updates are very similar so it makes sense to contain all of them in one function.
```
import React, { useReducer } from "react";

// fancy logic to make sure the number is between 0 and 255
const limitRGB = num => (num < 0 ? 0 : num > 255 ? 255 : num);

const step = 50;

const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT_R":
      return Object.assign({}, state, { r: limitRGB(state.r + step) });
    case "DECREMENT_R":
      return Object.assign({}, state, { r: limitRGB(state.r - step) });
    case "INCREMENT_G":
      return Object.assign({}, state, { g: limitRGB(state.g + step) });
    case "DECREMENT_G":
      return Object.assign({}, state, { g: limitRGB(state.g - step) });
    case "INCREMENT_B":
      return Object.assign({}, state, { b: limitRGB(state.b + step) });
    case "DECREMENT_B":
      return Object.assign({}, state, { b: limitRGB(state.b - step) });
    default:
      return state;
  }
};

const ReducerComponent = () => {
  const [{ r, g, b }, dispatch] = useReducer(reducer, { r: 0, g: 0, b: 0 });

  return (
    <div>
      <h1 style={{ color: `rgb(${r}, ${g}, ${b})` }}>useReducer Example</h1>
      <div>
        <span>r</span>
        <button onClick={() => dispatch({ type: "INCREMENT_R" })}>➕</button>
        <button onClick={() => dispatch({ type: "DECREMENT_R" })}>➖</button>
      </div>
      <div>
        <span>g</span>
        <button onClick={() => dispatch({ type: "INCREMENT_G" })}>➕</button>
        <button onClick={() => dispatch({ type: "DECREMENT_G" })}>➖</button>
      </div>
      <div>
        <span>b</span>
        <button onClick={() => dispatch({ type: "INCREMENT_B" })}>➕</button>
        <button onClick={() => dispatch({ type: "DECREMENT_B" })}>➖</button>
      </div>
    </div>
  );
};

export default ReducerComponent;

```

## useMemo

useMemo and useCallback are performance optimizations. Use them only when you already have a performance problem instead of pre-emptively. It adds unnecessary complexity otherwise.

useMemo memoizes expensive function calls so they only are re-evaluated when needed. I put in the fibonacci sequence in its recursive style to simulate this. All you need to know is that once you're calling fibonacci with 30+ it gets quite computationally expensive and not something you want to do unnecessarily as it will cause pauses and jank. It will now only call fibonacci if count changes and will just the previous, memoized answer if it hasn't changed.

If we didn't have the useMemo call, everytime I clicked on the title to cause the color to change from red to green or vice versa it'd unnecessarily recalculate the answer of fibonacci but because we did use useMemo it will only calculate it when num has changed.

Feel try to remove useMemo, get num to 40 or so, and then click the h1. It'll be slow.

```
import React, { useState, useMemo } from "react";

const fibonacci = n => {
  if (n <= 1) {
    return 1;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
};

const MemoComponent = () => {
  const [num, setNum] = useState(1);
  const [isGreen, setIsGreen] = useState(true);
  const fib = useMemo(() => fibonacci(num), [num]);

  return (
    <div>
      <h1
        onClick={() => setIsGreen(!isGreen)}
        style={{ color: isGreen ? "limegreen" : "crimson" }}
      >
        useMemo Example
      </h1>
      <h2>
        Fibonacci of {num} is {fib}
      </h2>
      <button onClick={() => setNum(num + 1)}>➕</button>
    </div>
  );
};

export default MemoComponent;

```

## useCallback 

useCallback is quite similar and indeed it's implemented with the same mechanisms as useMemo. Our goal is that ExpensiveComputationComponent only re-renders whenever it absolutely must. Typically whenever React detects a change higher-up in an app, it re-renders everything underneath it. This normally isn't a big deal because React is quite fast at normal things. However you can run into performance issues sometimes where some components are bad to re-render without reason.

In this case, we're using a new feature of React called React.memo. This is similar to PureComponent where a component will do a simple check on its props to see if they've changed and if not it will not re-render this component (or its children, which can bite you.) React.memo provides this functionality for function components. Given that, we need to make sure that the function itself given to ExpensiveComputationComponent is the same function every time. We can use useCallback to make sure that React is handing the same fibonacci to ExpensiveComputationComponent every time so it passes its React.memo check every single time. Now it's only if count changes will it actually re-render (as evidenced by the time.)

Try removing the useCallback call and see if you get the the count to 40+ that the page crawls as it updates every second.

```
import React, { useState, useEffect, useCallback, memo } from "react";

const ExpensiveComputationComponent = memo(({ compute, count }) => {
  return (
    <div>
      <h1>computed: {compute(count)}</h1>
      <h4>last re-render {new Date().toLocaleTimeString()}</h4>
    </div>
  );
});

const CallbackComponent = () => {
  const [time, setTime] = useState(new Date());
  const [count, setCount] = useState(1);
  useEffect(() => {
    const timer = setTimeout(setTime(new Date()), 1000);
    return () => clearTimeout(timer);
  });

  const fibonacci = n => {
    if (n <= 1) {
      return 1;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  return (
    <div>
      <h1>useCallback Example {time.toLocaleTimeString()}</h1>
      <button onClick={() => setCount(count + 1)}>
        current count: {count}
      </button>
      <ExpensiveComputationComponent
        compute={useCallback(fibonacci, [])}
        count={count}
      />
    </div>
  );
};

export default CallbackComponent;
```

## useLayoutEffect

useLayoutEffect is almost the same as useEffect except that it's synchronous to render as opposed to scheduled like useEffect is. If you're migrating from a class component to a hooks-using function component, this can be helpful too because useLayout runs at the same time as componentDidMount and componentDidUpdate whereas useEffect is scheduled after. This should be a temporary fix.

The only time you should be using useLayoutEffect is to measure DOM nodes for things like animations. In the example, I measure the textarea after every time you click on it (the onClick is to force a re-render.) This means you're running render twice but it's also necessary to be able to capture the correct measurments.

```
import React, { useState, useLayoutEffect, useRef } from "react";

const LayoutEffectComponent = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const el = useRef();

  useLayoutEffect(() => {
    setWidth(el.current.clientWidth);
    setHeight(el.current.clientHeight);
  });

  return (
    <div>
      <h1>useLayoutEffect Example</h1>
      <h2>textarea width: {width}px</h2>
      <h2>textarea height: {height}px</h2>
      <textarea
        onClick={() => {
          setWidth(0);
        }}
        ref={el}
      />
    </div>
  );
};

export default LayoutEffectComponent;
```

## useImperativeHandler


Here's one you will likely never directly use but you may use libraries that use it for you. We're going to use it in conjunction with another feature called forwardRef that again, you probably won't use but libraries will use on your behalf. Let's explain first what it does using the example and then we'll explain the moving parts.

In the example above, whenever you have an invalid form, it will immediately focus the the first field that's invalid. If you look at the code, ElaborateInput is a child element so the parent component shouldn't have any access to the input contained inside the component. Those components are black boxes to their parents. All they can do is pass in props. So how do we accomplish it then?

The first thing we use is useImperativeHandle. This allows us to customize methods on an object that is made available to the parents via the useRef API. Inside ElaborateInput we have two refs: one thate is the one that will be provided by the parent, forwarded through by wrapping the ElaborateInput component in a forwardRef call which will ten provide that second ref parameter in the function call, and then the inputRef which is being used to directly access the DOM so we can call focus on the DOM node directly.

From the parent, we assign via useRef a ref to each of the ElaborateInputs which is then forwarded on each on via the forwardRef. Now, on these refs inside the parent component we have those methods that we made inside the child so we can call them when we need to. In this case, we'll calling the focus when the parent knows that the child has an error.

Again, you probably use this directly but it's good to know it exists. Normally it's better to not use this hook and try to accomplish the same thing via props but sometimes it may be useful to break this one out.


```
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef
} from "react";

const ElaborateInput = forwardRef(
  ({ hasError, placeholder, value, update }, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
      return {
        focus() {
          inputRef.current.focus();
        }
      };
    });
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => update(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "5px 15px",
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor: hasError ? "crimson" : "#999",
          borderRadius: "5px",
          margin: "0 10px",
          textAlign: "center"
        }}
      />
    );
  }
);

const ImperativeHandleComponent = () => {
  const [city, setCity] = useState("Seattle");
  const [state, setState] = useState("WA");
  const [error, setError] = useState("");
  const cityEl = useRef();
  const stateEl = useRef();

  function validate() {
    // lol I found it on StackOverflow : https://stackoverflow.com/a/25677072
    if (
      !/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]+$/.test(
        city
      )
    ) {
      setError("city");
      cityEl.current.focus();
      return;
    }

    if (!/^[A-Z]{2}$/.test(state)) {
      setError("state");
      stateEl.current.focus();
      return;
    }

    setError("");
    alert("valid form!");
  }

  return (
    <div>
      <h1>useImperativeHandle Example</h1>
      <ElaborateInput
        hasError={error === "city"}
        placeholder={"City"}
        value={city}
        update={setCity}
        ref={cityEl}
      />
      <ElaborateInput
        hasError={error === "state"}
        placeholder={"State"}
        value={state}
        update={setState}
        ref={stateEl}
      />
      <button onClick={validate}>Validate Form</button>
    </div>
  );
};

export default ImperativeHandleComponent;
```


# Forwarding refs to DOM components

Given the FancyButton component: 
```
function FancyButton(props) {
  return (
    <button className="FancyButton">
      {props.children}
    </button>
  );
}
```

Another componets using it NORMALLY won't need to get a ref. 
And that's a good thing. This encapulation however desired in high
level components, it can be a downside to the leafs components. As they tend to be very reusable, such as FancyButton. 
These compoents are usually used as DOM input and button elements, therefore accessing them to manager focus, selection or animations might be required. 


Forwarding a ref is a opt-in resource that allows for some compoents to take a ref and pass it down bellow. 

In the following exampĺe FancyButton uses React.forwardRed to get a ref passed to it, and then it forwards it to button tag which it renders. 

```
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>
```

As a result of that, components that use FancyButton will gain a reference to the DOM node <button> and may access it if necessary. 
