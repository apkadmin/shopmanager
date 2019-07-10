"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "cart",
	mixins: [
		DbService("cart"),
		CacheCleanerMixin([
			"cache.clean.cart"
		])
	],

	/**
	 * Default settings
	 */
	settings: {
		/** Public fields */
		fields: ["_id","name","status" ,"user_id", "product_id","price","unit_price","type","customer_id","address","count","phone"],

		/** Validator schema for entity */
		entityValidator: {
			name: { type: "string",optional:true},
			price: { type: "string",optional:true},
			unit_price: { type: "string",optional:true},
			type: { type: "string",optional:true},
			user_id: { type: "string",optional:true},
			product_id:{type:"string",optional:true},
			customer_id:{type:"string",optional:true},
			count:{type:"number",optional:true},
			address:{type:"string",optional:true},
			phone:{type:"string",optional:true}
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
						entity.type= entity.type|| null;
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
