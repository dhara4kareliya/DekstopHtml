import { Get, Post } from "../http-client";
import { connectSocket, joinToTs, subscribe } from "../socket-client";

let userToken = getParamToken();
let tsData = undefined;

connect().catch(err => {
    console.error(err);
});
subscribe("onConnect", join);
subscribe("onDisconnect", connect);

async function connect () {
    if (userToken) {
        await getTs(userToken);
        if (!tsData.status)
            throw tsData.message;
        connectSocket(tsData.server);
    } else {
        login(getParam("u"), getParam("p"));
    }
}

/**
 * @returns {String} the token that was passed through the url.
 */
function getParamToken () {
    return getParam("t");
}

function getParam (paramName) {
    const matches = window.location.href.match(`${paramName}=([^&]+)`);
    if (matches)
        return matches[1];
}

export async function login (userId, password) {
    if (!userId)
        throw "No user ID";
    if (!password)
        throw "No password";
    let response = await Post("api/users/authenticate", {
        username: userId,
        password: password
    });
    
    response = JSON.parse(response);
    userToken = response.token;
    await getTs(userToken);
    connectSocket(tsData.server);
    return response;
}

export async function getTs (token) {
    let response = await Get(`Api/get_ts/${token}`);
    response = JSON.parse(response);
    tsData = response;
    console.log(tsData);
    return response;
}

export function join () {
    joinToTs(userToken, tsData.token);
}

window.getParamToken = getParamToken;