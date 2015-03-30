/*  @author yusupov
*   @version 1.0
*
*   jQuery плагин для выравнивания элементов
*
*   $('.container').alignelements();
*   $('.container').alignelements(false);
*   $('.container').alignelements('.title');
*   $('.container').alignelements('.title', false);
*   $('.container').alignelements({
*       items : '>li',
*       by    : '.title',
*       liquid: false,
*       useDebounceAfter: 35
*   });
*/
;
(function($, win) {
    'use strict';

    var __pluginName = 'alignelements';
    var $win = $(win);
    var isMobile =  (/android|blackberry|iphone|ipad|ipod|iemobile|opera mini/i).test(navigator.userAgent);

    var debounce = (function () {
        return function (fn, time) {
            var timer;
            var func = function () {
                win.clearTimeout(timer);
                timer = win.setTimeout(function () {
                    fn();
                }, time);
            }
            return func;
        }
    }());

    function getMaxHeight ($elems, self) {
        var height = 0, i, elemHeight;
        for (i = $elems.length - 1; i >= 0; i--) {
            elemHeight = Math.ceil(Math.max($elems.eq(i).height(), +$elems.eq(i).data('min-height') || 0));
            if (elemHeight > height) height = elemHeight;
        };
        return height;
    }

    function getMaxHeights ($elems) {
        var heights = [], $inners, $inner, i, j, innerHeight;
        for (i = $elems.length - 1; i >= 0; i--) {
            $inners = $elems.eq(i).data('by');
            for (j = 0; j < $inners.length; j++) {
                $inner = $inners.eq(j);
                innerHeight = Math.ceil(Math.max($inner.height(), +$inner.data('min-height') || 0));
                if ( !heights[j] || heights[j] < innerHeight ) heights[j] = innerHeight;
            };
        };
        return heights;
    }

    function getColCount ($elems) {
        var bottom, i, l;
        bottom = $elems.get(0).getBoundingClientRect().bottom;
        for (i = 1, l = $elems.length; i < l; i++) {
            if ($elems.get(i).getBoundingClientRect().top >= bottom) {
                return i;
            }
        };
        return $elems.length;
    }

    function resetHeight ($elems, mode) {
        var $elem, $inner, $inners, i, j;

        if (mode === 'byinner') {
            for (i = $elems.length - 1; i >= 0; i--) {
                $inner = $elems.eq(i).data('by');
                $inner.css('min-height', $inner.data('min-height') || 1);
            };
        } else if (mode === 'byinners') {
            for (i = $elems.length - 1; i >= 0; i--) {
                $inners = $elems.eq(i).data('by');
                for (j = $inners.length - 1; j >= 0; j--) {
                    $inner = $inners.eq(j);
                    $inner.css('min-height', $inner.data('min-height') || 1);
                };                
            };
        } else if (mode === 'byitem') {
            $elems.css('min-height', 1);
            for (i = $elems.length - 1; i >= 0; i--) {
                $elem = $elems.eq(i);
                $elem.css('min-height', $elem.data('min-height') || 1);
            };
        }
    }

    function alignRow ($elems, rowHeight, mode) {
        var i, j, $item, $inner, $inners, itemHeight;

        for (i = $elems.length - 1; i >= 0; i--) {
            $item = $elems.eq(i);
            itemHeight = $item.height();

            if (itemHeight >= rowHeight) continue;
            if (mode === 'byitem') {
                $item.css('min-height', rowHeight + $item.data('delta'));
            } else if (mode === 'byinner') {
                $inner = $item.data('by');
                $inner.css('min-height', $inner.height() + (rowHeight - itemHeight) + $inner.data('delta'));
            } else if (mode === 'byinners') {
                $inners = $item.data('by');
                for (j = 0; j < $inners.length; j++) {
                    $inner = $inners.eq(j);
                    $inner.css('min-height', rowHeight[j] + $inner.data('delta'));
                };
            }
        };
    }

    function getPixelRatio () {
        var hop = Object.prototype.hasOwnProperty;
        if (hop.call(win, 'devicePixelRatio')) {
            return win.devicePixelRatio;
        } else if ( hop.call(screen, 'deviceXDPI')) {
            return screen.deviceXDPI / screen.logicalXDPI;
        }
    }

    var Obj = function($element, args) {
        var self = this;

        self.$element = $element;
        self.opt = {
            items: null,
            by: null,
            liquid: true,
            useDebounceAfter: 35
        };

        if (args.length === 1) {
            if (typeof args[0] === 'boolean') self.opt.liquid = args[0];
            if (typeof args[0] === 'string') self.opt.by = args[0];
            if (typeof args[0] === 'object') self.opt = $.extend(self.opt, args[0]);
        } else if (args.length === 2) {
            self.opt.by = args[0];
            self.opt.liquid = args[1];
        }

        self.init();
    };

    Obj.prototype = {
        init : function() {
            var self = this,
                i, $item, $inner, $inners;
            
            if (self.inited) self.uninit();

            if (!self.opt.items)  {
                self.$items = self.$element.children();
            } else {
                self.$items = self.$element.find(self.opt.items);
            }

            if (!self.$items.length) return;

            if (self.opt.by) {
                for (i = self.$items.length - 1; i >= 0; i--) {
                    $item = self.$items.eq(i);
                    $item.data('by', $item.find(self.opt.by));
                    if ($item.data('by').length === 1) {
                        self.mode = 'byinner';
                    } else if ($item.data('by').length > 1) {
                        self.mode = 'byinners';
                    }
                    $item.data('by').each(setData);
                };
            } else {
                self.$items.each(setData);
            }

            if (!self.mode) self.mode = 'byitem';

            self.cols = self.getColCount();
            self.ratio = getPixelRatio();
            self.inited = true;
            self.align();
            
            if (self.$items.length >= self.opt.useDebounceAfter || isMobile) onWindowResize = debounce(onWindowResize, 300);

            self._onresize = onWindowResize;
            $win.on('resize.' + __pluginName, self._onresize);

            function setData () {
                var $this = $(this), delta = 0;
                
                switch ($this.css('box-sizing')) {
                    case 'border-box': delta += parseInt($this.css('border-top-width'), 10) +
                                                parseInt($this.css('border-bottom-width'), 10);
                    case 'padding-box': delta += parseInt($this.css('padding-top'), 10) +
                                                 parseInt($this.css('padding-bottom'), 10);
                }

                $this.data('min-height', parseInt($this.css('min-height'), 10));
                $this.data('delta', delta);
            }

            function onWindowResize () {
                var newCols, newRatio, doAlign = false;
                
                if (self.opt.liquid && self.cols !== (newCols = self.getColCount())) {
                    doAlign = true;
                    self.cols = newCols;
                };

                if (self.ratio !== (newRatio = getPixelRatio())) {
                    doAlign = true;
                    self.ratio = newRatio;
                };

                if (doAlign) self.align();
            }
        },
        uninit: function () {
            var self = this, i;
            if (self._onresize) $win.off('resize.' + __pluginName, self._onresize);
            if (self.mode === 'byitem') {
                self.$items.css('min-height', '').removeData('min-height delta');
            } else if (self.mode === 'byinner' || self.mode === 'byinners') {
                for (i = self.$items.length - 1; i >= 0; i--) {
                    self.$items.eq(i).data('by').css('min-height', '').removeData('min-height delta');
                }
            }
            self.$items.removeData('by');
            self.inited = false;
        },
        destroy : function() {
            var self = this;
            self.uninit();
            self.$element.removeData(__pluginName);
        },
        align: function () {
            var self = this, cols = self.cols, counter = 0, rowHeight = 0, innerHeights, $rowItems;
            resetHeight(self.$items, self.mode);
            do {
                $rowItems = self.$items.slice(counter, counter + cols);
                if (self.mode === 'byitem' || self.mode === 'byinner') {
                    rowHeight = getMaxHeight($rowItems, self);
                    alignRow($rowItems, rowHeight, self.mode);
                } else if (self.mode === 'byinners') {
                    innerHeights = getMaxHeights($rowItems, self);
                    alignRow($rowItems, innerHeights, self.mode);
                }
                counter += cols;
            } while (self.$items.length - counter > 0)
        },
        update : function(opt) {
            var self = this;
            if ($.isPlainObject(opt)) self.opt = $.extend(self.opt, opt);
            self.init();
        },
        getColCount: function () {
            return getColCount(this.$items);
        },
        getMode: function () {
            return this.mode;
        }
    };

    $.fn[__pluginName] = function(opt, param) {
        var args = Array.prototype.slice.call(arguments);
        return this.each(function() {
            var $element = $(this);
            var obj;
            if(!!(obj = $element.data(__pluginName))) {
                if(typeof opt === 'string' && !!obj[opt])
                    obj[opt](param);
                else
                    obj.update(opt);
            } else {
                $element.data(__pluginName, new Obj($element, args));
            }
        });
    }
})(jQuery, window);
