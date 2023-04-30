/**
 * A singleton is a software design pattern that restricts the instantiation of
 * a class to a singular instance. This file contains helpers for managing
 * singletons in JS.
 *
 * To learn more: https://en.wikipedia.org/wiki/Singleton_pattern
 */

import * as brand from '@/lib/brand';

const EMPTY_SINGLETON_SENTINEL: unique symbol = Symbol();

export type Factory<T> = () => T;
export type AsyncFactory<T> = Factory<Promise<T>>;

export type Getter<T> = brand.Brand<() => T, 'lib.singleton.Getter'>;
export type AsyncGetter<T> = Getter<Promise<T>>;

/**
 * Given a factory for a singleton, creates a getter for that singleton.
 *
 * Example Usage:
 *
 * ```ts
 * const getFoo = libSingleton.fromFactory(() => createFoo());
 * ```
 *
 * Note that the singleton will be lazily constructed on the first call to the
 * getter.
 *
 * @param factory The factory which constructs the singleton.
 * @param options.lazy When true, the singleton wont be constructed until the
 *     getter is called for the first time. When false the singleton will be
 *     constructed when `fromFactory` is called. By default is `true`.
 *
 * @return A getter to retrieve the singleton.
 */
export const fromFactory = <T>(
  factory: Factory<T>,
  options?: { lazy?: boolean }
): Getter<T> => {
  const { lazy = true } = options ?? {};

  // We use a unique value (`EMPTY_SINGLETON_SENTINEL`) to indicate that the
  // singleton has not been constructed so that the singleton could be `null` or
  // `undefined`.
  let singleton: T | typeof EMPTY_SINGLETON_SENTINEL = lazy
    ? EMPTY_SINGLETON_SENTINEL
    : factory();

  return brand.stamp(() => {
    if (singleton === EMPTY_SINGLETON_SENTINEL) {
      singleton = factory();
    }
    return singleton;
  });
};
