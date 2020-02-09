import { HttpMethod, ArgumentType, StringFormat } from './constants';
import { RequestHandler } from 'fastify';

export interface Endpoint {
  method: HttpMethod;
  path: string;
  handler: RequestHandler;
}

export interface ArgumentSettings {
  format?: StringFormat;
}

export interface ArgumentDefinition {
  type: ArgumentType;
  name: any;
  index: number;
  required: boolean;
  format?: StringFormat;
}
