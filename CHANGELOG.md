## 0.15.0

This is a big one with many breaking (but good) changes, so see https://legendapp.com/dev/state/migrating for more details. We're making a lot of breaking changes all once so that we can start to stabilize towards a 1.0.

- Breaking: There are now three levels of safety: Unsafe, Default, Safe. "Default" is new and allows direct assignment to primitives but prevents directly assigning to everything else. The previous default behavior was "Unsafe" so you may see errors if you were directly assigning to objects/arrays/etc... Replace those with `.set(...)` or pass in `false` as the second parameter to `observable` to go back to "Unsafe" mode.
- Breaking: Renamed `ref()` to `obs()`
- Breaking: The array optimizations are now opt-in, because they can potentially have some unexpected behavior if modifying the DOM externally. You can enable them by using the `For` component with the `optimized` prop.
- Breaking: Replaced `shallow` with a `Tracking` namespace, to add Optimized tracking. Change `shallow` to `Tracking.shallow` to get the previous behavior, or `Tracking.optimized` on an array to get the optimized behavior.
- Breaking: Changed `observableBatcher` to export the batching functions directly instead of as a namespace
- Breaking: Removed `onChangeShallow`, `onTrue`, `onEquals`, and `onHasValue` in favor of the new `effect` and `when` which automatically track any accessed observables.
- Breaking: Renamed primitive observables' wrapping value from `current` to `value`.
- Breaking: Renamed `observableComputed` to `computed` and `observableEvent` to `event`.
- Breaking: Renamed the bindable components from `LS` to `Bindable` and they now export from '@legendapp/state/react-components' or '@legendapp/state/react-native-components'
- Feat: Observable primitives can be rendered directly in React
- Feat: Added `observe`, which can run arbitrary code while tracking all accessed observables.
- Feat: Added `when`, which can run functions when the predicate returns a truthy value.
- Feat: Added `Switch` component
- Feat: Support creating an observable with a Promise as a value, which will update itself when the promise resolves.
- Feat: A `lockObservable` function to prevent writes
- Fix: Observables with arrays at the root were not notifying listeners properly
- Fix: Accessing `current` (now `value`) on a primitive observable was not tracking as expected
- Fix: Improve types of Memo/Computed/Show components so that they require functions by default, and are expanded to not need functions when referencing the babel types.

## 0.14.5
- Feat: Allow passing observables directly to Show
- Fix: Usage of old observe() when if prop is an observable

## 0.14.4
- Fix: Some issues in remote persistence plugins (not yet released)

## 0.14.3
- Fix: Some issues in remote persistence plugins (not yet released)

## 0.14.2
- Fix: Old versions of React Native were crashing because of using `React.` without importing it

## 0.14.1
- Fix: `For` component with children re-renders with the latest children correctly

## 0.14.0
- Feature: A `For` component for easy rendering with array optimizations
- Fix: Improve performance of observer
- Fix: Support `_id` or `__id` field names for array optimizations
- Fix: Mixing shallow and non-shallow listeners in a component could have not mixed correctly

## 0.13.2
- Types: Renamed exported types for improved clarity

## 0.13.1
- Fix: Exported components were losing className/style when not using bind prop

## 0.13.0
- Breaking Change: Removed observe() and prop(), favoring get() and ref(). get() tracks by default and ref() does not.
- Feat: Support ref to a path on an undefined value
- Fix: A crash when calling get() on an observable with undefined parents
- Types: Enforce bind prop to not be a primitive

## 0.12.1
- Types: Improved types of exported components

## 0.12.0
- Feat: Allow direct assignment, with warnings to catch accidental errors, and an optional "safe" mode
- Feat: input components with `bind` prop that automatically binds an observable to value and onChange
- Feat: Support keyed ref: `obs.ref('key')`
- Feat: `onChange` has a `runImmediately` option
- Fix: `.ref()` and `.get()` inside an `observer` do reference counting so they don't untrack too aggressively
- Fix: `delete()` was notifying listeners with the value undefined, but the key not yet deleted
- Fix: `observer` was sometimes missing updates occurring between render and mount

## 0.11.0-beta.7
- Fix: New set option with function parameter was breaking persistence
- Fix: Component useEffect was getting called before observer could listen for changes

## 0.11.0-beta.6
- Fix: Babel plugin adds imports only once, only if not already imported

## 0.11.0-beta.5
- Feat: `set()` can take a function to easily compute it relative to the previous value

## 0.11.0-beta.4
- Feat: Added `traceListeners` and `traceUpdates` functions (exported from @legendapp/state/trace). Call them within an observer. `traceListeners` logs the path of all tracked observables, while `traceUpdates` logs details of each observable change that causes a render.

## 0.11.0-beta.3
- Fix: observer was not working the first time in StrictMode
- Fix: observer was not cleaning up old listeners when the the tracked observables changed
