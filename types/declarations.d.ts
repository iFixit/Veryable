type RecursivePartial<T> = {
  [P in keyof T]?: Type[RecursivePartial<T[P]>];
};