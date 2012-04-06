/**
 *
 */
Ext.define('Ext.selection.CellModel', {
    extend: 'Ext.selection.Model',
    alias: 'selection.cellmodel',
    requires: ['Ext.util.KeyNav'],

    /**
     * @cfg {Boolean} enableKeyNav
     * Turns on/off keyboard navigation within the grid.
     */
    enableKeyNav: true,

    /**
     * @cfg {Boolean} preventWrap
     * Set this configuration to true to prevent wrapping around of selection as
     * a user navigates to the first or last column.
     */
    preventWrap: false,

    constructor: function() {
        this.addEvents(
            /**
             * @event deselect
             * Fired after a cell is deselected
             * @param {Ext.selection.CellModel} this
             * @param {Ext.data.Model} record The record of the deselected cell
             * @param {Number} row The row index deselected
             * @param {Number} column The column index deselected
             */
            'deselect',

            /**
             * @event select
             * Fired after a cell is selected
             * @param {Ext.selection.CellModel} this
             * @param {Ext.data.Model} record The record of the selected cell
             * @param {Number} row The row index selected
             * @param {Number} column The column index selected
             */
            'select'
        );
        this.callParent(arguments);
    },

    bindComponent: function(view) {
        var me = this;
        me.primaryView = view;
        me.views = me.views || [];
        me.views.push(view);
        me.bindStore(view.getStore(), true);

        view.on({
            cellmousedown: me.onMouseDown,
            refresh: me.onViewRefresh,
            scope: me
        });

        if (me.enableKeyNav) {
            me.initKeyNav(view);
        }
    },

    initKeyNav: function(view) {
        var me = this;

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        view.el.set({
            tabIndex: -1
        });

        // view.el has tabIndex -1 to allow for
        // keyboard events to be passed to it.
        me.keyNav = new Ext.util.KeyNav(view.el, {
            up: me.onKeyUp,
            down: me.onKeyDown,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            tab: me.onKeyTab,
            scope: me
        });
    },

    getHeaderCt: function() {
        return this.primaryView.headerCt;
    },

    onKeyUp: function(e, t) {
        this.move('up', e);
    },

    onKeyDown: function(e, t) {
        this.move('down', e);
    },

    onKeyLeft: function(e, t) {
        this.move('left', e);
    },

    onKeyRight: function(e, t) {
        this.move('right', e);
    },

    move: function(dir, e) {
        var me = this,
            pos = me.primaryView.walkCells(me.getCurrentPosition(), dir, e, me.preventWrap);
        if (pos) {
            me.setCurrentPosition(pos);
        }
        return me.selection;
    },

    /**
     * Returns the current position in the format {row: row, column: column}
     */
    getCurrentPosition: function() {
        return this.selection;
    },

    /**
     * Sets the current position
     * @param {Object} position The position to set.
     */
    setCurrentPosition: function(pos) {
        var me = this;

        if (me.selection) {
            me.onCellDeselect(me.selection);
        }

        if (pos) {
            // Deselecting deletes our selection property
            me.selection = new me.Selection(me);
            me.selection.setPosition(pos);
            me.onCellSelect(me.selection);
        }
    },

    /**
     * Set the current position based on where the user clicks.
     * @private
     */
    onMouseDown: function(view, cell, cellIndex, record, row, rowIndex, e) {
        this.setCurrentPosition({
            view: view,
            row: rowIndex,
            column: cellIndex
        });
    },

    // notify the view that the cell has been selected to update the ui
    // appropriately and bring the cell into focus
    onCellSelect: function(position, supressEvent) {
        if (position && position.row !== undefined) {
            this.doSelect(this.view.getStore().getAt(position.row), /*keepExisting*/false, supressEvent);
        }
    },

    // notify view that the cell has been deselected to update the ui
    // appropriately
    onCellDeselect: function(position, supressEvent) {
        if (position && position.row !== undefined) {
            this.doDeselect(this.view.getStore().getAt(position.row), supressEvent);
        }
    },
    
    onSelectChange: function(record, isSelected, suppressEvent, commitFn) {
        var me = this,
            pos = me.selection,
            eventName = isSelected ? 'select' : 'deselect',
            view = me.primaryView;

        if ((suppressEvent || me.fireEvent('before' + eventName, me, record, pos.row, pos.column)) !== false &&
                commitFn() !== false) {

            if (isSelected) {
                view.onCellSelect(pos);
                view.focusCell(pos);
            } else {
                view.onCellDeselect(pos);
                delete me.selection;
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record, pos.row, pos.column);
            }
        }
    },

    // Tab key from the View's KeyNav, *not* from an editor.
    onKeyTab: function(e, t) {
        var me = this,
            editingPlugin = me.primaryView.editingPlugin;

        // If we were in editing mode, but just focused on a non-editable cell, behave as if we tabbed off an editable field
        if (editingPlugin && me.wasEditing) {
            me.onEditorTab(editingPlugin, e)
        } else {
            me.move(e.shiftKey ? 'left' : 'right', e);
        }
    },

    onEditorTab: function(editingPlugin, e) {
        var me = this,
            direction = e.shiftKey ? 'left' : 'right',
            position  = me.move(direction, e);

        // Navigation had somewhere to go.... not hit the buffers.
        if (position) {
            // If we were able to begin editing clear the wasEditing flag. It gets set during navigation off an active edit.
            if (editingPlugin.startEditByPosition(position)) {
                me.wasEditing = false;
            }
            // If we could not continue editing...
            // Set a flag that we should go back into editing mode upon next onKeyTab call
            else {
                me.wasEditing = true;
                if (!position.columnHeader.dataIndex) {
                    me.onEditorTab(editingPlugin, e);
                }
            }
        }
    },

    refresh: function() {
        var pos = this.getCurrentPosition(),
            selRowIdx;

        // Synchronize the current position's row with the row of the last selected record.
        if (pos && (selRowIdx = this.store.indexOf(this.selected.last())) !== -1) {
            pos.row = selRowIdx;
        }
    },

    onViewRefresh: function() {
        var me = this,
            pos = me.getCurrentPosition();

        // Re-establish selection of the same cell coordinate.
        // DO NOT fire events because the selected 
        if (pos) {
            // Deselect old cell. This deletes the selection property.
            me.onCellDeselect(pos, true);

            // After a refresh, recreate the selection using the same record and grid column as before
            (me.selection = new me.Selection(me)).setPosition(pos.record, pos.columnHeader);
            me.onCellSelect(me.selection, true);
        }
    },

    selectByPosition: function(position) {
        this.setCurrentPosition(position);
    }
}, function() {
    
    // Encapsulate a single selection position.
    // Maintains { row: n, column: n, record: r, columnHeader: c}
    var Selection = this.prototype.Selection = function(model) {
        this.model = model;
    };
    // Selection row/record & column/columnHeader
    Selection.prototype.setPosition = function(row, col) {
        var me = this,
            view = me.model.primaryView,
            store;

        // We were passed {row: 1, column: 2}
        if (arguments.length === 1) {
            
            // SelectionModel is shared between both sides of a locking grid.
            // It can be positioned on either view.
            if (row.view) {
                view = row.view;
            }
            col = row.column;
            row = row.row;
        }
        store = view.store;

        // Row index passed
        if (typeof row === 'number') {
            me.row = row;
            me.record = store.getAt(row);
        }
        // row is a Record
        else if (row.isModel) {
            me.record = row;
            me.row = view.indexOf(row);
        }
        // row is a grid row
        else if (row.tagName) {
            me.record = view.getRecord(row);
            me.row = view.indexOf(me.record);
        }
        
        // column index passed
        if (typeof col === 'number') {
            me.column = col;
            me.columnHeader = view.getHeaderAtIndex(col);
        }
        // col is a column Header
        else {
            me.columnHeader = col;
            me.column = col.getIndex();
        }
        return me;
    }
});