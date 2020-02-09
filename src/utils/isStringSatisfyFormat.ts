import { StringFormat } from '&codename/http/constants';

const validateDateString = (value: string | null) => {
  // TODO: add real validation
  return true;
};

export const isStringSatisfyFormat = (
  value: string | null,
  format: StringFormat,
) => {
  switch (format) {
    case StringFormat.Date:
      return validateDateString(value);
    default:
      return true;
  }
};
