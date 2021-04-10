// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingCreationPolicy,
  BindingScope,
  Component,
  config,
  configBindingKeyFor,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {Prisma, PrismaClient} from '@prisma/client';
import {createBindingFromPrismaModelName} from './helpers/create-binding-from-prisma-model-name';
import {PrismaBindings as PrismaBindings} from './keys';
import {DEFAULT_PRISMA_COMPONENT_OPTIONS, PrismaOptions} from './types';

/**
 * The component used to register the necessary artifacts for Prisma integration
 * with LoopBack 4.
 *
 * @remarks
 * This component was designed to be registered with
 * {@link Application.component} or used standalone—This is to enable more
 * complex use-cases and easier testing.
 *
 * Check the {@link PrismaComponent:constructor} tsdoc for in-depth
 * documentation on instances.
 *
 * @decorator `@injectable({tags: {[ContextTags.KEY]: PrismaBindings.COMPONENT}})`
 * @decorator `@lifecycleObserver('datasource')`
 */
@injectable({
  tags: {[ContextTags.KEY]: PrismaBindings.COMPONENT},
  scope: BindingScope.SINGLETON,
})
@lifeCycleObserver('datasource')
export class PrismaComponent implements Component, LifeCycleObserver {
  @inject.binding(configBindingKeyFor(PrismaBindings.COMPONENT), {
    bindingCreation: BindingCreationPolicy.CREATE_IF_NOT_BOUND,
  })
  private _optionsBinding: Binding<PrismaOptions>;
  private _isInitialized = false;

  get options() {
    return this._options;
  }

  set options(value) {
    if (this._isInitialized)
      throw new Error(
        'Configuration cannot be changed after component initialization.',
      );
    this._application.configure(PrismaBindings.COMPONENT).to(value);
  }

  /**
   * Returns `true` if {@link PrismaComponent.init} has been called.
   *
   * @remarks
   * This is useful for ensuring that {@link PrismaComponent.init} is called
   * exactly once outside of {@link @loopback/core#LifeCycleObserverRegistry}
   * (e.g. as a prerequisite before calling {@link PrismaComponent.start}).
   */
  get isInitialized() {
    return this._isInitialized;
  }

  /**
   * Returns the {@link PrismaClient} instance used by this component.
   *
   * @remarks
   * If you have access to the {@link Application} instance, it's usually better
   * to resolve the {@link PrismaBindings.PRISMA_CLIENT_INSTANCE} binding
   * instead.
   */
  get prismaClient() {
    return this._prismaClient;
  }

  /**
   * Sets the {@link PrismaClient} instance used by this component.
   *
   * @remarks
   * If you have access to the {@link Application} instance, it's usually better
   * to resolve the {@link PrismaBindings.PRISMA_CLIENT_INSTANCE} binding
   * instead.
   *
   * ## Post-initialization restricitons
   * After {@link PrismaComponent.init} is called, attempting to set
   * {@link PrismaClient} will result in an error being thrown. Be sure to check
   * if {@link PrismaComponent.isInitialized} is `false`.
   */
  set prismaClient(value) {
    if (this.isInitialized)
      throw new Error(
        'Configuration cannot be changed after component initialization.',
      );

    this._prismaClient = value;
  }

  /**
   * @remarks
   * ## Providing custom PrismaClient
   * It is possible to provide a custom PrismaClient instance by either:
   *
   * - Providing a {@link PrismaClient} instance into the constructor
   * - Binding a {@link PrismaClient} instance to
   *     {@link PrismaBindings.PRISMA_CLIENT_INSTANCE} before
   *     {@link PrismaComponent.init}.
   *
   * Note that if a {@link PrismaClient} instance is provided through both
   * aforementioned methods, they must reference the same instance. Otherwise,
   * an error will be thrown when {@link PrismaComponent:constructor} or
   * {@link PrismaComponent.start} is called.
   *
   * ## Post-initialization restrictions
   * After `init()` is successfully called, the following scenarios will throw
   * an error:
   *
   * - Calling {@link PrismaComponent.init} again.
   * - Changing {@link PrismaComponent.options} with {@link PrismaComponent.option}.
   * - Manipulating {@link PrismaBindings.COMPONENT} configuration binding.
   *
   * Furthermore, the following bindings will be locked:
   *
   * - Configuration binding key of {@link PrismaBindings.COMPONENT}
   * - {@link PrismaBindings.PRISMA_CLIENT_INSTANCE}
   *
   * These restrictions are in place as {@link PrismaClient} would have already
   * been initialized.
   *
   * ## De-initialization
   * To de-initialize, replace the current instance with a new instance.
   *
   * @param _application An instance of a generic or specialized {@link Application}.
   * @param _prismaClient An instance of {@link PrismaClient}.
   * @param _options Initial component and {@link PrismaClient} configuration.
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private _application: Application,
    @inject(PrismaBindings.PRISMA_CLIENT_INSTANCE, {optional: true})
    private _prismaClient?: PrismaClient,
    @config()
    private _options: PrismaOptions = DEFAULT_PRISMA_COMPONENT_OPTIONS,
  ) {
    this._ensureNoConflictingPrismaProvidedAndBound();
    this._optionsBinding.on('changed', event => {
      if (this._isInitialized)
        throw new Error(
          'Configuration cannot be changed after component initialization.',
        );

      this._options = this._application.getSync(event.binding.key);
    });
  }

  /**
   * Checks if a conflicting instance of Prisma is provided in the constructor
   * and bound to context.
   */
  private _ensureNoConflictingPrismaProvidedAndBound(): boolean {
    if (
      this._prismaClient &&
      this._application.getBinding(PrismaBindings.PRISMA_CLIENT_INSTANCE, {
        optional: true,
      }) &&
      this._prismaClient ===
        this._application.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE)
    ) {
      throw new Error(
        'An Prisma Client instance was provided whilst a different instance was bound to context.',
      );
    }
    return false;
  }

  init() {
    if (this._isInitialized)
      throw new Error('This component instnace has already been initialized.');

    this._ensureNoConflictingPrismaProvidedAndBound();

    if (this._prismaClient) {
      const prismaClientBinding = this._application.getBinding(
        PrismaBindings.PRISMA_CLIENT_INSTANCE,
        {optional: true},
      );

      if (!prismaClientBinding)
        this._application
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .toDynamicValue(() => this._prismaClient);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {lazyConnect, ...prismaOptions} = this._options;
      this._prismaClient = new PrismaClient(prismaOptions);
    }

    const prismaClientBinding = this._application.getBinding(
      PrismaBindings.PRISMA_CLIENT_INSTANCE,
    );

    // Lock the these bindings as changes after initialization are not
    // supported.
    this._optionsBinding.lock();
    prismaClientBinding.lock();

    // Bind models
    for (const modelName in Prisma.ModelName) {
      this._application.add(
        createBindingFromPrismaModelName(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._prismaClient[modelName.toLowerCase()],
          modelName,
        ),
      );
    }

    this._isInitialized = true;
  }

  /**
   * Start Prisma datasource connections, if needed.
   *
   * @remarks
   * If {@link PrismaOptions.lazyConnect} is `true`,
   * {@link PrismaClient.$connect} is called. Otherwise, this is a noop
   * function.
   *
   * @returns `undefined` if {@link PrismaOptions.lazyConnect} is `true`, else
   *     {@link PrismaClient.$connect} promise.
   */
  start() {
    if (!this._isInitialized) throw new Error('Component must be initialized!');
    if (this._options.lazyConnect) return;
    return this._prismaClient!.$connect();
  }

  stop() {
    return this._prismaClient!.$disconnect();
  }
}
