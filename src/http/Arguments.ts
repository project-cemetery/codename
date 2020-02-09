import { argsKey, ArgumentType, pathKey, methodKey } from './constants';
import { ArgumentDefinition, ArgumentSettings } from './types';

const stringArgumentTypeIsValid = (argumentType: any) =>
  [String, Object].includes(argumentType);
const stringArgumentIsRequired = (argumentType: any) => argumentType === String;

export const Query = (name: string, settings?: ArgumentSettings) => (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const existionsDefinitions: ArgumentDefinition[] =
    Reflect.getOwnMetadata(argsKey, target, propertyKey) || [];

  const argumentType = Reflect.getMetadata(
    'design:paramtypes',
    target,
    propertyKey,
  )[parameterIndex];

  if (!stringArgumentTypeIsValid(argumentType)) {
    // TODO: throw specific error
    throw new Error(
      `Query must have type "string" or "string | null", but has ${argumentType.name}`,
    );
  }

  existionsDefinitions.push({
    index: parameterIndex,
    name,
    type: ArgumentType.Query,
    required: stringArgumentIsRequired(argumentType),
    format: settings?.format,
  });

  Reflect.defineMetadata(argsKey, existionsDefinitions, target, propertyKey);
};

export const Parameter = (name: string, settings?: ArgumentSettings) => (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const existionsDefinitions: ArgumentDefinition[] =
    Reflect.getOwnMetadata(argsKey, target, propertyKey) || [];

  const argumentType = Reflect.getMetadata(
    'design:paramtypes',
    target,
    propertyKey,
  )[parameterIndex];

  if (!stringArgumentTypeIsValid(argumentType)) {
    // TODO: throw specific error
    throw new Error(
      `Parameter must have type "string" or "string | null", but has ${argumentType.name}`,
    );
  }

  existionsDefinitions.push({
    index: parameterIndex,
    name,
    type: ArgumentType.Parameter,
    required: stringArgumentIsRequired(argumentType),
    format: settings?.format,
  });

  Reflect.defineMetadata(argsKey, existionsDefinitions, target, propertyKey);
};

export const Body = () => (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const existionsDefinitions: ArgumentDefinition[] =
    Reflect.getOwnMetadata(argsKey, target, propertyKey) || [];

  const argumentType = Reflect.getMetadata(
    'design:paramtypes',
    target,
    propertyKey,
  )[parameterIndex];

  existionsDefinitions.push({
    index: parameterIndex,
    name: argumentType,
    type: ArgumentType.Body,
    required: true,
  });

  Reflect.defineMetadata(argsKey, existionsDefinitions, target, propertyKey);
};

export const InjectService = () => (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => {
  const existionsDefinitions: ArgumentDefinition[] =
    Reflect.getOwnMetadata(argsKey, target, propertyKey) || [];

  const argumentType = Reflect.getMetadata(
    'design:paramtypes',
    target,
    propertyKey,
  )[parameterIndex];

  existionsDefinitions.push({
    index: parameterIndex,
    name: argumentType,
    type: ArgumentType.Service,
    required: false,
  });

  Reflect.defineMetadata(argsKey, existionsDefinitions, target, propertyKey);
};
