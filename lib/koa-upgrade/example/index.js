const Koa = require("koa");
const upgrade = require("../lib");

const app = new Koa();
upgrade(app);
app.use(async (context)=>{
	console.log(context.req.headers)
	context.body = 'hello';
})
app.listen(8081, ()=>console.log('listening'));
