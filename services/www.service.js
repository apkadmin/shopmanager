"use strict";
const { MoleculerError } = require("moleculer").Errors;
const express = require("express");
const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const path = require("path");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
module.exports = {
	name: "www",

	settings: {
		port: process.env.PORT || 3000,
		pageSize: 5
	},

	methods: {
		initRoutes(app) {
			app.get("/",this.dashboard);
			app.get("/profile",this.profile);
			app.get("/login", this.login);
			app.post("/authorize",this.authorize);
			app.post("/signup",this.signup);
			app.get("/signout",this.signout);
			app.get("/signup",this.signupget);
			app.post("/update_profile",this.update_profile);
			app.get("/items",this.allitem);
			app.get("/item",this.item);
			app.get("/create-item",this.createitemget);
			app.get("/edit-item",this.edititem);
			app.post("/create-item",this.createitem);
			app.post("/upload-img",this.uploadimg);
			app.post("/update-item",this.updateitem);
			app.post("/delete-item",this.deleteitem);
			app.get("/order",this.getOrder);
			app.post("/app/login",this.appLogin);
			app.post("/app/register",this.appRegister);
			app.get("/app/products",this.appProducts);
			app.post("/app/views",this.appViewClick);
			app.post("/app/purchase",this.appPurchase);
			app.post("/update-order",this.updateOrder);
			app.post("/drop-order",this.dropOder);
			app.get("/app/getshops",this.appGetShops);
			app.post("/app/follow",this.appFollow);
			app.post("/app/getFollow",this.appGetFollow);
			app.post("/app/updateFollow",this.appUpdateFollow);
			app.post("/app/detailShop",this.appDetailShop);
			app.post("/pushnotification",this.pushNotification);
			app.get("/app/getNotification",this.appGetNotification);
			app.post("/app/updateNotification",this.appUpdateNotification);
		},

		login(req, res) {
			let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data => {
					return res.status(200).redirect("/");
				})
				.catch(this.handleLogin(res));
			} else {
				res.render("login.html", {Error: 'Sai tài khoản hoặc mật khẩu' })
			}
		},

		appLogin(req,res){
			let param = req.body;
 			return Promise.resolve({param})
 			.then(data=>{
 				return this.broker.call("customer.login", {user:{email:data.param['email'],password:data.param['password']}}).then(res => {
 						return res;
					});
 			})
 			.then(data=>{
 				res.setHeader('Content-Type', 'application/json');
 				return res.end(JSON.stringify({token:data.user['token'],name:data.user['name'],phone:data.user['phone'],email:data.user['email'],image:data.user['image'],id:data.user['_id']}));
 			})
 			.catch(this.message(res));
		},

		appRegister(req,res){
		let param = req.body;
				return Promise.resolve({param}).then(data=>{
					return this.broker.call("customer.create", {user:{name:data.param['name'],password:data.param['password'],email:data.param['email'],phone:data.param['phone']}}).then(data => {
 						return data;
					});
				})
				.then(data => {
					 res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({token:data.user['token'],name:data.user['name'],phone:data.user['phone'],email:data.user['email'],image:data.user['image'],id:data.user['_id']}));
				})
				.catch(this.message(res));
		},

		signup(req, res) {
			let param = req.body;
				return Promise.resolve({param}).then(data=>{
					return this.broker.call("users.create", {user:{username:data.param['username'],password:data.param['password'],email:data.param['email'],shop:data.param['shop']}}).then(data => {
 						 res.cookie('author',data.user['token'], { maxAge: 9000000, httpOnly: true });
 						  req.session.Auth = data.user;
 						return res;
					});
				})
				.then(data => {
					return res.redirect("/");
				})
				.catch(this.handleErr(res,"signup.html"));
		},

		signout(req,res){
			res.clearCookie("author");
			return res.redirect("/login");
		},

		signupget(req, res){
			res.render("signup.html")
		},

		update_profile(req,res){
			let param = req.body;
			var user = req.headers['_id']; 
			return Promise.resolve({param,user}).then(data=>{
					return this.broker.call("users.updateMyself", {user:{username:data.param['username'],password:data.param['password'],email:data.param['email']}},{meta:{user:{_id:data.user}}}).then(data => {
 	 						return res;
					});
				})
				.then(data => {
					return res.send("update!");
				})
				.catch(this.error(res));
		},

		authorize(req,res){
			let param = req.body;
 			return Promise.resolve({param})
 			.then(data=>{
 				return this.broker.call("users.login", {user:{email:data.param['login-username'],password:data.param['login-password']}}).then(res => {
 						return res;
					});
 			})
 			.then(data=>{
 				 res.cookie('author',data.user['token'], { maxAge: 9000000, httpOnly: true })
 				return res.redirect("/");
 			})
 			.catch(this.handleErr(res,"login.html"));
		},

		dashboard(req,res,netxt){
			let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data => {
					return res.render('home.html',{title:'Trang chủ',username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
			
		},

		profile(req,res){
				let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data => {
					return res.render('profile.html',{title:'Trang chủ',username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
		},

		allitem(req,res){
				let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data=>{
		 			return this.broker.call("shop.list",{page:1,pageSize:100000,query:{user_id:data._id.toString()} }).then(res=>{
		 				data.rows=res;
		 				return data;
		 			});
				})
				.then(data => {
					return res.render("item_list.html",{title:data.shop,username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id,list:data.rows.rows});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
		},

		item(req,res){
			let id = req.query.id;
			return Promise.resolve({id}).then(data=>{
				return this.broker.call("shop.get",{id:data.id}).then(data=>{
					return data;
				});
			}).then(data=>{
				 res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(data));			 
			})
		},

		edititem(req,res){
				let item = req.query.id;
				let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data=>{
		 			return this.broker.call("shop.get",{id:item.toString()}).then(res=>{
		 				console.log(res);
		 				data.rows=res;
		 				return data;
		 			});
				})
				.then(data => {
					return res.render("update_item.html",{title:data.shop,username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id,list:data.rows});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
		},

		createitemget(req,res){
			let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data => {
					return res.render('create_item.html',{title:'Thêm sản phẩm',username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
		},

		createitem(req,res,next){
			let param = req.body;
				return Promise.resolve({param})
					.then(data=>{
		 				return this.broker.call("shop.create", {item:{
		 					name:data.param['name'],
		 					price:data.param['price'],
		 					unit_price:data.param['unit_price'],
		 					description:data.param['description'],
		 					voucher:data.param['voucher'],
		 					start_voucher:data.param['start_voucher'],
		 					stop_voucher:data.param['stop_voucher'],
		 					color:data.param['color'],
		 					size:data.param['size'],
		 					status:data.param['status'],
		 					freeship:data.param['freeship'],
		 					type:data.param['type'],
		 					qrcode:data.param['qrcode'],
		 					user_id:data.param['user_id'],
		 					image:data.param['image'],
		 					guarantee:data.param['guarantee'],
		 					stock:data.param['stock']
		 				}}).then(res => {
		 						return res;
							});
		 			})
		 			.then(data => {
						return res.send('Đã thêm!');
					})
					.catch(this.error(res));
		},

		appDetailShop(req,res){
				let param = req.body;
				return Promise.resolve({})
					.then(data=>{
		 				return this.broker.call("shop.list", {page:1,pageSize:10000,query:{user_id:param['id']}}).then(res=>{
		 					data=res;
		 					return data;
		 				});
		 			})
		 			.then(data => {
					res.setHeader('Content-Type', 'application/json');
					res.status(200);
					res.end(JSON.stringify({data:data.rows}));
				})
				.catch(this.message(res));
		},

		appProducts(req,res){
			return Promise.resolve().then(data=>{
					return this.broker.call("shop.list",{page:1,pageSize:100000}).then(res=>{
		 				data=res;
		 				return data;
		 			});
				})
				.then(data => {
					res.setHeader('Content-Type', 'application/json');
					res.status(200);
					res.end(JSON.stringify({data:data.rows}));
				})
				.catch(this.message(res));
		},

		appGetShops(req,res){
			return Promise.resolve().then(data=>{
				return this.broker.call("users.list",{page:1,pageSize:100000,fields:['_id','shop']}).then(res=>{
					data=res;
					return data;
				});
			}).then(data=>{
				res.setHeader('Content-Type', 'application/json');
				res.status(200);
				res.end(JSON.stringify({data:data.rows}));
			}).catch(this.message(res));
		},
		appGetFollow(req,res){
			let param = req.body;
			return Promise.resolve({param}).then(data=>{
					 				return this.broker.call("follow.find", {query:{user_id:param['uid'],customer_id:param['cusid']}}).then(res=>{
					 					data=res;
					 					return data;
					 				})
					 			}).then(data=>{
					 				res.setHeader('Content-Type', 'application/json');
									res.status(200);
									res.end(JSON.stringify({data:data}));
					 			}).catch(this.message(res));
		},
		appFollow(req,res){
				let param = req.body;
				return Promise.resolve({param})
					.then(data=>{
		 				return this.broker.call("follow.create", {item:{status:true,user_id:param['shop_id'],customer_id:param['customer_id']}}).then(res=>{
		 					data=res;
		 					return data;
		 				});
		 			})
		 			.then(data=>{
		 				res.setHeader('Content-Type', 'application/json');
		 				res.status(200);
		 				res.end(JSON.stringify({error:true}));
		 			})
		 			.catch(this.message(res));
		},
		appUpdateFollow(req,res){
			let param = req.body;
				return Promise.resolve().then(data=>{
					return this.broker.call('follow.update',{id:param['id'],status:param['status']}).then(res=>{
						return res;
					});
				}).then(data=>{
					res.status(200);
					res.end(JSON.stringify({error:'success'}));
				}).catch(this.message(res));
		},
		pushNotification(req,res){
			let token = req.cookies['author'];
			let param = req.body;
				return Promise.resolve({token}).then(data=>{
						return this.broker.call("follow.list",{page:1,pageSize:100000,fields:['customer_id'],query:{user_id:param['shop_id'],status:true}}).then(res=>{
						data=res;
						return data;
					});
				}).then(data=>{
					data.rows.map(item=>{
						this.broker.call('notification.create',{item:{shop:param['shop'],img:param['image'],message:param['message'],user_id:item.customer_id,type:1,status:false,shop_id:param['shop_id']}})
					});
				}).then(data=>{
					res.status(200);
					res.end(JSON.stringify({error:'success'}));
				}).catch(this.message(res));
		},
		appGetNotification(req,res){
			let id = req.query.id;
			return Promise.resolve()
				.then(data=>{
							return this.broker.call("notification.list",{page:1,pageSize:100000,query:{user_id:id}}).then(res=>{
								return res;
							});
						})
				.then(data=>{
						res.setHeader('Content-Type', 'application/json');
						res.status(200);
						res.end(JSON.stringify({data}));
					}).catch(this.message(res));
		},
		appUpdateNotification(req,res){
			let param = req.body;
				return Promise.resolve().then(data=>{
					return this.broker.call('notification.update',{id:param['id'],status:param['status']}).then(res=>{
						return res;
					});
				}).then(data=>{
					res.status(200);
					res.end(JSON.stringify({error:'success'}));
				}).catch(this.message(res));
		},
		getOrder(req,res){
				let token = req.cookies['author'];
			if(token){
				return Promise.resolve({token}).then(data=>{
					return this.broker.call("users.resolveToken",{token:data.token}).then(data=>{
						return data;
					});
				})
				.then(data=>{
		 			return this.broker.call("cart.list",{page:1,pageSize:100000,query:{user_id:data._id.toString()} }).then(res=>{
		 				data.rows=res;
		 				return data;
		 			});
				})
				.then(data => {
					return res.render("list_order.html",{title:data.shop,username:data.username,image:data.image,email:data.email,shop:data.shop,id:data._id,list:data.rows.rows});
				})
				.catch(this.handleLogin(res));
			} else {
				res.status(420).redirect("/login");
			}
		},

		updateOrder(req,res){
			let token = req.cookies['author'];
			let param = req.body;
			if(token){
				return Promise.resolve({token,param}).then(data=>{
					return this.broker.call('cart.update',{id:param['id'],status:!param['status']}).then(res=>{
						return res;
					})
				}).then(data=>{
					res.status(200);
					res.end(JSON.stringify({error:'success'}));
				}).catch(this.message(res));
			}
		},
		dropOder(req,res){
			let token = req.cookies['author'];
			let param = req.body;
			if(token){
				return Promise.resolve({token,param}).then(data=>{
					return this.broker.call('cart.remove',{id:param['id']}).then(res=>{
						return res;
					})
				}).then(data=>{
					res.status(200);
					res.end(JSON.stringify({error:'success'}));
				}).catch(this.message(res));
			}
		},
		appViewClick(req,res){
			let param = req.body;
			return Promise.resolve()
			.then(data=>{
				return this.broker.call('shop.update',{id:param['id'],view:param['view']}).then(res=>{
						return res;
					});
				})
			.then(data=>{
					res.setHeader('Content-Type', 'application/json');
					res.status(200);
					res.end(JSON.stringify({error:'update'}));
				})
			.catch(this.message(res));
		},

		updateitem(req,res){
			let token = req.cookies['author'];
			let param = req.body;
			if(token){
				return Promise.resolve({token,param}).then(data=>{
					return this.broker.call('shop.update',{id:data.param['id'],
						name:data.param['name'],
		 					price:data.param['price'],
		 					unit_price:data.param['unit_price'],
		 					description:data.param['description'],
		 					voucher:data.param['voucher'],
		 					start_voucher:data.param['start_voucher'],
		 					stop_voucher:data.param['stop_voucher'],
		 					color:data.param['color'],
		 					size:data.param['size'],
		 					status:data.param['status'],
		 					freeship:data.param['freeship'],
		 					type:data.param['type'],
		 					qrcode:data.param['qrcode'],
		 					user_id:data.param['user_id'],
		 					image:data.param['image'],
		 					guarantee:data.param['guarantee'],
		 					stock:data.param['stock']
					}).then(res=>{
						return res;
					});
				}).then(data=>{
					return res.send("Cập nhật!");
				})
			.catch(this.error(res));
			} else {
					return res.send("You not login!");
			}
		},

		deleteitem(req,res,next){
			let token = req.cookies['author'];
			let id = req.body['id'];
			if(token){
				return Promise.resolve({token,id}).then(data=>{
					return this.broker.call("shop.remove",{id:data.id}).then(data=>{
					return data;
				});
				}).then(data=>{
					return res.send("1");
				})
			.catch(this.error(res));
			} else {
					return res.send("You not login!");
			}
		},
		appPurchase(req,res){
			let param = req.body;
			return Promise.resolve().then(data=>{
				return this.broker.call("cart.create",{item:{
					name:param['name'],
					user_id:param['user_id'],
					type:param['type'],
					product_id:param['product'],
					customer_id:param['customer'],
					count:param['count'],
					price:param['price'],
					unit_price:param['unit_price'],
					phone:param['phone'],
					address:param['address']
				}})
			}).then(data=>{
				let stock = param['oldcount']-1;
				return this.broker.call('shop.update',{id:param['product'], stock:stock}).then(res=>{
					return res;
				})
			})
			.then(data=>{
				res.status(200);
				res.end(JSON.stringify({error:'Hoàn thành'}))
			}).catch(this.message(res));
		},
		uploadimg(req,res,next){
			if (Object.keys(req.files).length == 0) {
			    return res.status(400).send('No files were uploaded.');
			}
			let img = req.files.file;
			if(img.mimetype=="image/png"||img.mimetype=="image/jpeg"||img.mimetype=="image/gif"){
			img.mv("public/assets/img/photos/"+img.name, function(err) {
			    if (err) return res.status(500).send(err);
			   res.status(200).end(JSON.stringify({error:"File uploads!"}))
			});
			} else{
				res.status(415).end(JSON.stringify({error:"Files not suport!"}))
			}
		},

		handleErr(res,page) {
				return err => {
				res.render(page,{error:err.message});
			};
		},

		handleLogin(res){
			return err=>{
				return res.render("login.html");
			}
		},

		error(res){
			return err=>{
				return res.send(err.message);
			}
		},

		message(res){
			return err=>{
				 res.setHeader('Content-Type', 'application/json');
				 res.status(401);
				res.end(JSON.stringify({error:err.message}));
			}
		}
	},

	created() {
		const app = express();
		const baseFolder = path.join(__dirname, "..");
		app.use(express["static"](path.join(baseFolder, "public")));
		//set session
		app.use(cookieParser());
		 var MemoryStore =session.MemoryStore;
		app.use(session({
		    secret: "secret",
		    resave: false,
		    saveUninitialized: true,
		    store: new MemoryStore(),
		    cookie: {secure: true,
		    }
		})
		);
		// Set view folder
		app.use(fileUpload({
		    useTempFiles : true,
		    tempFileDir : 'public/assets/img/photos/'
		}));
		app.set("views", path.join(baseFolder, "views"));
		app.use(express.urlencoded());
		app.use(express.json());
		app.engine('html', require('ejs').renderFile);

		if (process.env.NODE_ENV == "production") {
			app.locals.cache = "memory";
			app.set("view cache", true);
		} else {
			// Disable views cache
			app.set("view cache", false);			
		}
		this.initRoutes(app);
		this.app = app;
	},

	started() {
		this.app.listen(Number(this.settings.port), err => {
			if (err)
				return this.broker.fatal(err);

			this.logger.info(`WWW server started on port ${this.settings.port}`);
		});

	},

	stopped() {
		if (this.app.listening) {
			this.app.close(err => {
				if (err)
					return this.logger.error("WWW server close error!", err);

				this.logger.info("WWW server stopped!");
			});
		}
	}
};
