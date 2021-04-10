import {Binding} from '@loopback/core';

export function createBindingFromPrismaModelName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelObj: any,
  modelName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Binding<any> {
  return new Binding(`prismaModels.${modelName}`).toDynamicValue(
    () => modelObj,
  );
}
