# FlyWeb Koa

This is an experimental library that modifies [Koa 2](https://github.com/koajs/koa/tree/v2.x) and [Koa 2 Browser](https://github.com/johnhenry/koa-2-browser) to work a bit like [FlyWeb Servers](https://flyweb.github.io/), currently in development at Mozilla. This allows for changes in control flow that I like, but you may not... so try it out! :). Because it depends on Ko

Note: This depends specifically on the Alpha Version of Koa 2. Check out [this guide](https://www.smashingmagazine.com/2016/08/getting-started-koa-2-async-functions/) to get started.

##What it does

Typically with Koa, one first creates a server, adds middleware, and finally then starts a server.

```js
import koa from 'koa';
const port = 80;
const handleSuccess(port) =>{
  console.log(`listening at ${port}`);
  //Other stuff...
}
const handleError = console.error.bind(error);
const main = ()={
  const server = new Koa();
  server.use(/*middleware*/);
  server.listen(port, (error)=>{
    if(error){
      return handleError(error);
    }
    handleSuccess(port);
  });
}
main();
```

FlyWeb Koa, like FlyWeb, initiates a server and returns a promise resolved with that server, allowing you to add middleware afterwards.

```js
import koa from 'koa';
import flyWebKoa from 'FlyWeb-koa';
const handleSuccess(port) =>{
  console.log(`listening at ${port}`);
  return port;
}
const otherStuff(successResult) =>{
  //Other stuff...
}
const handleError = console.error.bind(error);
const port = 80;
const publishServer = flyWebKoa(koa);
const main = async ()=> {
  const server = await publishServer(port);
  server.use(/*middleware*/);
  return port;
};
main()
  .then(handleSuccess, handleError)
  .then(otherStuff);
```

The code using FlyWeb Koa may seem more verbose, but it allows you cleanly to separate what happens after the server is started from the server itself.

##What else

In addition, FlyWeb Koa also adds the onfetch, and onwebsocket events from FlyWeb (though it doesn't attach the web socket). It also forces upgrade request to be handled like normal requests.
