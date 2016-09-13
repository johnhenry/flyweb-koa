import upgrade from './koa-upgrade/lib/index';
import {testSSE, testWS} from './headerTests';
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
export {FlyWebKoa};
export default FlyWebKoa;
