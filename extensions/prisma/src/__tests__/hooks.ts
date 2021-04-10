import {sinon} from '@loopback/testlab';

exports.mochaHooks = {
  afterEach() {
    sinon.restore();
  },
};
