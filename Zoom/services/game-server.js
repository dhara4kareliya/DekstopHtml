import { connectSocket, joinToMT, subscribe } from "../socket-client";

// let userToken = getParamToken();
let userToken = "564203170402";

let tsData = undefined;

const mtServerURL = "http://5.9.77.244:3005";

connect().catch(err => {
    console.error(err);
});

subscribe("onConnect", join);
subscribe("onDisconnect", connect);

async function connect () {
    if (userToken) {
        // await getTs(userToken);
        // if (!tsData.status)
            // throw tsData.message;
        connectSocket(mtServerURL);
    } else {
        // login("test_player", "123");
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

// export async function getTs (token) {
//     let response = await Get(`api.php?api=get_ts&t=${token}`);
//     response = JSON.parse(response);
//     tsData = response;
//     console.log(tsData);
//     return response;
// }

export function join () {
    joinToMT(userToken);
}

export function setServer (server, token) {
    tsData.server = server;
    tsData.token = token;
}

window.getParamToken = getParamToken;