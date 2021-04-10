import {Application, BindingScope} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {expect, sinon} from '@loopback/testlab';
import {PrismaClient} from '@prisma/client';
import assert from 'assert';
import {PrismaBindings} from '../../';
import {PrismaComponent} from '../../component';

describe('Prisma Component', () => {
  let app: Application;

  before(() => {
    sinon.stub(PrismaClient);
  });

  beforeEach(() => {
    app = new (class extends RepositoryMixin(Application) {})();
  });
  afterEach(() => {
    sinon.resetHistory();
  });

  describe('datasource lifecycle initialization', () => {
    it('creates new locked singleton Prisma Client instance', async () => {
      app.component(PrismaComponent);
      expect(
        app.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE),
      ).to.be.instanceOf(PrismaClient);
      await app.init();
      assert(app.getBinding(PrismaBindings.PRISMA_CLIENT_INSTANCE).isLocked);
    });

    it('does not override existing singleton Prisma Client instance', async () => {
      app
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .toClass(PrismaClient)
        .inScope(BindingScope.SINGLETON);
      const expectedPrismaClientInstance = app.getSync(
        PrismaBindings.PRISMA_CLIENT_INSTANCE,
      );
      app.component(PrismaComponent);
      await app.init();
      expect(app.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE)).to.equal(
        expectedPrismaClientInstance,
      );
    });

    it('locks existing singleton Prisma Client instance', async () => {
      app
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .toClass(PrismaClient)
        .inScope(BindingScope.SINGLETON);
      app.component(PrismaComponent);
      await app.init();
      assert(app.getBinding(PrismaBindings.PRISMA_CLIENT_INSTANCE).isLocked);
    });
  });
});
