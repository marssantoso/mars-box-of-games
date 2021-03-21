import { Coord } from '../types';

export const create2dArray = (rows: number, cols: number): Coord[][] => {
  return Array.from(new Array(rows).keys()).map((y) => Array.from(new Array(cols).keys()).map((x) => ({ x, y })));
};

export const slice = <T extends unknown>(array: Array<T>, start: number, end: number): Array<T> => {
  let length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  start = start == null ? 0 : start;
  end = end === undefined ? length : end;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : (end - start) >>> 0;
  start >>>= 0;

  let index = -1;
  const result = new Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
};

export const sampleSize = <T extends unknown>(array: Array<T>, n: number): Array<T> => {
  n = n == null ? 1 : n;
  const length = array == null ? 0 : array.length;
  if (!length || n < 1) return [];

  n = n > length ? length : n;
  let index = -1;
  const lastIndex = length - 1;
  const result = [...array];

  while (++index < n) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return slice(result, 0, n);
};

export const flatten = <T extends unknown>(array: T[][]): T[] => {
  return array.reduce((prev, curr) => prev.concat(curr), []);
};

export const padTime = (time: number): string => time.toString().padStart(2, '0');
