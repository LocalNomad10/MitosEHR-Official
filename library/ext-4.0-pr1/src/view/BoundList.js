/**
 * @class Ext.view.BoundList
 * @extends Ext.DataView
 * An internal used DataView for ComboBox, MultiSelect and ItemSelector.
 */
Ext.define('Ext.view.BoundList', {
    extend: 'Ext.DataView',
    alias: 'widget.boundlist',
    alternateClassName: 'Ext.BoundList',
    
    requires: ['Ext.layout.component.BoundList'],

    minWidth: 200,
    autoScroll: true,

    baseCls: Ext.baseCSSPrefix + 'boundlist',
    listItemCls: '',
    shadow: false,
    mirrorWidth: true,
    trackOver: true,
    floatingLoadingHeight: 50,

    ariaRole: 'listbox',

    componentLayout: 'boundlist',

    initComponent: function() {
        var me = this;
        me.itemCls = me.baseCls + '-item';
        me.selectedItemCls = me.baseCls + '-selected';
        me.overItemCls = me.baseCls + '-item-over';
        me.itemSelector = "." + me.itemCls;

        if (me.floating) {
            me.addCls(me.baseCls + '-floating');
            me.loadingHeight = me.floatingLoadingHeight;
        }

        // should be setting aria-posinset based on entire set of data
        // not filtered set
        me.tpl = new Ext.XTemplate(
            '<ul><tpl for=".">',
                '<li role="option" class="' + me.itemCls + '">' + me.getInnerTpl(me.displayField) + '</li>',
            '</tpl></ul>'
        );
        Ext.view.BoundList.superclass.initComponent.call(me);
    },

    getInnerTpl: function(displayField) {
        return '{' + displayField + '}';
    },

    refresh: function() {
        var me = this;
        Ext.view.BoundList.superclass.refresh.call(me);
        me.doComponentLayout();
    },
    
    initAria: function() {
        Ext.view.BoundList.superclass.initAria.call(this);
        var selModel = this.getSelectionModel(),
            mode     = selModel.getSelectionMode(),
            actionEl = this.getActionEl();
        
        // TODO: subscribe to mode changes or allow the selModel to manipulate this attribute.
        if (mode !== 'SINGLE') {
            actionEl.dom.setAttribute('aria-multiselectable', true);
        }
    }
});
