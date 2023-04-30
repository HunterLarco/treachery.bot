type Flavoring<FlavorT> = {
  _flavoring: {
    _style: 'Brand';
    _type: FlavorT;
  };
};

/**
 * Unlike a flavor which supports implicit casting from type `T` to a flavor of
 * type `T`, brands require explicit casting via `stampBrand`. This is useful
 * when you want to prevent accidentally converting primitives into Brands.
 */
export type Brand<T, FlavorT> = T & Flavoring<FlavorT>;

/**
 * Converts an object of type `T` to a Brand of type `T`.
 *
 * Note that this method can rebrand objects, as seen in the following example:
 *
 * ```ts
 * type Foo = tsExtensions.Brand<number, "foo">;
 * type Bar = tsExtensions.Brand<number, "bar">;
 *
 * const foo: Foo = stampBrand(100);
 *
 * // This compiles.
 * const bar: Bar = stampBrand(foo);
 *
 * // This does not.
 * const bar: Bar = foo;
 * ```
 */
export const stamp = <T, FlavorT>(value: T): Brand<T, FlavorT> =>
  (value as unknown) as Brand<T, FlavorT>;
