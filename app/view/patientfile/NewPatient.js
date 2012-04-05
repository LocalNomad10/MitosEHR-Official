/**
 * NewPatient.Js
 * Patient Layout Panel
 * v0.0.5
 *
 * This panel is generated dinamically, using the values from layout_options
 * Because this panel is dynamically generated, the user can edit or add more
 * fields to this form. To modify this panel you have to work with the
 * layoutEngine.class.php
 *
 * MitosEHR (Eletronic Health Records) 2011
 *
 * Author   : GI Technologies, 2011
 * Modified : Ernesto J Rodriguez (Certun) 10/25/2011
 */
Ext.define('App.view.patientfile.NewPatient', {
	extend       : 'App.classes.RenderPanel',
	id           : 'panelNewPatient',
	pageTitle    : 'Patient Entry Form',
	uses         : [ 'App.classes.PhotoIdWindow' ],
	initComponent: function() {

		var me = this;

		me.formTitle = 'Demographics';
		me.formToRender = 'Demographics';

		me.form = Ext.create('Ext.form.Panel', {
			title        : me.formTitle,
			bodyStyle    : 'padding: 5px',
			layout       : 'anchor',
			fieldDefaults: { msgTarget: 'side' },
			dockedItems  : {
				xtype: 'toolbar',
				dock : 'top',
				items: [
					{
						text   : 'Save new patient',
						iconCls: 'save',
						scope  : me,
						handler: me.onSave
					},
					'->',
					{
						text   : 'Take Patient Picture',
						handler: function() {
							me.getPhotoIdWindow();
						}
					}
				]
			}
		});
		me.pageBody = [ me.form ];

        me.listeners = {
            beforerender:me.beforePanelRender
        };

		me.callParent(arguments);
	},

	onSave: function() {
		var me = this, form, values, date;

		date = me.form.add({
			xtype : 'textfield',
			name  : 'date_created',
			hidden: true,
			value : Ext.Date.format(new Date(), 'Y-m-d H:i:s')
		});

        form = me.form.getForm();
        values = form.getFieldValues();

		if(form.isValid()) {

            Patient.createNewPatient(values, function(provider, response){

                /** @namespace action.result.patient.pid */
                /** @namespace action.result.patient.fullname */

                var pid = response.result.patient.pid,
                    fullname = response.result.patient.fullname;

                if(response.result.success){
                    me.msg('Sweet!', 'Patient "' + fullname + '" Created... ');
                    app.setCurrPatient(pid, fullname, function(success) {
                        if(success) {
                            app.openPatientSummary();
                        }
                    });
                }else{
                    Ext.Msg.alert('Opps!', 'Someting went wrong saving the patient');
                }

            });
		}

        me.form.remove(date);
	},


	/**
	 * This will show the window to take a picture
	 */

	getPhotoIdWindow: function() {
		Ext.create('App.classes.PhotoIdWindow', {
			title      : 'Patient Photo Id',
			loadMask   : true,
			modal      : true,
			dockedItems: {
				xtype: 'toolbar',
				dock : 'bottom',
				items: [
					{
						text   : 'Capture Image',
						iconCls: 'save',
						handler: captureToCanvas()
					}
				]
			}
		}).show();
	},

	confirmationWin: function(callback) {
		Ext.Msg.show({
			title  : 'Please confirm...',
			msg    : 'Do you want to create a <strong>new patient</strong>?',
			icon   : Ext.MessageBox.QUESTION,
			buttons: Ext.Msg.YESNO,
			scope  : this,
			fn     : function(btn) {
				callback(btn);
			}
		});
	},

    beforePanelRender:function(){
        this.getFormItems(this.form, this.formToRender);
    },
	/**
	 * This function is called from MitosAPP.js when
	 * this panel is selected in the navigation panel.
	 * place inside this function all the functions you want
	 * to call every this panel becomes active
	 */
	onActive       : function(callback) {
		//this.getFormItems(this.form, this.formToRender);

		this.confirmationWin(function(btn) {
			if(btn == 'yes') {
				app.patientUnset();
				callback(true);
			} else {
				callback(false);
			}
		});
	}
});