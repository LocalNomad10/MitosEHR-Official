/*!
 * Extensible 1.0-alpha2
 * Copyright(c) 2010 ThinkFirst, LLC
 * team@ext.ensible.com
 * http://ext.ensible.com
 */
Ext.onReady(function(){
    
    var today = new Date().clearTime();
        apiRoot = 'remote/php/app.php/events/';
    
    var proxy = new Ext.data.HttpProxy({
        api: {
            read:    apiRoot+'view',
            create:  apiRoot+'create',
            update:  apiRoot+'update',
            destroy: apiRoot+'destroy'
        }
    });
    
    var reader = new Ext.data.JsonReader({
        totalProperty: 'total',
        successProperty: 'success',
        idProperty: 'id',
        root: 'data',
        messageProperty: 'message',
        fields: Ext.ensible.cal.EventRecord.prototype.fields.getRange()
    });
    
    var writer = new Ext.data.JsonWriter({
        encode: true,
        writeAllFields: false
    });
    
    var store = new Ext.data.Store({
        id: 'event-store',
        restful: true,
        proxy: proxy,
        reader: reader,
        writer: writer,
        autoSave: true,
        autoLoad: true
    });
    
    new Ext.ensible.cal.CalendarPanel({
        id: 'calendar-remote',
        eventStore: store,
        renderTo: 'remote',
        title: 'Remote Calendar',
        width: 900,
        height: 600
    });
});