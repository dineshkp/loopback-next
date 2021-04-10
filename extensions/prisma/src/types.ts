// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Prisma} from '.prisma/client';

/**
 * Interface defining the options accepted by {@link ./component/PrismaComponent}.
 *
 * @remarks
 * It accepts all values of {@link Prisma.PrismaClientOptions} and
 * `lazyConnect`.
 *
 *
 * ## lazyConnect
 * The `lazyConnect` option emulates the
 * behaviour of LoopBack 4-native connectors to only establish a connection upon
 * the first database request.
 *
 * Setting `lazyConnect: true` will prevent the explicit calling of
 * `PrismaClient.$connect()`, and instead fallback to Prisma's default
 * behaviour.
 *
 * ## Existing PrismaClient
 * If an existing PrismaClient is bound during datasource lifecycle
 * initialisation, only `lazyConnect` will be honored.
 *
 * @defaultValue {@link DEFAULT_PRISMA_COMPONENT_OPTIONS}
 */
export interface PrismaOptions extends Prisma.PrismaClientOptions {
  lazyConnect: boolean;
}

/**
 * The default options used by {@link ./component/PrismaComponent}.
 */
export const DEFAULT_PRISMA_COMPONENT_OPTIONS: PrismaOptions = {
  lazyConnect: false,
};

export namespace PrismaGenericTypes {
  export interface Filter {
    select?: SelectFilter;
    orderBy?: OrderByFilter;
  }

  export type SelectFilter = Record<string, boolean>;

  export type OrderByFilter = Record<string, 'asc' | 'desc'>;
}
