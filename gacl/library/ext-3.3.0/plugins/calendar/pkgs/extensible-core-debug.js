/*!
 * Extensible 1.0-alpha1
 * Copyright(c) 2010 ThinkFirst, LLC
 * team@ext.ensible.com
 * http://ext.ensible.com
 */
/**
 * @class Ext.ensible
 * Extensible core utilities and functions.
 * @singleton
 */
(function(){
    
    Ext.ns('Ext.ensible.ux','Ext.ensible.cal');
    
    Ext.apply(Ext.ensible, {
    
        version : '1.0-alpha-1',
        
        hasBorderRadius : !(Ext.isIE || Ext.isOpera),
    
       /**
        * @class Ext.ensible.cal.Date
        * @extends Object
        * <p>Contains utility date functions used by the calendar components.</p>
        * @singleton
        */
	    Date : {
            /**
             * Calculates the number of days between two dates, ignoring time values.
             * @param {Date} start The start date
             * @param {Date} end The end date
             * @return {Number} The number of days difference between the dates
             */
	        diffDays : function(start, end){
	            day = 1000*60*60*24;
	            diff = end.clearTime(true).getTime() - start.clearTime(true).getTime();
	            return Math.ceil(diff/day);
	        },
            
            /**
             * Copies the time value from one date object into another without altering the target's 
             * date value. This function returns a new Date instance without modifying either original value.
             * @param {Date} fromDt The original date from which to copy the time
             * @param {Date} toDt The target date to copy the time to
             * @return {Date} The new date/time value
             */
            copyTime : function(fromDt, toDt){
                var dt = toDt.clone();
                dt.setHours(
                    fromDt.getHours(),
                    fromDt.getMinutes(),
                    fromDt.getSeconds(),
                    fromDt.getMilliseconds());
                
                return dt;
            },
            
            /**
             * Compares two dates and returns a value indicating how they relate to each other.
             * @param {Date} dt1 The first date
             * @param {Date} dt2 The second date
             * @param {Boolean} precise (optional) If true, the milliseconds component is included in the comparison,
             * else it is ignored (the default).
             * @return {Number} The number of milliseconds difference between the two dates. If the dates are equal
             * this will be 0.  If the first date is earlier the return value will be positive, and if the second date
             * is earlier the value will be negative.
             */
            compare : function(dt1, dt2, precise){
                var d1 = dt1, d2 = dt2;
                if(precise !== true){
                    d1 = dt1.clone();
                    d1.setMilliseconds(0);
                    d2 = dt2.clone();
                    d2.setMilliseconds(0);
                }
                return d2.getTime() - d1.getTime();
            },

	        // private helper fn
	        maxOrMin : function(max){
	            var dt = (max ? 0 : Number.MAX_VALUE), i = 0, args = arguments[1], ln = args.length;
	            for(; i < ln; i++){
	                dt = Math[max ? 'max' : 'min'](dt, args[i].getTime());
	            }
	            return new Date(dt);
	        },
	        
            /**
             * Returns the maximum date value passed into the function. Any number of date 
             * objects can be passed as separate params.
             * @param {Date} dt1 The first date
             * @param {Date} dt2 The second date
             * @param {Date} dtN (optional) The Nth date, etc.
             * @return {Date} A new date instance with the latest date value that was passed to the function
             */
			max : function(){
	            return this.maxOrMin.apply(this, [true, arguments]);
	        },
	        
            /**
             * Returns the minimum date value passed into the function. Any number of date 
             * objects can be passed as separate params.
             * @param {Date} dt1 The first date
             * @param {Date} dt2 The second date
             * @param {Date} dtN (optional) The Nth date, etc.
             * @return {Date} A new date instance with the earliest date value that was passed to the function
             */
			min : function(){
	            return this.maxOrMin.apply(this, [false, arguments]);
	        }
	    }
    });
})();

//TODO: remove this once we are synced to trunk again
Ext.override(Ext.XTemplate, {
    applySubTemplate : function(id, values, parent, xindex, xcount){
        var me = this,
            len,
            t = me.tpls[id],
            vs,
            buf = [];
        if ((t.test && !t.test.call(me, values, parent, xindex, xcount)) ||
            (t.exec && t.exec.call(me, values, parent, xindex, xcount))) {
            return '';
        }
        vs = t.target ? t.target.call(me, values, parent) : values;
        len = vs.length;
        parent = t.target ? values : parent;
        if(t.target && Ext.isArray(vs)){
            Ext.each(vs, function(v, i) {
                buf[buf.length] = t.compiled.call(me, v, parent, i+1, len);
            });
            return buf.join('');
        }
        return t.compiled.call(me, vs, parent, xindex, xcount);
    }
});


/* This fix is in Ext 3.2 */
Ext.override(Ext.form.DateField, {
	
	altFormats : "m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j",
	
    safeParse : function(value, format) {
        if (/[gGhH]/.test(format.replace(/(\\.)/g, ''))) {
            // if parse format contains hour information, no DST adjustment is necessary
            return Date.parseDate(value, format);
        } else {
            // set time to 12 noon, then clear the time
            var parsedDate = Date.parseDate(value + ' ' + this.initTime, format + ' ' + this.initTimeFormat);
            if (parsedDate) return parsedDate.clearTime();
        }
    }
});
