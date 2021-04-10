// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PrismaClient} from '.prisma/client';
import {BindingKey, CoreBindings} from '@loopback/core';
import {PrismaComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace PrismaBindings {
  const NAMESPACE = 'prisma';

  export const COMPONENT = BindingKey.create<PrismaComponent>(
    `${CoreBindings.COMPONENTS}.LoopbackPrismaComponent`,
  );

  export const PRISMA_CLIENT_INSTANCE = BindingKey.create<PrismaClient>(
    `${NAMESPACE}.client_instance`,
  );
}
