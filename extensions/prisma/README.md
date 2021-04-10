# @loopback/prisma

This package enables Prisma integration with LoopBack 4.

## Installation

Install LoopbackPrismaComponent using `npm`;

```sh
$ [npm install | yarn add] @loopback/prisma
```

## Integration Scope

It is important to know what this package can and can't do right now, and in the future.

This package adds the following integration capabilities:

- Binding of Prisma models
- Connection management

The following are not supported yet, but are being considered:

- OpenAPI 3.0 schema generation
- Converting LoopBack 4 filters into Prisma queries
- Converting Prisma-style queries into LoopBack 4 filters
- Integration with `@loopback/logging`
- Integration with `@loopback/metrics` (blocked by https://github.com/prisma/prisma/issues/5129)

The following are not supported, and are not being considered:

- Use of LoopBack 4 models/repository/datastore with Prisma DSL

## Considerations

When using Prisma integration for LoopBack 4, there may be some important
factors or changes that should be considered:

- `lazyConnect` is disabled by default.

    This is to ensure that LoopBack fails fast with database connection issues.

- Limited support for architectures or operating systems

    The Prisma Client generator supports

## Basic Use

Configure and load LoopbackPrismaComponent in the application constructor
as shown below.

```ts
import {LoopbackPrismaComponent, LoopbackPrismaComponentOptions, DEFAULT__LOOPBACK_PRISMA_OPTIONS} from '@loopback/prisma';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: LoopbackPrismaComponentOptions = DEFAULT_LOOPBACK_PRISMA_OPTIONS;
    this.configure(LoopbackPrismaComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(LoopbackPrismaComponent);
    // ...
  }
  // ...
}
```
