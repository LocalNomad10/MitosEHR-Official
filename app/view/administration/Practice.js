/**
 * Practice Panel
 *
 * Author: Ernesto J Rodriguez
 * Modified: n/a
 *
 * MitosEHR (Electronic Health Records) 2011
 *
 * @namespace Practice.getPharmacies
 * @namespace Practice.addPharmacy
 * @namespace Practice.updatePharmacy
 *
 * @namespace Practice.getInsurances
 * @namespace Practice.addInsurance
 * @namespace Practice.updateInsurance
 *
 *
 */
Ext.define('App.view.administration.Practice', {
	extend       : 'App.classes.RenderPanel',
	id           : 'panelPractice',
	pageTitle    : 'Practice Settings',
	uses         : [
		'App.classes.combo.Titles', 'App.classes.combo.TransmitMethod', 'App.classes.combo.InsurancePayerType'
	],
	initComponent: function() {
		var me = this;

		/**
		 * Pharmacy Model and Store
		 */
		Ext.define('pharmacyGridModel', {
			extend: 'Ext.data.Model',
			fields: [
				{name: 'id', type: 'int'},
				{name: 'name', type: 'string'},
				{name: 'transmit_method', type: 'string'},
				{name: 'email', type: 'string'},
				{name: 'address_id', type: 'int'},
				{name: 'line1', type: 'string'},
				{name: 'line2', type: 'string'},
				{name: 'city', type: 'string'},
				{name: 'state', type: 'string'},
				{name: 'zip', type: 'string'},
				{name: 'plus_four', type: 'string'},
				{name: 'country', type: 'string'},
				{name: 'address_full', type: 'string'},
				{name: 'phone_id', type: 'int'},
				{name: 'phone_country_code', type: 'string'},
				{name: 'phone_area_code', type: 'string'},
				{name: 'phone_prefix', type: 'string'},
				{name: 'phone_number', type: 'string'},
				{name: 'phone_full', type: 'string'},
				{name: 'fax_id', type: 'int'},
				{name: 'fax_country_code', type: 'string'},
				{name: 'fax_area_code', type: 'string'},
				{name: 'fax_prefix', type: 'string'},
				{name: 'fax_number', type: 'string'},
				{name: 'fax_full', type: 'string'},
				{name: 'active', type: 'bool'}
			],
			proxy : {
				type: 'direct',
				api : {
					read  : Practice.getPharmacies,
					create: Practice.addPharmacy,
					update: Practice.updatePharmacy
				}
			}
		});
		me.pharmacyStore = Ext.create('Ext.data.Store', {
			model     : 'pharmacyGridModel',
			remoteSort: false,
			autoSync:true
		});
		// *************************************************************************************
		// Insurance Record Structure
		// *************************************************************************************
		Ext.define('insuranceGridModel', {
			extend: 'Ext.data.Model',
			fields: [
				{name: 'id', type: 'int'},
				{name: 'name', type: 'string'},
				{name: 'attn', type: 'string'},
				{name: 'cms_id', type: 'string'},
				{name: 'freeb_type', type: 'string'},
				{name: 'x12_receiver_id', type: 'string'},
				{name: 'x12_default_partner_id', type: 'string'},
				{name: 'alt_cms_id', type: 'string'},
				{name: 'address_id', type: 'int'},
				{name: 'line1', type: 'string'},
				{name: 'line2', type: 'string'},
				{name: 'city', type: 'string'},
				{name: 'state', type: 'string'},
				{name: 'zip', type: 'string'},
				{name: 'plus_four', type: 'string'},
				{name: 'country', type: 'string'},
				{name: 'address_full', type: 'string'},
				{name: 'phone_id', type: 'int'},
				{name: 'phone_country_code', type: 'string'},
				{name: 'phone_area_code', type: 'string'},
				{name: 'phone_prefix', type: 'string'},
				{name: 'phone_number', type: 'string'},
				{name: 'phone_full', type: 'string'},
				{name: 'fax_id', type: 'int'},
				{name: 'fax_country_code', type: 'string'},
				{name: 'fax_area_code', type: 'string'},
				{name: 'fax_prefix', type: 'string'},
				{name: 'fax_number', type: 'string'},
				{name: 'fax_full', type: 'string'},
				{name: 'active', type: 'bool'}
			],
			proxy : {
				type: 'direct',
				api : {
					read  : Practice.getInsurances,
					create: Practice.addInsurance,
					update: Practice.updateInsurance
				}
			}
		});
		me.insuranceStore = Ext.create('Ext.data.Store', {
			model     : 'insuranceGridModel',
			remoteSort: false,
			autoSync:true
		});
		// *************************************************************************************
		// Insurance Numbers Record Structure
		// *************************************************************************************
		//		me.insuranceNumbersStore = Ext.create('App.classes.restStoreModel', {
		//			fields     : [
		//				{name: 'id', type: 'int'},
		//				{name: 'name', type: 'string'}
		//			],
		//			model      : 'insuranceNumbersModel',
		//			idProperty : 'id',
		//			url        : 'app/administration/practice/data.php',
		//			extraParams: { task: "insuranceNumbers"}
		//		});
		// *************************************************************************************
		// X12 Partners Record Structure
		// *************************************************************************************
		//		me.x12PartnersStore = Ext.create('App.classes.restStoreModel', {
		//			fields     : [
		//				{name: 'id', type: 'int'},
		//				{name: 'name', type: 'string'}
		//			],
		//			model      : 'x12PartnersModel',
		//			idProperty : 'id',
		//			url        : 'app/administration/practice/data.php',
		//			extraParams: { task: "x12Partners"}
		//		});

		// -------------------------------------------------------------------------------------
		// render function for Default Method column in the Pharmacy grid
		// -------------------------------------------------------------------------------------
		function transmit_method(val) {
			if(val == '1') {
				return 'Print';
			} else if(val == '2') {
				return 'Email';
			} else if(val == '3') {
				return 'Email';
			}
			return val;
		}

		me.rowEditingPharmacy = Ext.create('App.classes.grid.RowFormEditing', {
			autoCancel  : false,
			errorSummary: false,
			clicksToEdit: 1,
			formItems   : [
				{
					xtype : 'container',
					layout: 'hbox',
					width : 900,
					items : [
						{
							xtype : 'container',
							width : 450,
							layout: 'anchor',
							items : [
								{ xtype: 'textfield', fieldLabel: 'Name', name: 'name', allowBlank: false, width: 385 },
								{ xtype: 'textfield', fieldLabel: 'Address', name: 'line1', width: 385 },
								{ xtype: 'textfield', fieldLabel: 'Address (Cont)', name: 'line2', width: 385 },
								{ xtype     : 'fieldcontainer',
									layout  : 'hbox',
									defaults: { hideLabel: true },
									items   : [
										{ xtype: 'displayfield', width: 105, value: 'City, State Zip' },
										{ xtype: 'textfield', width: 150, name: 'city' },
										{ xtype: 'displayfield', width: 5, value: ',' },
										{ xtype: 'textfield', width: 50, name: 'state' },
										{ xtype: 'textfield', width: 75, name: 'zip' }
									]
								}
							]
						},
						{
							xtype : 'container',
							width : 300,
							layout: 'anchor',
							items : [
								{
									xtype: 'textfield', fieldLabel: 'Email', name: 'email', width: 275
								},
								{
									xtype   : 'fieldcontainer',
									layout  : 'hbox',
									defaults: { hideLabel: true },
									items   : [
										{ xtype: 'displayfield', width: 100, value: 'Phone' },
										{ xtype: 'displayfield', width: 5, value: '(' },
										{ xtype: 'textfield', width: 40, name: 'phone_area_code' },
										{ xtype: 'displayfield', width: 5, value: ')' },
										{ xtype: 'textfield', width: 50, name: 'phone_prefix' },
										{ xtype: 'displayfield', width: 5, value: '-' },
										{ xtype: 'textfield', width: 70, name: 'phone_number' }
									]
								},
								{
									xtype   : 'fieldcontainer',
									layout  : 'hbox',
									defaults: { hideLabel: true },
									items   : [
										{ xtype: 'displayfield', width: 100, value: 'Fax' },
										{ xtype: 'displayfield', width: 5, value: '(' },
										{ xtype: 'textfield', width: 40, name: 'fax_area_code' },
										{ xtype: 'displayfield', width: 5, value: ')' },
										{ xtype: 'textfield', width: 50, name: 'fax_prefix' },
										{ xtype: 'displayfield', width: 5, value: '-' },
										{ xtype: 'textfield', width: 70, name: 'fax_number'
										}
									]
								},
								{
									xtype: 'transmitmethodcombo', fieldLabel: 'Default Method', labelWidth: 100, width: 275
								}
							]
						},
						{
							xtype: 'mitos.checkbox', fieldLabel: 'Active?', labelWidth: 60, name: 'active'
						}
					]
				}
			]
		});

		me.rowEditingInsurance = Ext.create('App.classes.grid.RowFormEditing', {
			autoCancel  : false,
			errorSummary: false,
			clicksToEdit: 1,
			formItems   : [
				{
					xtype : 'container',
					layout: 'hbox',
					width : 900,
					items : [
						{
							xtype : 'container',
							width : 450,
							layout: 'anchor',
							items : [
								{ xtype: 'textfield', fieldLabel: 'Name', name: 'name', allowBlank: false, width: 385 },
								{ xtype: 'textfield', fieldLabel: 'Address', name: 'line1', width: 385 },
								{ xtype: 'textfield', fieldLabel: 'Address (Cont)', name: 'line2', width: 385 },
								{ xtype     : 'fieldcontainer',
									defaults: { hideLabel: true },
									layout  : 'hbox',
									items   : [
										{ xtype: 'displayfield', width: 105, value: 'City, State Zip' },
										{ xtype: 'textfield', width: 150, name: 'city' },
										{ xtype: 'displayfield', width: 5, value: ',' },
										{ xtype: 'textfield', width: 50, name: 'state' },
										{ xtype: 'textfield', width: 75, name: 'zip' }
									]
								}
							]
						},
						{
							xtype : 'container',
							width : 300,
							layout: 'anchor',
							items : [
								{
									xtype   : 'fieldcontainer',
									layout  : 'hbox',
									defaults: { hideLabel: true },
									items   : [
										{ xtype: 'displayfield', width: 100, value: 'Phone' },
										{ xtype: 'displayfield', width: 5, value: '(' },
										{ xtype: 'textfield', width: 40, name: 'phone_area_code' },
										{ xtype: 'displayfield', width: 5, value: ')' },
										{ xtype: 'textfield', width: 50, name: 'phone_prefix' },
										{ xtype: 'displayfield', width: 5, value: '-' },
										{ xtype: 'textfield', width: 70, name: 'phone_number' }
									]
								},
								{
									xtype   : 'fieldcontainer',
									layout  : 'hbox',
									defaults: { hideLabel: true },
									items   : [
										{ xtype: 'displayfield', width: 100, value: 'Fax' },
										{ xtype: 'displayfield', width: 5, value: '(' },
										{ xtype: 'textfield', width: 40, name: 'fax_area_code' },
										{ xtype: 'displayfield', width: 5, value: ')' },
										{ xtype: 'textfield', width: 50, name: 'fax_prefix' },
										{ xtype: 'displayfield', width: 5, value: '-' },
										{ xtype: 'textfield', width: 70, name: 'fax_number'
										}
									]
								},
								{ xtype: 'textfield', fieldLabel: 'CMS ID', name: 'cms_id', width: 275 },
								{ xtype: 'mitos.insurancepayertypecombo', fieldLabel: 'Payer Type', labelWidth: 100, width: 275  },
								{ xtype: 'textfield', fieldLabel: 'X12 Partner', name: 'x12_default_partner_id' }
							]
						},
						{
							xtype: 'checkbox', fieldLabel: 'Active?', labelWidth: 60, name: 'active'
						}
					]
				}
			]

		});
		// *************************************************************************************
		// Grids
		// *************************************************************************************
		me.pharmacyGrid = Ext.create('Ext.grid.Panel', {
			title     : 'Pharmacies',
			store     : me.pharmacyStore,
			border    : false,
			frame     : false,
			viewConfig: { stripeRows: true },
			plugins   : [ me.rowEditingPharmacy ],
			columns   : [
				{ header: 'Pharmacy Name', width: 150, sortable: true, dataIndex: 'name' },
				{ header: 'Address', flex: 1, sortable: true, dataIndex: 'address_full' },
				{ header: 'Phone', width: 120, sortable: true, dataIndex: 'phone_full' },
				{ header: 'Fax', width: 120, sortable: true, dataIndex: 'fax_full' },
				{ header: 'Default Method', flex: 1, sortable: true, dataIndex: 'transmit_method', renderer: transmit_method },
				{ header: 'Active?', width: 55, sortable: true, dataIndex: 'active', renderer: me.boolRenderer }
			],
			tbar      : [
				{
					text   : 'Add New Pharmacy',
					iconCls: 'save',
					action : 'pharmacyGridModel',
					scope  : me,
					handler: me.onNewRec
				}
			]
		});
		me.insuranceGrid = Ext.create('Ext.grid.Panel', {
			title     : 'Insurance Companies',
			store     : me.insuranceStore,
			border    : false,
			frame     : false,
			viewConfig: { stripeRows: true },
			plugins   : [ me.rowEditingInsurance ],
			columns   : [
				{ header: 'Insurance Name', width: 150, sortable: true, dataIndex: 'name' },
				{ header: 'Address', flex: 1, sortable: true, dataIndex: 'address_full' },
				{ header: 'Phone', width: 120, sortable: true, dataIndex: 'phone_full' },
				{ header: 'Fax', width: 120, sortable: true, dataIndex: 'fax_full' },
				{ header: 'Default X12 Partner', flex: 1,  sortable: true, dataIndex: 'x12_default_partner_id' },
				{ header: 'Active?', width: 55, sortable: true, dataIndex: 'active', renderer: me.boolRenderer }

			],
			tbar      : [
				{
					text   : 'Add New Insurance',
					iconCls: 'save',
					action : 'insuranceGridModel',
					scope  : me,
					handler: me.onNewRec
				}
			]
		});

		//		me.InsuranceNumbersGrid = Ext.create('Ext.grid.Panel', {
		//            title    : 'Insurance Numbers',
		//			//store     : me.insuranceNumbersStore,
		//			border    : false,
		//			frame     : false,
		//            viewConfig: { stripeRows: true },
		//			columns   : [
		//				{ text: 'Name', flex: 1, sortable: true, dataIndex: 'name' },
		//				{ width: 100, sortable: true, dataIndex: 'address' },
		//				{ text: 'Provider #', flex: 1, width: 100, sortable: true, dataIndex: 'phone' },
		//				{ text: 'Rendering #', flex: 1, width: 100, sortable: true, dataIndex: 'phone' },
		//				{ text: 'Group #', flex: 1, width: 100, sortable: true, dataIndex: 'phone' }
		//			]
		//
		//		});
				me.x12ParnersGrid = Ext.create('Ext.grid.Panel', {
		            title    : 'X12 Partners (clearing houses)',
					//store     : me.x12PartnersStore,
					border    : false,
					frame     : false,
		            viewConfig: { stripeRows: true },
					columns   : [
						{ text: 'Name', flex: 1, sortable: true, dataIndex: 'name' },
						{ text: 'Sender ID', flex: 1, width: 100, sortable: true, dataIndex: 'phone' },
						{ text: 'Receiver ID', flex: 1, width: 100, sortable: true, dataIndex: 'phone' },
						{ text: 'Version', flex: 1, width: 100, sortable: true, dataIndex: 'phone' }
					]

				});

		// *************************************************************************************
		// Tab Panel
		// *************************************************************************************
		me.praticePanel = Ext.create('Ext.tab.Panel', {
			activeTab: 0,
			items    : [
				me.pharmacyGrid,
				me.insuranceGrid,
				//me.InsuranceNumbersGrid,
				me.x12ParnersGrid,
				{
					title      : 'HL7 Viewer',
					frame      : false,
					border     : false,
					items      : [
						{

						}
					],
					tbar: [
						{
							xtype  : 'button',
							text   : 'Clear HL7 Data',
							iconCls: 'save',
							handler: function() {
								me.onWinOpen();
							}
						},
						'-',
						{
							xtype  : 'button',
							text   : 'Parse HL7',
							iconCls: 'save',
							handler: function() {
								me.onWinOpen();
							}
						}
					]
				}
			]
		});

		me.pageBody = [ me.praticePanel ];
		me.callParent(arguments);
	},

	onNewRec: function(btn) {
		var me = this, grid = btn.up('grid'), store = grid.store, model = btn.action, plugin = grid.editingPlugin, newModel;

		say(grid);
		say(plugin);
		say(model);

		plugin.cancelEdit();
		newModel = Ext.ModelManager.create({
			active:1
		}, model);
		say(newModel);
		store.insert(0, newModel);
		plugin.startEdit(0, 0);
	},

	/**
	 * This function is called from MitosAPP.js when
	 * this panel is selected in the navigation panel.
	 * place inside this function all the functions you want
	 * to call every this panel becomes active
	 */
	onActive: function(callback) {
		this.pharmacyStore.load();
		this.insuranceStore.load();
		//this.insuranceNumbersStore.load();
		//this.x12PartnersStore.load();
		callback(true);
	}
}); // end of PracticePage