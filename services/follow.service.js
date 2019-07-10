"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "follow",
	mixins: [
		DbService("follow"),
		CacheCleanerMixin([
			"cache.clean.follow"
		])
	],

	/**
	 * Default settings
	 */
	settings: {
		/** Public fields */
		fields: ["_id", "user_id","customer_id","status"],

		/** Validator schema for entity */
		entityValidator: {
			"user_id":{type:"string"},
			"customer_id":{type:"string"},
			"status":{type:"boolean"}
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
