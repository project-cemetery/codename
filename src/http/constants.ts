export const pathKey = Symbol('path');
export const isHandlerKey = Symbol('is_handler');
export const methodKey = Symbol('method');
export const responseIsArrayKey = Symbol('response_is_array_key');
export const responseTypeKey = Symbol('response_type_key');

export const argsKey = Symbol('query');

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export enum ArgumentType {
  Query = 'query',
  Parameter = 'parameter',
  Service = 'service',
  Body = 'body',
}

export enum StringFormat {
  Date,
}
