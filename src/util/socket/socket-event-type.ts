export enum ServerToClientListenerType {
    ROOM_BROADCAST = "roomBroadcast",
    ROOM_MESSAGE = "roomMessage",
    USER_DISCONNECTED = "userDisconnected",
    ROOM_DATA = "roomData",

    CONNECT_ERROR = "connectError",

    CONNECT = "connect",
    DISCONNECT = "disconnect",
    SESSION_TOKEN = "sessionToken",

    INITIALIZE_ENV = "initializeEnviroment",
}
export enum ClientToServerListenerType {
    ROOM_BROADCAST = "broadcastRoomData",
    USER_JOINED = "joinRoom",
    USER_LEFT = "leaveRoom",
    SEND_TO_ROOM = "sendToRoom",

    GET_SOCKET_INFO = "getSocketInfo",
    GET_CONNECTED_CLIENTS = "getConnectedClients",
    GET_ROOM_INFO = "getRoomInfo",
    GET_ROOM_LIST = "getRoomList",

    INITIALIZE_ENV = "initializeEnviroment",
    HEALTH_CHECK = "healthCheck",
}