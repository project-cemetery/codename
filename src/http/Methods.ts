import { head } from 'lodash';

import {
  pathKey,
  isHandlerKey,
  methodKey,
  HttpMethod,
  responseIsArrayKey,
  responseTypeKey,
  ArgumentType,
  argsKey,
} from './constants';
import { ArgumentDefinition } from './types';

type Class = new (...args: any) => any;

type ArrayHandlerResult<U> = U extends Class
  ? Promise<Array<InstanceType<U>>>
  : never;
type SiglerHandlerResult<T> = T extends Class
  ? Promise<InstanceType<T>>
  : never;

type Handler<T> = (
  ...args: any[]
) => T extends Array<infer U> ? ArrayHandlerResult<U> : SiglerHandlerResult<T>;

interface Settings<T> {
  response: T;
}

const createDecorator = (
  method: HttpMethod,
  forbiddenArgumentsTypes: ArgumentType[] = [],
) => <T>(path: string, { response }: Settings<T>) => (
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<Handler<T>>,
) => {
  const setMetadata = (key: symbol, value: any) =>
    Reflect.defineMetadata(key, value, target, propertyKey);

  const responseType = Array.isArray(response) ? head(response) : response;

  forbiddenArgumentsTypes.forEach(forbiddenArgumentType => {
    const args: ArgumentDefinition[] =
      Reflect.getOwnMetadata(argsKey, target, propertyKey) || [];

    const hasIllegalArgument = args.some(
      arg => arg.type === forbiddenArgumentType,
    );

    if (hasIllegalArgument) {
      // TODO: throw specific error
      throw new Error(
        `Cannot apply ${forbiddenArgumentType}-transformer to ${method}-method #${propertyKey.toString()}`,
      );
    }
  });

  setMetadata(isHandlerKey, true);
  setMetadata(pathKey, path);
  setMetadata(methodKey, method);
  setMetadata(responseIsArrayKey, Array.isArray(response));
  setMetadata(responseTypeKey, responseType);

  return descriptor;
};

export const Get = createDecorator(HttpMethod.Get, [ArgumentType.Body]);
export const Post = createDecorator(HttpMethod.Post);
export const Put = createDecorator(HttpMethod.Put);
export const Patch = createDecorator(HttpMethod.Patch);
export const Delete = createDecorator(HttpMethod.Delete, [ArgumentType.Body]);
