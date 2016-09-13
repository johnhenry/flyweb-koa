/**
 * testWS - test context for proper WebSocket headers
 *
 * @param {context} - Koa 2 context object
 *
 * @returns {boolean} - an indicator as to whether or not propert headers ar present
 */
const testWS = (context) =>{
  if(context.headers['sec-websocket-key1'] && context.headers['sec-websocket-key2']){
      return true;
  }
  if(context.headers['sec-websocket-version']) return true;
  return false;
}

/**
 * testSSE - test context for proper SSE headers
 *
 * @param {context} - Koa 2 context object
 *
 * @returns {boolean} -
 */
const testSSE = (context)=>{
  return context.headers['accept'] === 'text/event-stream';
}

export {testWS, testSSE};
