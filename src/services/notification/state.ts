declare const global: {
  __notificationServiceState?: {
    isInitialized: boolean;
    isInitializing: boolean;
    handlersRegistered: boolean;
    messageUnsubscribers: Array<() => void>;
    processedMessageIds: Map<string, number>;
    displayedCustomMessages: Map<string, number>;
    saveTimer?: ReturnType<typeof setInterval>;
  };
};

if (!global.__notificationServiceState) {
  global.__notificationServiceState = {
    isInitialized: false,
    isInitializing: false,
    handlersRegistered: false,
    messageUnsubscribers: [],
    processedMessageIds: new Map(),
    displayedCustomMessages: new Map(),
  };
}

export const state = global.__notificationServiceState;
