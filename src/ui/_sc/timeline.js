/**
 * 2016.5.18
 * Timeline ver 1.0
 * Author : dududu1
 */


(function() {
    

    function Timeline(option) {

        var scope = this;
        this.option     = { stats : false, step: false};
        $.extend(this.option, option);

        this.frame = {
            root : scope,
            current : 0,
            total : 0
        };
        
        this.direction = "";
        this.isAnimate = false;        
        this.labels = [];
        this.actionItems = [];
    }
    
    
    Timeline.prototype.constructor = Timeline;
    Timeline.prototype.ON_UPDATE_FRAME = "on_update_frame";

    Timeline.prototype.addTweens = function(tObj) {

        if(tObj instanceof Array){ 
            
            for(var i = 0; i<tObj.length; i++){
                    
                var obj = tObj[i];                    
                if ( typeof obj == "undefined") continue;
                if ( typeof obj.id == "undefined") continue;
                if ( typeof obj.target == "undefined") continue;
                if ( typeof obj.animate == "undefined") continue; 
                                   
                var id = obj.id;
                var target = obj.target;
                var animate = obj.animate;
                this.addTween(id, target, animate);
                    
            }
                       
        }else{  
                             
            if ( typeof tObj == "undefined") return;
            if ( typeof tObj.id == "undefined") return;
            if ( typeof tObj.target == "undefined") return;
            if ( typeof tObj.animate == "undefined") return; 
                                   
            var id = tObj.id;
            var target = tObj.target;
            var animate = tObj.animate;
            this.addTween(id, target, animate);     
        }

    };


    Timeline.prototype.getCurrentFrame = function() {
        
        return this.frame.current;
    };
    
    
    Timeline.prototype.getFrame = function(label) {

        for (var o in this.labels) {
            if (this.labels[o].label == label)
                return this.labels[o].frame;
        }

        return -1;
    };


    Timeline.prototype.addLabel = function(label, frame) {

        for (var o in this.labels) {
            if (this.labels[o].label == label) return;
        }        
        var label = new Label(label, frame);
        this.labels.push(label);
        if (this.frame.total < frame) this.frame.total = frame;
    };
    
    
    Timeline.prototype.clear = function() {            
            
        $(this.frame).clearQueue().stop();
        
        this.frame.current = 0;
        this.frame.total = 0;        
        
        this.labels = null;
        this.actionItems = null;
    };
    

    Timeline.prototype.remove = function(id) { 
        
        var maxNum = 0;
        
        for (var o in this.actionItems) {            
                        
            if (this.actionItems[o].id == id) {                
                var idx = this.actionItems.indexOf(this.actionItems[o]);
                this.actionItems[o].clear();
                this.actionItems.splice(idx, 1);
                break;
            }            
        }
        
        for (var o in this.actionItems) {   
            var endframe = this.actionItems[o].obj.endframe;           
            if(maxNum < endframe) maxNum = endframe;            
        }        
        
        this.frame.total = maxNum;
        if (this.frame.current >= this.frame.total) this.frame.current = this.frame.total;        
        
    };
    
    
    Timeline.prototype.pause = function(id, flag) {

        for (var o in this.actionItems) {
            if (this.actionItems[o].id == id) {
                var idx = this.actionItems.indexOf(this.actionItems[o]);
                this.actionItems[idx].pause = flag;
                return;
            }
        }

    };

    Timeline.prototype.removes = function(arr) {
        
        if(arr instanceof Array){            
            for (var i = 0; i < arr.length; i++) this.remove(arr[i]);           
        }else{            
            this.remove(arr);
        }        
    };


    Timeline.prototype.pauses = function(flag,arr) {

        if(arr instanceof Array){            
            for (var i = 0; i < arr.length; i++) this.pause(arr[i], flag);            
        }else{            
            this.pause(arr, flag);
        }
    };

    Timeline.prototype.replaceTween = function(id, $target, obj) {
        
        this.remove(id);
        this.addTween(id, $target, obj);
        
    };

    Timeline.prototype.addTween = function(id, $target, obj) {

        if ( typeof id == "undefined") return;
        if ( typeof $target == "undefined") return;
        if ( typeof obj == "undefined") return;
        if ( typeof obj.startframe == "undefined") return;
        if ( typeof obj.endframe == "undefined") return;
        
        for (var o in this.actionItems) {
            if (this.actionItems[o].id == id) return;
        }

        var startframe = obj.startframe;
        var endframe = obj.endframe;
        var tween = new TweenAction(id, $target, obj);
        
        tween.stage = this;
        tween.init();     
        
        this.actionItems.push(tween);          

        if (this.frame.total < endframe) this.frame.total = endframe;
        
    };

    Timeline.prototype.status = function() {

        if ( typeof this.timelineStatus == 'undefined') {
            
            this.timelineStatus = "<div id='timelineStatus' style='position:absolute; left:0px; z-index:10000; padding:10px; font-size:12px; background-color:#000; color:#fff'></div>";
            $('body').prepend(this.timelineStatus);
            this.timelineStatus = $("#timelineStatus");
        }
        this.timelineStatus.html(" totalframe = " + this.frame.total + " / " + " currentframe = " + this.frame.current.toFixed(0));
        
    };

    Timeline.prototype.gotoLabel = function(label, option) {

        var frame = this.getFrame(label);
        if (frame < 0) return;

        this.gotoFrame(frame, option);
    };

    Timeline.prototype.animation = function() {        

        for (var a in this.actionItems) this.actionItems[a].update();        
        if(this.option.stats) this.status();
        
        $(this).trigger(this.ON_UPDATE_FRAME, this.frame);

    };

    Timeline.prototype.gotoFrame = function(frame, option) {

        if(this.option.step && this.isAnimate) return;                 
        this.isAnimate = true;        
        
        if (this.frame.current < frame) {
            this.direction = 1;
        } else {
            this.direction = 0;
        }
        
        var scope = this;
        var obj = { current : frame };       
        var config = typeof option != "undefined" ? option : {duration : 0, ease : "linear"};
        
        
        if (config.duration == 0) {
            
            $.extend(scope.frame, obj);
            onComplete();
            
        } else {            
            
            $(scope.frame).clearQueue().stop().animate(obj, {
                step : stepAnimation,
                duration : config.duration,
                easing : config.ease,
                complete : onComplete
            });
        }

        function onComplete() { 
                        
            scope.isAnimate = false; 
            stepAnimation();             
        }

        function stepAnimation() {            
            scope.animation();            
        }
    };

    

    function Label(label, frame) {

        this.label = label;
        this.frame = frame;

    };

    Label.prototype.constructor = Label;

    function TweenAction(id, $target, obj) {
        
        this.id = id;
        this.obj = obj;
        this.$target = $target;
        
        this.stage = null;
        this.children = null;        
        
        this.pause = false;    
        this.progress = 0;
        this.oldProgress = -1;
        this.seqId = -1;
        
        this.valuesStart = {};
        this.valuesEnd = {};
        this.valuesObj = {};        
        

        this.init = function() {

            var startframe = obj.startframe;
            var endframe = obj.endframe;
            var startObj = obj.start;
            var endObj = obj.end;            
            
            this.children = obj.children;            
            
            this.easingFunction = (typeof obj.ease =="undefined")? Ease.easeOutQuad : obj.ease;          
            
            this.frame = {
                start : startframe,
                end : endframe,
                total : endframe-startframe
            };
            this.pause = false;
            this.seqId = -1;
           
                
            for (var field in startObj ) {
                
                if(typeof startObj[field] == 'object'){
                    this.valuesStart[field] = startObj[field];                     
                }else if(typeof startObj[field] == 'number'){                    
                    this.valuesStart[field] = parseFloat(startObj[field], 10);
                }else if(typeof startObj[field] == 'string'){                    
                    this.valuesStart[field] = startObj[field];
                }                            
            }
            
            for (var field in endObj ) {
                
                if(typeof endObj[field] == 'object'){
                    this.valuesEnd[field] = endObj[field];                    
                }else if(typeof endObj[field] == 'number'){                  
                    this.valuesEnd[field] = parseFloat(endObj[field], 10);
                }else if(typeof endObj[field] == 'string'){                  
                    this.valuesEnd[field] = endObj[field];
                }                      
            }
            
            for (var i in this.stage.actionItems){
            	if (this.stage.actionItems[i].$target[0] == $target[0]) return;  
            }     	
        	
        	this.update();
        	
        };
                

        this.update = function(progVal) {
            
            this.progress = progVal? progVal : (this.stage.frame.current - this.frame.start) / this.frame.total;
            if (this.oldProgress == this.progress) return;
            if (this.pause) return;
            
            if (this.progress <= 0.001) this.progress = 0;
            if (this.progress >= 0.999) this.progress = 1;                   
            
            this.tween(this.progress);
            this.oldProgress = this.progress;            
            
        };
        
        this.changeObjectToString = function(startObj, endObj, easeVal){
           
            var start, end, cal, val;
            var obj = {};
            
            for (var prop in endObj ) {

                start = startObj[prop];
                end = endObj[prop];                
                
                cal = (end - start ) * easeVal;
                val = start + cal;                
                val = parseFloat(val.toFixed(2));               
                
                obj[prop] = val;                        
            }
            
            return obj;
        };
        
        
        this.clear = function(){
            
            this.id = null;
            this.obj = null;
            this.$target = null;            
            this.stage = null;
            this.children = null;       
            
            this.pause = null;    
            this.progress = null;
            this.oldProgress = null;
            this.seqId = null;
                     
            this.valuesStart = null;
            this.valuesEnd = null;
            this.valuesObj = null; 
            
        };
        
        this.convertString = function(obj){            
            
            var str ='';
            var strUnits ='px';           
                
            for (var prop in obj){      
                
                if(prop.toString().indexOf('rotate')>-1) strUnits = 'deg';
                if(prop.toString().indexOf('skew')>-1) strUnits = 'deg';   
                if(prop.toString().indexOf('scale')>-1) strUnits = '';                                                          
                                
                str += prop+'('+obj[prop]+strUnits+') ';
            }                    
            
            return str;            
        };
        
        
        this.setCss = function(obj){            
            
           var newObj = {};
           
           for (var prop in obj ) {
               
               if(typeof obj[prop] != 'object'){
                   newObj[prop] = obj[prop];
                }else{                    
                   newObj[prop] = this.convertString(obj[prop]);     
                }  
            } 
            this.$target.css(newObj);      
                  
        };
        
        
        this.tween = function(d) {

            var value = this.easingFunction(d);
            var start, end, cal, val;   

            for (var property in this.valuesEnd ) {

                start = this.valuesStart[property];
                end = this.valuesEnd[property];
                cal = 0.0;
                val = 0.0;                     
                
                if ( end instanceof Array) {

                    val = Interpolation.bezier(end, value);
                    val = parseFloat(val.toFixed(2));
                    
                } else {                    
                                       
                    if ( typeof end == "number") {

                        cal = (end - start ) * value;
                        val = start + cal;
                        val = parseFloat(val.toFixed(2));
                                                
                    }else if(typeof end == "object"){      
                                          
                        val = this.changeObjectToString(start, end, value);   
                                             
                    }else{          
                        
                        if(d == 0) val = start;
                        if(d == 1) val = end;
                    }                                         
                }
                
                this.valuesObj[property] = val;
                
              
                if (property == "sequence") {

                    var seq_id = val.toFixed(0);
                    if (seq_id != this.seqId) {
                        
                        if (this.children != null && this.children !== undefined) {                            
                            $(this.children[seq_id]).css({ visibility : 'visible' });
                            if (this.seqId != -1) $(this.children[this.seqId]).css({ visibility : 'hidden'});
                        }                        
                        this.seqId = seq_id;
                    }
                }

            }

            this.setCss(this.valuesObj);
            
        };

    };

    TweenAction.prototype.constructor = TweenAction;
    this.Timeline = Timeline;

}).call(this);



