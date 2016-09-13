import ws from 'ws';
import Response from "./response";
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
export default upgrade;
