import fastify, { FastifyInstance, RequestHandler } from 'fastify';
import { flatMap, range, isEmpty } from 'lodash';
import { container } from 'tsyringe';
import klona from 'klona';
import { validate, ValidationError, validateOrReject } from 'class-validator';

import {
  isHandlerKey,
  HttpMethod,
  methodKey,
  pathKey,
  argsKey,
  ArgumentType,
} from '&codename/http/constants';
import { Endpoint, ArgumentDefinition } from '&codename/http/types';
import { getClass } from '&codename/utils/getClass';
import { transformJsonWithDates } from '&codename/utils/transformJsonWithDates';
import { isStringSatisfyFormat } from '&codename/utils/isStringSatisfyFormat';
import { BackgroundService } from './BackgroundService';

class Application {
  private readonly app: FastifyInstance;
  private readonly backgroundServices: BackgroundService[];

  constructor(
    controllersClasses: Function[],
    backgroundServicesClasses: Function[],
  ) {
    this.app = fastify();

    const endpoints = this.getEndpoints(
      controllersClasses.map(
        controllersClass =>
          container.resolve(controllersClass as any) as object,
      ),
    );

    this.backgroundServices = backgroundServicesClasses.map(
      serviceClass =>
        container.resolve(serviceClass as any) as BackgroundService,
    );

    this.getMethodEndpoints(endpoints, HttpMethod.Get).forEach(endpoint => {
      this.app.get(endpoint.path, endpoint.handler);
    });

    this.getMethodEndpoints(endpoints, HttpMethod.Post).forEach(endpoint => {
      this.app.post(endpoint.path, endpoint.handler);
    });

    this.getMethodEndpoints(endpoints, HttpMethod.Patch).forEach(endpoint => {
      this.app.patch(endpoint.path, endpoint.handler);
    });

    this.getMethodEndpoints(endpoints, HttpMethod.Put).forEach(endpoint => {
      this.app.put(endpoint.path, endpoint.handler);
    });

    this.getMethodEndpoints(endpoints, HttpMethod.Delete).forEach(endpoint => {
      this.app.delete(endpoint.path, endpoint.handler);
    });
  }

  async start(port: number = 3000) {
    await Promise.all(
      this.backgroundServices.map(async service => {
        if (service.onStart) {
          await service.onStart();
        }
      }),
    );

    return await new Promise((resolve, reject) =>
      this.app.listen(port, (err, address) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(address);
      }),
    );
  }

  private getEndpoints(controllers: object[]): Endpoint[] {
    const getAllMethods = (obj: object) =>
      Object.getOwnPropertyNames(getClass(obj));

    return flatMap(controllers, controller =>
      getAllMethods(controller)
        .filter(method =>
          Reflect.getOwnMetadata(isHandlerKey, getClass(controller), method),
        )
        .map(method => ({
          method: Reflect.getOwnMetadata(
            methodKey,
            getClass(controller),
            method,
          ),
          path: Reflect.getOwnMetadata(pathKey, getClass(controller), method),
          handler: this.createHandler(controller, method),
        })),
    );
  }

  private createHandler = (
    controller: object,
    method: string,
  ): RequestHandler => {
    const handler = controller[method].bind(controller);

    const args: ArgumentDefinition[] | undefined = Reflect.getOwnMetadata(
      argsKey,
      getClass(controller),
      method,
    );

    if (!args || args.length === 0) {
      return () => handler();
    }

    const getDefinition = (index: number) =>
      args.find(def => def.index === index);

    const lastArg = Math.max(...args.map(({ index }) => index));

    return async ({ query, params, body }, reply) => {
      const args: any[] = [];
      const validationErrors: ValidationError[] = [];

      for (const index of range(lastArg + 1)) {
        const definition = getDefinition(index);

        if (!definition) {
          args.push(null);
          return;
        }

        let arg = null;
        switch (definition.type) {
          case ArgumentType.Query:
            arg = query[definition.name];
            break;
          case ArgumentType.Parameter:
            arg = params[definition.name];
            break;
          case ArgumentType.Body:
            const prototype = Object.create(definition.name.prototype);
            const bodyArg = Object.setPrototypeOf(
              transformJsonWithDates(klona(body)),
              prototype,
            );
            const newErrors = await validate(bodyArg);
            validationErrors.push(...newErrors);
            arg = bodyArg;
            break;
          case ArgumentType.Service:
            arg = container.resolve(definition.name);
            break;
        }

        if (definition.required && isEmpty(arg)) {
          return reply
            .status(400)
            .send({
              code: 400,
              message: 'Bad request',
              cause: `Required ${definition.type} "${definition.name}" not found`,
            })
            .send();
        }

        if (
          definition.format &&
          !isStringSatisfyFormat(arg, definition.format)
        ) {
          return reply
            .status(400)
            .send({
              code: 400,
              message: 'Bad request',
              cause: `Invalid format of ${definition.type} "${definition.name}".`,
              details: `"${arg}" received, ${definition.format} required.`,
            })
            .send();
        }

        if (validationErrors.length > 0) {
          return reply
            .status(400)
            .send({
              code: 400,
              message: 'Bad request',
              cause: `Body validation failed`,
              details: validationErrors,
            })
            .send();
        }

        args.push(arg || null);
      }

      return handler(...args);
    };
  };

  private getMethodEndpoints(
    endpoints: Endpoint[],
    method: HttpMethod,
  ): Endpoint[] {
    return endpoints.filter(endpoint => endpoint.method === method);
  }
}

interface ApplicationSettings {
  controllers: Function[];
  backgroundServices: Function[];
}

export const createApp = ({
  controllers,
  backgroundServices,
}: ApplicationSettings) => new Application(controllers, backgroundServices);