var Interpolation = {

    bezier : function(v, k) {
        
        var b = 0, n = v.length - 1, bn = Interpolation.bernstein, i, bc, k1, k2, k3;
        
        for ( i = 0; i <= n; i++) {

            bc = bn(n, i);
            k1 = Math.pow(1 - k, n - i);
            k2 = Math.pow(k, i);
            k3 = v[i];
            b += k1 * k2 * k3 * bc;
        }

        return b;

    },

    bernstein : function(n, i) {

        var fc = Interpolation.factorial;
        var a1 = fc(n);
        var b1 = fc(i);
        var c1 = fc(n - i);

        return a1 / b1 / c1;

    },
    factorial : function(n, i) {

        var a = [1];
        var s = 1, i;
        if (a[n]) return a[n];
        for ( i = n; i > 1; i--) s *= i;
        return a[n] = s;

    }
};



var Ease = {

    easeNone : function(k) {

        return k;

    },

    easeInQuad : function(k) {

        return k * k;

    },

    easeOutQuad : function(k) {

        return k * (2 - k );

    },

    easeInOutQuad : function(k) {

        if ((k *= 2 ) < 1) return 0.5 * k * k;
        return -0.5 * (--k * (k - 2 ) - 1 );

    },

    easeInQuart : function(k) {

        return k * k * k * k;

    },

    easeOutQuart : function(k) {

        return 1 - (--k * k * k * k );

    },

    easeInOutQuart : function(k) {

        if ((k *= 2 ) < 1) return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2 ) * k * k * k - 2 );

    },
    easeInQuint : function(k) {

        return k * k * k * k * k;

    },

    easeOutQuint : function(k) {

        return --k * k * k * k * k + 1;

    },

    easeInOutQuint : function(k) {

        if ((k *= 2 ) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2 ) * k * k * k * k + 2 );

    },
    
    easeInElastic : function(k) {

        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p * Math.asin(1 / a) / (2 * Math.PI );
        }
        return -(a * Math.pow(2, 10 * (k -= 1 )) * Math.sin((k - s ) * (2 * Math.PI ) / p) );

    },

    easeOutElastic : function(k) {

        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p * Math.asin(1 / a) / (2 * Math.PI );
        }
        return (a * Math.pow(2, -10 * k) * Math.sin((k - s ) * (2 * Math.PI ) / p) + 1 );

    },

    easeInOutElastic : function(k) {

        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1;
            s = p / 4;
        } else { 
            s = p * Math.asin(1 / a) / (2 * Math.PI );
        }
        if ((k *= 2 ) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1 )) * Math.sin((k - s ) * (2 * Math.PI ) / p) );
        return a * Math.pow(2, -10 * (k -= 1 )) * Math.sin((k - s ) * (2 * Math.PI ) / p) * 0.5 + 1;

    },
    easeInBack : function(k) {

        var s = 1.70158;
        return k * k * ((s + 1 ) * k - s );

    },

    easeOutBack : function(k) {

        var s = 1.70158;
        return --k * k * ((s + 1 ) * k + s ) + 1;

    },

    easeInOutBack : function(k) {

        var s = 1.70158 * 1.525;
        if ((k *= 2 ) < 1) return 0.5 * (k * k * ((s + 1 ) * k - s ) );
        return 0.5 * ((k -= 2 ) * k * ((s + 1 ) * k + s ) + 2 );

    },
    easeInBounce : function(k) {

        return 1 - Ease.easeOutBounce(1 - k);

    },

    easeOutBounce : function(k) {

        if (k < (1 / 2.75 )) {

            return 7.5625 * k * k;

        } else if (k < (2 / 2.75 )) {

            return 7.5625 * (k -= (1.5 / 2.75 ) ) * k + 0.75;

        } else if (k < (2.5 / 2.75 )) {

            return 7.5625 * (k -= (2.25 / 2.75 ) ) * k + 0.9375;

        } else {

            return 7.5625 * (k -= (2.625 / 2.75 ) ) * k + 0.984375;

        }

    },

    easeInOutBounce : function(k) {

        if (k < 0.5) return Ease.easeInBounce(k * 2) * 0.5;
        return Ease.easeOutBounce(k * 2 - 1) * 0.5 + 0.5;

    }
};

