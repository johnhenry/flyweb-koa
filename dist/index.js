'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var ws = _interopDefault(require('ws'));
var stream = require('stream');
var statusCodes = _interopDefault(require('http-status-codes'));

// var WritableStream = require("stream").Writable;
// var statusCodes = require("http-status-codes");
// var ws = require("ws");
class Response extends stream.Writable{
	constructor(socket,head){
		super();
		this.upgraded = false;
		this.socket = socket;
		this.head = head;
		this.finished = false;
		this.headersSent = false;
		this.headers = {};
		this.statusCode = 200;
		this.statusMessage = undefined;
		this.sendDate = true;

		this.on("finish",function(){
			this._write(null,null,function(){});
			this.finished = true;
		});
	}
	_write(chunk,encoding,callback){
		if(!this.headersSent) this.writeHead(this.statusCode,this.statusMessage,this.headers);
		if(this.upgraded){
			if(this.websocket && !chunk && this.websocket.readyState == ws.OPEN){
				this.websocket.close(this.statusCode == 500 ?1011:1000);
			}
			callback();
		}else{
			if(!chunk){
				this.socket.end(callback);
			}else{
				this.socket.write(chunk,encoding,callback);
			}
		}
	}

	addTrailers(){

	}

	getHeader(name){
		return this.headers[name];
	}

	removeHeader(name){
		if(this.headersSent) throw new Error("Headers have already been sent");
		delete this.headers[name];
	}

	setHeader(name,value){
		if(this.headersSent) throw new Error("Headers have already been sent");
		this.headers[name] = value;
	}

	setTimeout(ms,cb){

	}

	writeContinue(){

	}

	writeHead(code,message,headers){
		if(this.headersSent) throw new Error("Headers have already been sent");
		if(!this.upgraded){
			this.socket.write("HTTP/1.1 "+code+" "+(message||statusCodes.getStatusText(code))+"\r\n");
			for(var header in headers){
				this.socket.write(header+": "+headers[header]+"\r\n");
			}
			this.socket.write("\r\n");
		}
		this.headersSent = true;
	}

	upgrade(req){
		if(this.headersSent) throw new Error("Headers have already been sent");
		this.upgraded = true;
		return new Promise(function(s,f){
			var errorCallback = function(){
				f(new Error("Upgrade failed"));
			}.bind(this);
			this.socket.on("finish",errorCallback);
			new ws.Server({noServer:true}).handleUpgrade(req,this.socket,this.head,function(conn){
				this.socket.removeListener("finish",errorCallback);
				this.websocket = conn;
				s(conn);
			}.bind(this));
		}.bind(this));
	}
}

const upgrade = (app)=>{
	const listen = app.listen;
	const server = new ws.Server({noServer:true});
	app.listen = function(){
		const server = listen.apply(app,arguments);
		server.on("upgrade", function(req, sock, head){
			server.emit("request", req, new Response(sock, head));
		});
	}
	return app;
};

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

const FlyWebKoa = (Koa) => {
  return (...listening)=>{
    const app = upgrade(new Koa());
    let _onrequest;
    let _onwebsocket;
    let _onsse;
    let _onfetch;
    Object.defineProperty(app, 'onrequest',
    {
      get(){
        return _onrequest;
      },
      set(func){
        _onrequest = typeof func === 'function' ? func : _onrequest;
      }
    });
    Object.defineProperty(app, 'onwebsocket',
    {
      get(){
        return _onwebsocket;
      },
      set(func){
        _onwebsocket = typeof func === 'function' ? func : _onwebsocket;
      }
    });
    Object.defineProperty(app, 'onsse',
    {
      get(){
        return _onsse;
      },
      set(func){
        _onsse = typeof func === 'function' ? func : _onsse;
      }
    });
    Object.defineProperty(app, 'onfetch',
    {
      get(){
        return _onfetch;
      },
      set(func){
        _onfetch = typeof func === 'function' ? func : _onfetch;
      }
    });

    app.use((context, next)=>{
      if(typeof _onrequest === 'function'){
        _onrequest(context);
      }
      if(testSSE(context) && typeof _onsse === 'function'){
        _onsse(context);
      }else if(testWS(context) && typeof _onwebsocket === 'function'){
        _onwebsocket(context);
      }else if (typeof _onfetch === 'function'){
        _onfetch(context);
      }
      return next();
    });
    return new Promise((resolve, reject)=>{
      const lastArg = listening.pop();
      let listen;
      if(typeof lastArg === 'function'){
        listen = (...args)=>{
          lastArg(...args);
          if(args[0]){
            return reject(args[0]);
          }
          return resolve(app);
        }
      }else{
        listening.push(lastArg);
        listen = (...args)=>{
          if(args[0]){
            return reject(args[0]);
          }
          return resolve(app);
        }
      }
      // return app.listen(()=>{
      //   resolve(app)
      // })
      return app.listen(...listening, listen);
    });
  };
};

exports.FlyWebKoa = FlyWebKoa;
exports['default'] = FlyWebKoa;