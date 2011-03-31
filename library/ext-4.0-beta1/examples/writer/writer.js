Ext.define('Writer.Form', {
    extend: 'Ext.form.FormPanel',
    alias: 'widget.writerform',
    
    requires: ['Ext.form.TextField'],
    
    initComponent: function(){
        this.addEvents('create');
        Ext.apply(this, {
            activeRecord: null,
            iconCls: 'icon-user',
            frame: true,
            title: 'User -- All fields are required',
            defaultType: 'textfield',
            bodyPadding: 5,
            fieldDefaults: {
                anchor: '100%',
                labelAlign: 'right'    
            },
            items: [{
                fieldLabel: 'Email',
                name: 'email',
                allowBlank: false,
                vtype: 'email'
            }, {
                fieldLabel: 'First',
                name: 'first',
                allowBlank: false
            }, {
                fieldLabel: 'Last',
                name: 'last',
                allowBlank: false
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                items: ['->', {
                    iconCls: 'icon-save',
                    text: 'Save',
                    scope: this,
                    handler: this.onSave
                }, {
                    iconCls: 'icon-user-add',
                    text: 'Create',
                    scope: this,
                    handler: this.onCreate
                }, {
                    iconCls: 'icon-reset',
                    text: 'Reset',
                    scope: this,
                    handler: this.onReset
                }]
            }]
        });
        this.callParent();
    },
    
    setActiveRecord: function(record){
        this.activeRecord = record;
        this.getForm().loadRecord(record);
    },
    
    onSave: function(){
        var active = this.activeRecord,
            form = this.getForm();
            
        if (!active) {
            return;
        }
        if (form.isValid()) {
            form.updateRecord(active);
        }
    },
    
    onCreate: function(){
        var form = this.getForm();
        
        if (form.isValid()) {
            this.fireEvent('create', this, form.getValues());
            form.reset();
        }
        
    },
    
    onReset: function(){
        this.getForm().reset();
    }
});

Ext.define('Writer.Grid', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.writergrid',
    
    requires: [
        'Ext.grid.CellEditing',
        'Ext.form.TextField',
        'Ext.toolbar.TextItem'
    ],
    
    initComponent: function(){
        
        this.editing = new Ext.grid.CellEditing();
        
        Ext.apply(this, {
            iconCls: 'icon-grid',
            frame: true,
            plugins: [this.editing],
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    iconCls: 'icon-add',
                    text: 'Add',
                    scope: this,
                    handler: this.onAddClick
                }, {
                    iconCls: 'icon-delete',
                    text: 'Delete',
                    scope: this,
                    handler: this.onDeleteClick
                }]
            }, {
                weight: 2,
                xtype: 'toolbar',
                dock: 'bottom',
                items: [{
                    xtype: 'tbtext',
                    text: '<b>@cfg</b>'
                }, '|', {
                    text: 'autoSync',
                    enableToggle: true,
                    pressed: true,
                    tooltip: 'When enabled, Store will execute Ajax requests as soon as a Record becomes dirty.',
                    scope: this,
                    toggleHandler: function(btn, pressed){
                        this.store.autoSync = pressed;
                    }
                }, {
                    text: 'batch',
                    enableToggle: true,
                    pressed: true,
                    tooltip: 'When enabled, Store will batch all records for each type of CRUD verb into a single Ajax request.',
                    scope: this,
                    toggleHandler: function(btn, pressed){
                        this.store.getProxy().batchActions = pressed;
                    }
                }, {
                    text: 'writeAllFields',
                    enableToggle: true,
                    pressed: false,
                    tooltip: 'When enabled, Writer will write *all* fields to the server -- not just those that changed.',
                    scope: this,
                    toggleHandler: function(btn, pressed){
                        this.store.getProxy().getWriter().writeAllFields = pressed;
                    }
                }]
            }, {
                weight: 1,
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                items: ['->', {
                    iconCls: 'icon-save',
                    text: 'Sync',
                    scope: this,
                    handler: this.onSync
                }]
            }],
            headers: [{
                text: 'ID',
                width: 40,
                sortable: true,
                dataIndex: 'id',
                renderer: function(v){
                    if (Ext.isEmpty(v)) {
                        v = '&#160;'
                    }
                    return v;
                }
            }, {
                header: 'Email',
                flex: 1,
                sortable: true,
                dataIndex: 'email',
                field: {
                    type: 'textfield'
                }
            }, {
                header: 'First',
                width: 100,
                sortable: true,
                dataIndex: 'first',
                field: {
                    type: 'textfield'
                }
            }, {
                header: 'Last',
                width: 100,
                sortable: true,
                dataIndex: 'last',
                field: {
                    type: 'textfield'
                }
            }]
        });
        this.callParent();
    },
    
    onSync: function(){
        this.store.sync();
    },
    
    onDeleteClick: function(){
        var selection = this.getView().getSelectionModel().getSelection()[0];
        if (selection) {
            this.store.remove(selection);
        }
    },
    
    onAddClick: function(){
        var rec = new Writer.Person({
            first: '',
            last: '',
            email: ''
        }), edit = this.editing;
        
        edit.cancelEdit();
        this.store.insert(0, rec);
        edit.startEditByPosition({
            row: 0,
            column: 1
        });
    }
});

Ext.define('Writer.Person', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int',
        useNull: true
    }, 'email', 'first', 'last'],
    validations: [{
        type: 'length',
        field: 'email',
        min: 1
    }, {
        type: 'length',
        field: 'first',
        min: 1
    }, {
        type: 'length',
        field: 'last',
        min: 1
    }]
});

Ext.require([
    'Ext.data.*',
    'Ext.tip.QuickTips',
    'Ext.window.MessageBoxWindow'
]);

Ext.onReady(function(){
    Ext.tip.QuickTips.init();
    var store = Ext.create('Ext.data.Store', {
        model: 'Writer.Person',
        autoLoad: true,
        autoSync: true,
        proxy: {
            type: 'ajax',
            api: {
                read: 'app.php/users/view',
                create: 'app.php/users/create',
                update: 'app.php/users/update',
                destroy: 'app.php/users/destroy'
            },
            reader: {
                type: 'json',
                successProperty: 'success',
                root: 'data',
                messageProperty: 'message'
            },
            writer: {
                type: 'json',
                writeAllFields: false,
                root: 'data'
            },
            listeners: {
                exception: function(proxy, response, operation){
                    Ext.MessageBox.show({
                        title: 'REMOTE EXCEPTION',
                        msg: operation.getError(),
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        },
        listeners: {
            write: function(proxy, operation){
                Ext.example.msg(operation.action, operation.resultSet.message);
            }
        }
    });
    
    var main = Ext.create('Ext.container.Container', {
        padding: '0 0 0 20',
        width: 500,
        height: 400,
        renderTo: document.body,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            itemId: 'form',
            xtype: 'writerform',
            height: 150,
            listeners: {
                create: function(data){
                    store.insert(0, data);
                }
            }
        }, {
            itemId: 'grid',
            xtype: 'writergrid',
            flex: 1,
            store: store,
            viewConfig: {
                listeners: {
                    itemclick: function(view, rec){
                        main.child('#form').setActiveRecord(rec);
                    }
                }
            }
        }]
    });
});