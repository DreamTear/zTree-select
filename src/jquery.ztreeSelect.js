/**
 * jquery.ztreeSelect.js 基于ztree的tree selec
 * @authors wangy (wangy@huilan.com)
 * @date    2019-07-20 14:49:59
 * @version $Id$
 */

+function($) {

	function TreeSelect(option) {
		var def = {
			label: 'name',
			value: 'id',
			separator: '/',
			treeOption: {}
		};
		this.$el = $(option.el);
		this.option = $.extend(def, option);
		this.treeNo = 0;
		this.init();
	};
	TreeSelect.prototype.init = function() {
		this.wrapEl();
		this.creatDropdownEl();
		this.initZTree();
		this.initEvent();
		this.initValue();
		this.inited = true;
	};
	TreeSelect.prototype.wrapEl = function() {
		var me = this;
		var $showEl = $('<div class="input-group">'
		  + '<input type="text" class="form-control"/>'
		  + '<span class="input-group-addon"><i class="glyphicon glyphicon-chevron-down"></i></span>'
		+ '</div>');
		// var $warperEl = $('<div class="cascader-wrapper"></div>');
		me.$el.wrap('<div class="zTree-select-wrapper"></div>').hide();
		me.$el.after($showEl);
		me.$showInput = $('input', $showEl);
		me.$triggerEl = $('.input-group-addon', $showEl);

	};
	TreeSelect.prototype.creatDropdownEl = function() {
		
		this.$dropdownEl = $('<div class="zTree-select-dropdown-container"></div>');
		
		var treeId = this.getTreeElId();
		this.treeId = treeId;
		this.$treeEl = $('<ul id="'+ treeId +'" class="ztree"></ul>');
		this.$dropdownEl.append(this.$treeEl);
		$('body').append(this.$dropdownEl);
	};
	TreeSelect.prototype.getTreeElId = function() {
		this.treeNo++;
		return 'zTree-select' + this.treeNo;
	};
	TreeSelect.prototype.initZTree = function() {
		var me = this;
		var option = me.option;
		var setting = option.treeOption;
		var treeData = setting.treeData; // 非ajax方式
		var setting = me.initZTreeSetting();
		var tree = $.fn.zTree.init(me.$treeEl, setting, treeData);
		me.tree = tree;
		if(setting.onTreeInited) {
			setting.onTreeInited.call(this, tree)
		}
	};
	TreeSelect.prototype.initZTreeSetting = function() {
		var me = this;
		var option = me.option;
		var setting = $.extend({}, option.treeOption);
		var callback = setting.callback;
		setting.callback = $.extend({}, callback, {
			onClick: function(event, treeId, treeNode) {
				me.setValue(treeNode);
				me.hideDropdown();
				if(callback && callback.onClick) {
					callback.onClick.call(this, event, treeId, treeNode)
				}
			}
		});
		return setting;
	}
	TreeSelect.prototype.setValue = function(treeNode) {
		var me = this;
		var option = me.option;
		var showProp = option.label;
		var valueProp = option.value;
		var separator = option.separator;
		var path = treeNode && treeNode.getPath && treeNode.getPath() || [];
		var showValue = [];
		var submitValue = treeNode && treeNode[valueProp] || '';
		$.each(path, function(index, item) {
			showValue.push(item[showProp]);
		});
		me.$showInput.val(showValue.join(separator));
		// 不是初始化完成前调用setValue，不触发事件；
		if (!me.inited || me.oldSubmitValue == submitValue) {
			return;
		}

		me.oldSubmitValue = submitValue;
		me.$el.val(submitValue);
		me.$el.trigger('change.ztreeSelect', [submitValue, treeNode]);
	}
	TreeSelect.prototype.showDropdown = function() {
		var position = this.$showInput.offset();
		var elH = this.$showInput.outerHeight(true); // 计算input带边框的高度
		this.$dropdownEl.css({
			left: position.left,
			top: position.top + elH,
			minWidth: this.$showInput.parent().outerWidth(true)
		});
		this.$dropdownEl.show();
	};
	TreeSelect.prototype.hideDropdown = function() {
		this.$dropdownEl.hide();
	};
	TreeSelect.prototype.initEvent = function() {
		var me = this;
		var timer;

		me.$showInput.on('focus', function() {
			me.showDropdown();
		});
		me.$showInput.on('click', function(event) {
			event.stopPropagation();
		});
		me.$triggerEl.on('click', function(event) {
			event.stopPropagation();
			if(me.$dropdownEl.is(':visible')) {
				me.hideDropdown();
			} else {
				me.showDropdown();
			}
		});
		$(document).on('click', function(event) {
			var target = event.target;
			var reg = new RegExp('^' + me.treeId + '_');
			if (reg.test(target.id)) {
				return;
			}
			timer = setTimeout(function() {
				me.hideDropdown();
			}, 2);
		})
	};
	TreeSelect.prototype.initValue = function() {
		var me = this;
		var option = me.option;
		var showProp = option.label;
		var valueProp = option.value;
		var val = me.$el.val().trim();

		me.oldSubmitValue = val;

		var nodes = me.tree.getNodesByParam(valueProp, val, null);
		if(nodes.length > 0) {
			me.setValue(nodes[0]);
			me.tree.selectNode(nodes[0]);
		}
	}
	TreeSelect.prototype.clearValue = function() {
		this.setValue({});
		this.tree.cancelSelectedNode();
	}


$.fn.ztreeSelect = function(opt) {
	var res;
	this.each(function() {
		var $this = $(this);
		var treeSelect = $this.data('ztreeSelect');
		if(treeSelect) {
			res = treeSelect[opt]();
			if(res !== undefined) {
				return false
			}
		} else {
			var option = $.extend({el: this}, opt);
			$this.data('ztreeSelect', new TreeSelect(option));
		}
		
	});
	if(res !== undefined) {
		return res;
	} else {
		return this;
	}
};
}(jQuery);