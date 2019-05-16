import { MeteorX } from 'meteor/lamhieu:meteorx';

import MethodTracer from './MethodTracer';
import MethodCache from './MethodCache';

const wrapSession = ({ logStats }) => {
  const sessionProto = MeteorX.Session.prototype;

  // adding the method id to the current fiber
  const originalMethodHandler = sessionProto.protocol_handlers.method;
  sessionProto.protocol_handlers.method = function (...args) {
    const [msg] = args;

    MethodTracer.setMethodId(msg.id);

    return originalMethodHandler.apply(this, args);
  };

  // Clear cache at the end of a method
  const originalSend = sessionProto.send;
  sessionProto.send = function (...args) {
    const methodId = MethodTracer.getMethodId();

    if (methodId) {
      MethodCache.clearCache( logStats);
    }

    return originalSend.apply(this, args);
  };
};

export default wrapSession;
