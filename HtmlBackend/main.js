import './style.css';
import "./UI/main-ui";
import "./services/game-server"
import { getSocket, subscribe } from './socket-client';

subscribe("onConnect", () => {
    window.socket = getSocket();
});