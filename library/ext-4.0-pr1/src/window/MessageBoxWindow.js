Ext.define('Ext.window.MessageBoxWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.toolbar.Toolbar',
        'Ext.form.Text',
        'Ext.form.TextArea',
        'Ext.button.Button',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.HBox',
        'Ext.ProgressBar'
    ],

    alias: 'widget.messagebox',

    /**
     * Button config that displays a single OK button
     * @type Number
     */
    OK : 1,
    /**
     * Button config that displays a single Yes button
     * @type Number
     */
    YES : 2,
    /**
     * Button config that displays a single No button
     * @type Number
     */
    NO : 4,
    /**
     * Button config that displays a single Cancel button
     * @type Number
     */
    CANCEL : 8,
    /**
     * Button config that displays OK and Cancel buttons
     * @type Number
     */
    OKCANCEL : 9,
    /**
     * Button config that displays Yes and No buttons
     * @type Number
     */
    YESNO : 6,
    /**
     * Button config that displays Yes, No and Cancel buttons
     * @type Number
     */
    YESNOCANCEL : 14,
    /**
     * The CSS class that provides the INFO icon image
     * @type String
     */
    INFO : 'ext-mb-info',
    /**
     * The CSS class that provides the WARNING icon image
     * @type String
     */
    WARNING : 'ext-mb-warning',
    /**
     * The CSS class that provides the QUESTION icon image
     * @type String
     */
    QUESTION : 'ext-mb-question',
    /**
     * The CSS class that provides the ERROR icon image
     * @type String
     */
    ERROR : 'ext-mb-error',

    // hide it by offsets. Windows are hidden on render by default.
    hideMode: 'offsets',
    closeAction: 'hide',
    title: '&#160;',

    width: 600,
    height: 110,
    minWidth: 100,
    maxWidth: 600,
    minHeight: 110,

    cls: Ext.baseCSSPrefix + 'message-box',

    layout: {
        type: 'anchor'
    },

    /**
     * The default height in pixels of the message box's multiline textarea if displayed (defaults to 75)
     * @type Number
     */
    defaultTextHeight : 75,
    /**
     * The minimum width in pixels of the message box if it is a progress-style dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need (defaults to 250).
     * @type Number
     */
    minProgressWidth : 250,
    /**
     * The minimum width in pixels of the message box if it is a prompt dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need (defaults to 250).
     * @type Number
     */
    minPromptWidth: 250,
    /**
     * An object containing the default button text strings that can be overriden for localized language support.
     * Supported properties are: ok, cancel, yes and no.  Generally you should include a locale-specific
     * resource file for handling language support across the framework.
     * Customize the default text like so: Ext.MessageBox.buttonText.yes = "oui"; //french
     * @type Object
     */
    buttonText: {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
    },

    buttonIds: [
        'ok', 'yes', 'no', 'cancel'
    ],

    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
    },

    makeButton: function(btnIdx) {
        var btnId = this.buttonIds[btnIdx];
        return Ext.create('Ext.button.Button', {
            handler: this.btnCallback,
            name: btnId,
            scope: this,
            text: this.buttonText[btnId],
            hidden: true,
            minWidth: 75
        });
    },

    btnCallback: function(btn) {
        var me = this,
            value,
            field;

        if (me.cfg.prompt) {
            if (me.multiline) {
                field = me.textArea;
            } else {
                field = me.textField;
            }
            value = field.getValue();
            field.reset();
        }

        // Important not to have focus remain in the hidden Window; Interferes with DnD.
        btn.blur();
        me.hide();
        me.userCallback(btn.name, value, me.cfg);
    },

    hide: function() {
        this.progressBar.reset();
        this.removeCls(this.cfg.cls);
        this.callParent();
    },

    initComponent: function() {
        var me = this,
            i;

        me.title = '&#160;';

        me.topContainer = new Ext.container.Container({
            anchor: '100%',
            layout: {
                padding: 10,
                type: 'hbox'
            },
            items: [
                me.iconComponent = new Ext.Component({
                    cls: 'ext-mb-icon',
                    width: 50,
                    height: 35,
                    margins: '0 10 0 0'
                }),
                me.promptContainer = new Ext.container.Container({
                    flex: 1,
                    layout: {
                        type: 'anchor'
                    },
                    defaults: {
                        hideLabel: true,
                        labelWidth: 0
                    },
                    items: [
                        me.msg = new Ext.Component({
                            autoEl: { tag: 'span' },
                            cls: 'ext-mb-text'
                        }),
                        me.textField = new Ext.form.Text({
                            anchor: '100%',
                            hideLabel: true
                        }),
                        me.textArea = new Ext.form.TextArea({
                            anchor: '100%',
                            hideLabel: true,
                            height: 75
                        })
                    ]
                })
            ]
        });
        me.progressBar = new Ext.ProgressBar({
            anchor: '-10',
            style: 'margin-left:10px'
        });

        me.items = [me.topContainer, me.progressBar];

        // Create the buttons based upon passed bitwise config
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            me.msgButtons.push(me.makeButton(i));
        }
        me.bottomTb = new Ext.toolbar.Toolbar({
            ui: 'footer',
            dock: 'bottom',
            items: [
                {xtype: 'component', flex: 1},
                me.msgButtons[0],
                me.msgButtons[1],
                me.msgButtons[2],
                me.msgButtons[3],
                {xtype: 'component', flex: 1}
            ]
        });
        me.dockedItems = [me.bottomTb];

        me.callParent();
    },

    reconfigure: function(cfg) {
        var me = this,
            buttons = cfg.buttons || 0,
            hideToolbar = true;

        cfg = cfg || {};
        me.cfg = cfg;

        // Default to allowing the Window to take focus.
        delete me.defaultFous;

        // Clear the hidden flag so that the elements are sized correctly before being shown
        // This is because the elements needs to be measured when updated.
        me.hidden = false;
        if (!me.rendered) {
            me.render(Ext.getBody());
            me.frameHeight = me.el.getHeight() - me.body.getHeight();
            me.frameWidth = me.el.getWidth() - me.body.getWidth();
        } else {
            me.setSize(me.maxWidth, me.minHeight);
        }
        me.hidden = true;

        // wrap the user callback
        me.userCallback = Ext.Function.bind(cfg.callback || Ext.emptyFn, cfg.scope || Ext.global);

        // Defaults to modal
        me.modal = cfg.modal !== false;

        // Show the title
        if (cfg.title) {
            me.setTitle(cfg.title||'&#160;');
        }

        // Hide or show the close tool
        me.closable = cfg.closable;
        if (cfg.closable === false) {
            me.tools.close.hide();
        } else {
            me.tools.close.show();
        }

        // Hide or show the icon Component
        if (cfg.icon) {
            me.iconComponent.show();
            me.iconComponent.removeCls(me.iconCls);
            me.iconComponent.addCls(me.iconCls = cfg.icon);
        } else {
            me.iconComponent.hide();
        }

        // Hide or show the message area
        if (cfg.msg) {
            me.msg.update(cfg.msg);
            me.msg.show();
        } else {
            me.msg.hide();
        }

        // Hide or show the input field
        if (cfg.prompt || cfg.multiline) {
            me.multiline = cfg.multiline;
            if (cfg.multiline) {
                me.textArea.setValue(cfg.value);
                me.textArea.setHeight(cfg.defaultTextHeight || me.defaultTextHeight);
                me.textArea.show();
                me.textField.hide();
                me.defaultFocus = me.textArea;
            } else {
                me.textField.setValue(cfg.value);
                me.textArea.hide();
                me.textField.show();
                me.defaultFocus = me.textField;
            }
        } else {
            me.textArea.hide();
            me.textField.hide();
        }

        // Hide or show the progress bar
        if (cfg.progress || cfg.wait) {
            me.progressBar.show();
            me.updateProgress(0, cfg.progressText);
            if(cfg.wait === true){
                me.progressBar.wait(cfg.waitConfig);
            }
        } else {
            me.progressBar.hide();
        }

        // Hide or show buttons depending on flag value sent.
        for (i = 0; i < 4; i++) {
            if (buttons & Math.pow(2, i)) {

                // Default to focus on the first visible button if focus not already set
                if (!me.defaultFocus) {
                    me.defaultFocus = me.msgButtons[i];
                }
                me.msgButtons[i].show();
                hideToolbar = false;
            } else {
                me.msgButtons[i].hide();
            }
        }

        // Hide toolbar if no buttons to show
        if (hideToolbar) {
            me.bottomTb.hide();
        } else {
            me.bottomTb.show();
        }
    },

    /**
     * Displays a new message box, or reinitializes an existing message box, based on the config options
     * passed in. All display functions (e.g. prompt, alert, etc.) on MessageBox call this function internally,
     * although those calls are basic shortcuts and do not support all of the config options allowed here.
     * @param {Object} config The following config options are supported: <ul>
     * <li><b>animEl</b> : String/Element<div class="sub-desc">An id or Element from which the message box should animate as it
     * opens and closes (defaults to undefined)</div></li>
     * <li><b>buttons</b> : Object/Boolean<div class="sub-desc">A button config object (e.g., Ext.MessageBox.OKCANCEL or {ok:'Foo',
     * cancel:'Bar'}), or false to not show any buttons (defaults to false)</div></li>
     * <li><b>closable</b> : Boolean<div class="sub-desc">False to hide the top-right close button (defaults to true). Note that
     * progress and wait dialogs will ignore this property and always hide the close button as they can only
     * be closed programmatically.</div></li>
     * <li><b>cls</b> : String<div class="sub-desc">A custom CSS class to apply to the message box's container element</div></li>
     * <li><b>defaultTextHeight</b> : Number<div class="sub-desc">The default height in pixels of the message box's multiline textarea
     * if displayed (defaults to 75)</div></li>
     * <li><b>fn</b> : Function<div class="sub-desc">A callback function which is called when the dialog is dismissed either
     * by clicking on the configured buttons, or on the dialog close button, or by pressing
     * the return button to enter input.
     * <p>Progress and wait dialogs will ignore this option since they do not respond to user
     * actions and can only be closed programmatically, so any required function should be called
     * by the same code after it closes the dialog. Parameters passed:<ul>
     * <li><b>buttonId</b> : String<div class="sub-desc">The ID of the button pressed, one of:<div class="sub-desc"><ul>
     * <li><tt>ok</tt></li>
     * <li><tt>yes</tt></li>
     * <li><tt>no</tt></li>
     * <li><tt>cancel</tt></li>
     * </ul></div></div></li>
     * <li><b>text</b> : String<div class="sub-desc">Value of the input field if either <tt><a href="#show-option-prompt" ext:member="show-option-prompt" ext:cls="Ext.MessageBox">prompt</a></tt>
     * or <tt><a href="#show-option-multiline" ext:member="show-option-multiline" ext:cls="Ext.MessageBox">multiline</a></tt> is true</div></li>
     * <li><b>opt</b> : Object<div class="sub-desc">The config object passed to show.</div></li>
     * </ul></p></div></li>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope of the callback function</div></li>
     * <li><b>icon</b> : String<div class="sub-desc">A CSS class that provides a background image to be used as the body icon for the
     * dialog (e.g. Ext.MessageBox.WARNING or 'custom-class') (defaults to '')</div></li>
     * <li><b>iconCls</b> : String<div class="sub-desc">The standard {@link Ext.Window#iconCls} to
     * add an optional header icon (defaults to '')</div></li>
     * <li><b>maxWidth</b> : Number<div class="sub-desc">The maximum width in pixels of the message box (defaults to 600)</div></li>
     * <li><b>minWidth</b> : Number<div class="sub-desc">The minimum width in pixels of the message box (defaults to 100)</div></li>
     * <li><b>modal</b> : Boolean<div class="sub-desc">False to allow user interaction with the page while the message box is
     * displayed (defaults to true)</div></li>
     * <li><b>msg</b> : String<div class="sub-desc">A string that will replace the existing message box body text (defaults to the
     * XHTML-compliant non-breaking space character '&amp;#160;')</div></li>
     * <li><a id="show-option-multiline"></a><b>multiline</b> : Boolean<div class="sub-desc">
     * True to prompt the user to enter multi-line text (defaults to false)</div></li>
     * <li><b>progress</b> : Boolean<div class="sub-desc">True to display a progress bar (defaults to false)</div></li>
     * <li><b>progressText</b> : String<div class="sub-desc">The text to display inside the progress bar if progress = true (defaults to '')</div></li>
     * <li><a id="show-option-prompt"></a><b>prompt</b> : Boolean<div class="sub-desc">True to prompt the user to enter single-line text (defaults to false)</div></li>
     * <li><b>proxyDrag</b> : Boolean<div class="sub-desc">True to display a lightweight proxy while dragging (defaults to false)</div></li>
     * <li><b>title</b> : String<div class="sub-desc">The title text</div></li>
     * <li><b>value</b> : String<div class="sub-desc">The string value to set into the active textbox element if displayed</div></li>
     * <li><b>wait</b> : Boolean<div class="sub-desc">True to display a progress bar (defaults to false)</div></li>
     * <li><b>waitConfig</b> : Object<div class="sub-desc">A {@link Ext.ProgressBar#waitConfig} object (applies only if wait = true)</div></li>
     * <li><b>width</b> : Number<div class="sub-desc">The width of the dialog in pixels</div></li>
     * </ul>
     * Example usage:
     * <pre><code>
Ext.Msg.show({
title: 'Address',
msg: 'Please enter your address:',
width: 300,
buttons: Ext.MessageBox.OKCANCEL,
multiline: true,
fn: saveAddress,
animEl: 'addAddressBtn',
icon: Ext.MessageBox.INFO
});
</code></pre>
     * @return {Ext.MessageBox} this
     */
    show: function(cfg) {
        var me = this;
        me.reconfigure(cfg);
        me.callParent();
        return me.doAutoSize();
    },

    doAutoSize: function() {
        var me = this;

        // Allow per-invocation override of minWidth
        me.minWidth = me.cfg.minWidth || Ext.getClass(this).prototype.minWidth;

        // Set best possible size based upon allowing the text to wrap in the maximized Window, and
        // then constraining it to within the max with. Then adding up constituent element heights.
        me.promptContainer.el.setHeight('auto');
        var width = me.cfg.width || me.msg.getWidth() + (me.iconComponent.isVisible() ? me.iconComponent.getWidth() + 10 : 0) + 20, /* topContainer's layout padding */
            height = Math.max(me.promptContainer.getHeight(), me.iconComponent.getHeight()) +
            (me.progressBar.isVisible() ? me.progressBar.getHeight() : 0) +
            (me.bottomTb.isVisible() ? me.bottomTb.getHeight() : 0)  + 20 ;/* topContainer's layout padding */
        me.setSize(width + me.frameWidth, height + me.frameHeight);
        me.center();
        return me;
    },

    updateText: function(text) {
        this.msg.update(text);
        return this.doAutoSize();
    },

    /**
     * Updates a progress-style message box's text and progress bar. Only relevant on message boxes
     * initiated via {@link Ext.MessageBox#progress} or {@link Ext.MessageBox#wait},
     * or by calling {@link Ext.MessageBox#show} with progress: true.
     * @param {Number} value Any number between 0 and 1 (e.g., .5, defaults to 0)
     * @param {String} progressText The progress text to display inside the progress bar (defaults to '')
     * @param {String} msg The message box's body text is replaced with the specified string (defaults to undefined
     * so that any existing body text will not get overwritten by default unless a new value is passed in)
     * @return {Ext.MessageBox} this
     */
    updateProgress : function(value, progressText, msg){
        this.progressBar.updateProgress(value, progressText);
        if (msg){
            this.updateText(msg);
        }
        return this;
    },

    onEsc: function() {
        if (this.closable !== false) {
            this.callParent(arguments);
        }
    },

    confirm: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                icon: 'ext-mb-question',
                msg: msg,
                buttons: this.YESNO,
                callback: fn,
                scope: scope
            };
        }
        return this.show(cfg);
    },
    prompt : function(cfg, msg, fn, scope, multiline, value){
        if (Ext.isString(cfg)) {
            cfg = {
                prompt: true,
                title: cfg,
                icon: 'ext-mb-question',
                msg: msg,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                multiline: multiline,
                value: value
            };
        }
        return this.show(cfg);
    },
    wait : function(cfg, title, config){
        if (Ext.isString(cfg)) {
            cfg = {
                title : title,
                msg : cfg,
                closable: false,
                wait: true,
                modal: true,
                minWidth: this.minProgressWidth,
                waitConfig: config
            };
        }
        return this.show(cfg);
    },
    alert: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title : cfg,
                msg : msg,
                buttons: this.OK,
                fn: fn,
                scope : scope,
                minWidth: this.minWidth
            };
        }
        return this.show(cfg);
    },
    progress : function(cfg, msg, progressText){
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                msg: msg,
                progressText: progressText
            };
        }
        return this.show(cfg);
    }
}, function() {
    Ext.MessageBox = Ext.Msg = new this();
});