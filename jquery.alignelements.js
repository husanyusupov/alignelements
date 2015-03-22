/*
*   jQuery плагин для выравнивания элементов
*
*   $('.container').alignelements();
*   $('.container').alignelements(false);
*   $('.container').alignelements('.title');
*   $('.container').alignelements('.title', false);
*   $('.container').alignelements({
*       items : '>li',
*       by    : '.title',
*       liquid: false
*   });
*/
;
(function($, win) {
    'use strict';

    var __pluginName = 'alignelements';
    var $win = $(win);

    function type (obj, str) {
        var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
        if (type === 'object' && obj == undefined) type = 'null';
        if (!str) return type;
        return type === str;
    }

    function getMaxheight ($elems) {
        var height = 0, i, elemHeight;
        for (i = $elems.length - 1; i >= 0; i--) {
            elemHeight = Math.max($elems.eq(i).height(), +$elems.eq(i).data('min-height') || 0);
            if (elemHeight > height) height = elemHeight;
        };
        return height;
    }

    function getMaxheights ($elems) {
        var heights = [], $inners, i, j, innerHeight;
        for (i = $elems.length - 1; i >= 0; i--) {
            $inners = $elems.eq(i).data('by');
            for (j = 0; j < $inners.length; j++) {
                innerHeight = $inners.eq(j).height();
                if ( !heights[j] || heights[j] < innerHeight ) heights[j] = innerHeight;
            };
        };
        return heights;
    }

    function getColCount ($elems) {
        var bottom, i, l;
        bottom = $elems.get(0).getBoundingClientRect().bottom;
        for (i = 0, l = $elems.length; i < l; i++) {
            if ($elems.get(i).getBoundingClientRect().top >= bottom) {
                return i;
            }
        };
        return $elems.length;
    }

    function resetHeight ($elems, mode) {
        if (mode === 'byinner' || mode === 'byinners') {
            for (var i = $elems.length - 1; i >= 0; i--) {
                $elems.eq(i).data('by').css('min-height', 1);
            };
        } else {
            $elems.css('min-height', 1);
        }
    }

    function alignRow ($elems, rowHeight, mode) {
        var i, j, $item, itemHeight, delta;

        for (i = $elems.length - 1; i >= 0; i--) {
            $item = $elems.eq(i);
            itemHeight = $item.height();

            if (itemHeight >= rowHeight) continue;
            if (mode === 'byitem') {
                delta = 0;
                switch ($item.css('box-sizing')) {
                    case 'border-box': delta = $item.outerHeight() - itemHeight; break;
                    case 'padding-box': delta = $item.innerHeight() - itemHeight; break;
                }
                $item.css('min-height', rowHeight + delta);
            } else if (mode === 'byinner') {
                $item.data('by').css('min-height', $item.data('by').height() + (rowHeight - itemHeight));
            } else if (type(rowHeight, 'array')) {
                for (j = 0; j < $item.data('by').length; j++) {
                    $item.data('by').eq(j).css('min-height', rowHeight[j]);
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
            liquid: true
        };

        if (args.length) {
            switch (args.length) {
                case 1:
                    switch ( type(args[0]) ) {
                        case 'boolean': 
                            self.opt.liquid = args[0];
                            break;
                        case 'string':
                            self.opt.by = args[0];
                            break;
                        case 'object':
                            self.opt = $.extend(self.opt, args[0]);
                            break;
                    }
                    break;
                case 2:
                    self.opt.by = args[0];
                    self.opt.liquid = args[1];
            }
        }

        self.init();
    };

    Obj.prototype = {
        init : function() {
            var self = this,
                i, $item;
            
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
                };
            }

            if (!self.mode) self.mode = 'byitem';

            

            for (i = self.$items.length - 1; i >= 0; i--) {
                $item = self.$items.eq(i);
                $item.data('min-height', parseInt($item.css('min-height')));
            };

            self.cols = self.getColCount();
            self.ratio = getPixelRatio();
            self.inited = true;
            self.align();
            
            self._onresize = onWindowResize;
            $win.on('resize.' + __pluginName, self._onresize);

            function onWindowResize (e) {
                var newCols, newRatio, doAlign = false;
                if (self.opt.liquid) {
                    if (self.cols !== (newCols = self.getColCount())) {
                        doAlign = true;
                        self.cols = newCols;
                    };
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
                self.$items.css('min-height', '');
            } else if (self.mode === 'byinner' || self.mode === 'byinners') {
                for (i = self.$items.length - 1; i >= 0; i--) {
                    self.$items.eq(i).data('by').css('min-height', '');
                }
            }
            self.$items.removeData('by min-height');
        },
        destroy : function() {
            var self = this;
            self.uninit();
            self.$element.removeData(__pluginName);
        },
        align: function () {
            var self = this, cols = self.getColCount(), counter = 0, rowHeight = 0, innerHeights, $rowItems;
            resetHeight(self.$items, self.mode);
            do {
                $rowItems = self.$items.slice(counter, counter + cols);
                if (self.mode === 'byitem' || self.mode === 'byinner') {
                    rowHeight = getMaxheight($rowItems);
                    alignRow($rowItems, rowHeight, self.mode);
                } else if (self.mode === 'byinners') {
                    innerHeights = getMaxheights($rowItems);
                    alignRow($rowItems, innerHeights);
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
