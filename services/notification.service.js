"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "notification",
	mixins: [
		DbService("Message"),
		CacheCleanerMixin([
			"cache.clean.notification"
		])
	],

	/**
	 * Default settings
	 */
	settings: {
		/** Public fields */
		fields: ["_id", "shop","message","img","createdAt","user_id","status","shop_id"],

		/** Validator schema for entity */
		entityValidator: {
			"shop":{type:"string"},
			"message":{type:"string"},
			"img":{type:"string",optional:true},
			"user_id":{type:"string"},
			"shop_id":{type:"string",optional:true},
			"type":{type:"number",optional:true},
			"status":{type:"boolean",optional:true}
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
						entity.createdAt = new Date();
						entity.status=false;
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
		"cache.clean.follow"() {
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
