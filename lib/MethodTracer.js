import Fibers from 'fibers';

class MethodTracer {
  setMethodId(id) {
    Fibers.current.__methodInfo = { id };
  }

  setMethodInfo(info) {
    const currentFiber = Fibers.current;
    if (currentFiber && currentFiber.__methodInfo) {
      // Object.assign(currentFiber.__methodInfo, info);
      currentFiber.__methodInfo = { ...currentFiber.__methodInfo, ...info };
    }
  }

  getMethodId() {
    const currentFiber = Fibers.current;
    if (currentFiber) {
      return currentFiber.__methodInfo && currentFiber.__methodInfo.id;
    }
  }

  getMethodInfo() {
    const currentFiber = Fibers.current;
    if (currentFiber) {
      return currentFiber.__methodInfo;
    }

    return {};
  }
}

export default new MethodTracer();
