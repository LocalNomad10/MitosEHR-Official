/**
 * @class Ext.chart.Labels
 */
Ext.define('Ext.chart.Labels', {

    /* Begin Definitions */

    requires: ['Ext.draw.Color'],
    
    /* End Definitions */

    /**
     * @cfg {String} labelDisplay
     * Specifies the presence and position of labels for each pie slice. Either "rotate", "middle", "insideStart",
     * "insideEnd", "outside", "over", "under", or "none" to prevent label rendering.
     */

    /**
     * @cfg {String} labelColor
     * The color of the label text
     */

    /**
     * @cfg {String} labelField
     * The name of the field to be displayed in the label
     */

    /**
     * @cfg {Number} labelMinMargin
     * Specifies the minimum distance from a label to the origin of the visualization.
     * This parameter is useful when using PieSeries width variable pie slice lengths.
     * Default value is 50.
     */

    /**
     * @cfg {String} labelFont
     * The font used for the labels
     */

    /**
     * @cfg {String} labelOrientation
     * Either "horizontal" or "vertical"
     */

    /**
     * @cfg {Function} labelRenderer
     * Optional function for formatting the label into a displayable value
     * @param v
     */

    colorStringRe: /url\s*\(\s*#([^\/)]+)\s*\)/,

    constructor: function(config) {
        var me = this;
        me.label = Ext.applyIf(me.label || {},
        {
            display: "none",
            color: "#000",
            field: "name",
            minMargin: 50,
            font: "11px Helvetica, sans-serif",
            orientation: "horizontal",
            renderer: function(v) {
                return v;
            }
        });

        if (me.label.display !== 'none') {
            me.labelsGroup = me.chart.surface.getGroup(me.seriesId + '-labels');
        }
    },

    renderLabels: function() {
        var me = this,
            chart = me.chart,
            gradients = chart.gradients,
            gradient,
            items = me.items,
            animate = chart.animate,
            config = me.label,
            display = config.display,
            color = config.color,
            field = [].concat(config.field),
            group = me.labelsGroup,
            store = me.chart.store,
            len = store.getCount(),
            ratio = items.length / len,
            i, count, j, 
            k, gradientsCount = (gradients || 0) && gradients.length,
            colorStopTotal, colorStopIndex, colorStop,
            item, label, storeItem,
            sprite, spriteColor, spriteBrightness, labelColor,
            Color = Ext.draw.Color,
            colorString;

        if (display == 'none') {
            return;
        }

        for (i = 0, count = 0; i < len; i++) {
            for (j = 0; j < ratio; j++) {
                item = items[count];
                label = group.getAt(count);
                storeItem = store.getAt(i);
                
                if (!item && label) {
                    label.hide(true);
                }
                
                if (item && field[j]) {
                    if (!label) {
                        label = me.onCreateLabel(storeItem, item, i, display, j, count);
                    }
                    me.onPlaceLabel(label, storeItem, item, i, display, animate, j, count);
                    
                    //set contrast
                    if (config.contrast && item.sprite) {
                        sprite = item.sprite;
                        colorString = sprite._to && sprite._to.fill || sprite.attr.fill;
                        spriteColor = Color.fromString(colorString);
                        //color wasn't parsed property maybe because it's a gradient id
                        if (colorString && !spriteColor) {
                            colorString = colorString.match(me.colorStringRe)[1];
                            for (k = 0; k < gradientsCount; k++) {
                                gradient = gradients[k];
                                if (gradient.id == colorString) {
                                    //avg color stops
                                    colorStop = 0; colorStopTotal = 0;
                                    for (colorStopIndex in gradient.stops) {
                                        colorStop++;
                                        colorStopTotal += Color.fromString(gradient.stops[colorStopIndex].color).getGrayscale();
                                    }
                                    spriteBrightness = (colorStopTotal / colorStop) / 255;
                                    break;
                                }
                            }
                        }
                        else {
                            spriteBrightness = spriteColor.getGrayscale() / 255;
                        }
                        labelColor = Color.fromString(label.attr.color || label.attr.fill).getHSL();
                        
                        labelColor[2] = spriteBrightness > 0.5? 0.2 : 0.8;
                        label.setAttributes({
                            fill: String(Color.fromHSL.apply({}, labelColor))
                        }, true);
                    }
                }
                count++;
            }
        }
        me.hideLabels(count);
    },

    hideLabels: function(index) {
        var labelsGroup = this.labelsGroup, len;
        if (labelsGroup) {
            len = labelsGroup.getCount();
            while (len-->index) {
                labelsGroup.getAt(len).hide(true);
            }
        }
    }
});