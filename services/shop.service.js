"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "shop",
	mixins: [
		DbService("shop"),
		CacheCleanerMixin([
			"cache.clean.shop"
		])
	],

	/**
	 * Default settings
	 */
	settings: {
		/** Public fields */
		fields: ["_id", "user_id", "name", "image","price","stock","unit_price","description","view","voucher","type","qrcode","start_voucher","stop_voucher","size","guarantee","status","color","freeship"],

		/** Validator schema for entity */
		entityValidator: {
			name: { type: "string"},
			image: { type: "array"},
			price: { type: "string"},
			unit_price: { type: "string"},
			description: { type: "string"},
			voucher: { type: "string", optional:true},
			type: { type: "string"},
			qrcode: { type: "string", optional:true},
			user_id: { type: "string"},
			guarantee:{type:"string"},
			start_voucher:{type:"string",optional:true},
			stop_voucher:{type:"string",optional:true},
			status:{type:"boolean"},
			freeship:{type:"boolean"},
			color:{type:"string"},
			stock:{type:"number",optional:true}
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Register a items
		 *
		 * @actions
		 * @param {Object} item 
		 *
		 * @returns {Object} Created
		 */
		create: {
			params: {
				item: { type: "object" }
			},
			handler(ctx) {
				let entity = ctx.params.item;
				return this.validateEntity(entity)
					.then(() => {
						entity.image= entity.image || null;	
						entity.voucher= entity.voucher|| null;
						entity.type= entity.type|| null;
						entity.qrcode= entity.qrcode|| null;
						entity.stock= entity.stock||0;
						entity.view= "0";
						entity.purchase ="0";
						entity.createdAt = new Date();
						return this.adapter.insert(entity)
							.then(doc => this.transformDocuments(ctx, {}, doc))
							.then(json => this.entityChanged("created", json, ctx).then(() => json));
					});
			}
		},

	},
	/**
	 * Methods
	 */
	methods: {
	},

	events: {
		"cache.clean.users"() {
			if (this.broker.cacher)
				this.broker.cacher.clean(`${this.name}.*`);
		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};
