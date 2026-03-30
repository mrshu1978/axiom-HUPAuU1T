// Singleton EventEmitter for React ↔ Phaser communication
import Phaser from 'phaser';

class EventBus {
  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  on(event, callback, context) {
    this.emitter.on(event, callback, context);
  }

  off(event, callback, context) {
    this.emitter.off(event, callback, context);
  }

  emit(event, ...args) {
    this.emitter.emit(event, ...args);
  }

  removeAllListeners(event) {
    this.emitter.removeAllListeners(event);
  }
}

// Export singleton instance
export default new EventBus();