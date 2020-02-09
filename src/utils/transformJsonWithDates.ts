import { mapValues } from 'lodash';
import { isISO8601 } from 'validator';

type Input = object | string | null | number | boolean;

export const transformJsonWithDates = (input: Input | Array<Input>): Input => {
  if (['boolean', 'number'].includes(typeof input)) {
    return input;
  }

  if (!input) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(transformJsonWithDates);
  }

  if (typeof input === 'object') {
    return mapValues(input, transformJsonWithDates);
  }

  if (typeof input === 'string') {
    const isDate = isISO8601(input);

    if (isDate) {
      return new Date(input);
    } else {
      return input;
    }
  }

  return input;
};
