/**
 *	sortable-list.js
 *
 *  sortable-list.js depends on jquery and jquery.ui
 **/

'use strict';

(function(window, $) {

  function SortableList(options) {

		return new SortableList.create(options)
    // var sortableList = new SortableList.create(options);
		// sortableList.init();
		// return sortableList;

	}

	/**
	 *	private
	 */


	/**
	 *	public
	 */

	SortableList.prototype = {

		// After document is ready, init() is invoked
		// to create jQuery objects and add event listeners
		init: function(options) {

			// this.items stores the reference of array of objects such as favorites
			this.items = options.items || [];
			// this.tempItems is a temporary storage for this.items
			// this.tempItes is also a shallow copy of this.itmes
			this.tempItems = this.items.slice(0);
			// default animation duration determining how long the animation will return
			// for show, hide, fadeIn, fadeOut, etc
			this.defaultDuration = options.defaultDuration;
			// event listeners
			this.events = options.events || {};
			// customized methods
			this.methods = options.methods || {};

			// Create jQuery objects by using HTML ids and classes obtained from options
			this.$listSection = $('#' + this.listSectionId);
			this.$listHeader = $('#' + this.listHeaderId);
			this.$listUl = $('#' + this.listUlId);

			this.$detailSection = $('#' + this.detailSectionId);
			this.$detailHeader = $('#' + this.detailHeaderId);
			this.$detailArticle = $('#' + this.detailArticleId);
			this.$detailEditArticle = $('#' + this.detailEditArticleId);

			this.showList();
			this.invokeEventListeners();

		},

		// Invoke event listeners in this.events
		invokeEventListeners(events) {

			// If no events is provided, invoke this.events
			events = events || this.events;
			for (var eventName in events) {
				console.log('Event listener, "' + eventName + '" is invoked.');
				this.events[eventName].call(this);
			}

		},

		// Add eventListeners
		addEventListeners: function(newEvents) {

			$.extend(this.events, newEvents);

		},

		// Create HTML elements and append them to this.$listHeader and this.$listUl
		resetListSection: function() {

			var self = this;

			// Remove all existing child nodes of this.$listHeader
			this.$listHeader.empty();
			console.log('empty this.$listHeader with id="' + this.listHeaderId + '"');

			// Create a header and append it to this.$listHeader
			this.$listHeader.append($(this.getListHeaderHtml()));

			// Remove all existing child nodes of $ul
			this.$listUl.empty();
			console.log('empty this.$listUl with id="' + this.listUlId + '"');

			// Create an array of li HTML strings iterating through this.items
			var arrayLiHtmls = this.items.map(function(item, index, items) {
				var opts = {
					item: item,
					itemIndex: index,
					items: items
				};
				return self.getListLiHtml(opts);
			});

			// Create HTML lis and append them into this.$listUl
			this.$listUl.append(arrayLiHtmls.join(''));

		},

		// Create HTML elements and append them to this.$detailArticle
		resetDetailArticle: function(itemIndex) {

			var self = this;

			// Remove all existing child nodes of this.$detailArticle
			this.$detailArticle.empty();

			// Create detail article's HTML content
			// and append it into this.$detailArticle
			var opts = {
				item: this.items[itemIndex],
				itemIndex: itemIndex
			};
			var strDetailHtml = this.getDetailArticleHtml(opts);
			this.$detailArticle.append($(strDetailHtml));

		},

		// Recreate HTML elements for this.$detailEditArticle
		resetDetailEditArticle: function(itemIndex) {

			var self = this;

			// Remove all existing child nodes of this.$detailEditArticle
			this.$detailEditArticle.empty();

			// Create detail edit article's HTML content
			// and append it into this.$detailEditArticle
			var opts = {
				item: this.items[itemIndex],
				itemIndex: itemIndex
			};
			var strDetailEditHtml = this.getDetailEditArticleHtml(opts);
			this.$detailEditArticle.append($(strDetailEditHtml));

		},

		// Update this.items same as this.tempItems
		updateItems: function(callback) {

			// var items = this.items;
			// var tempItems = this.tempItems;
			// var tempItemsLength = tempItems.length;
			//
			// // Copy the array elements from tempItems to items
			// for (var i = 0; i < tempItemsLength; i++) {
			// 	items[i] = tempItems[i];
			// }
			// // Removed the elements of items which have been removed from tempItems
			// items.splice(tempItemsLength);
			//
			// if (callback) {
			// 	var itemsLength = items.length;
			// 	for (var i = 0; i < itemsLength; i++) {
			// 		callback.call(this, items[i], i, items);
			// 	}
			// }


			// Make this.items a shallow copy of this.tempItems
			this.items = this.tempItems.slice(0);


		},

		// Update this.tempItems according to the changes on this.$listUl
		updateTempItems: function(callback) {

			var items = this.items;
			var tempItems = this.tempItems;
			var arrayLis = $.makeArray(this.$listUl.find('.' + this.listLiClass));
			var lisLength = arrayLis.length;
			var listDataId = this.listDataId;

			for (var i = 0; i < lisLength; i++) {
				// itemIndex stores the listDataId data attribute of each li
				var itemIndex = $(arrayLis[i]).data(listDataId);
				// Copy the reference of each rearranged item
				tempItems[i] = items[itemIndex];
			}
			// Removed the elements of items which have been removed from this.$listUl
			tempItems.splice(lisLength);

			if (callback) {
				var tempItemsLength = tempItems.length;
				for (var i = 0; i < tempItemsLength; i++) {
					callback.call(this, tempItems[i], i, tempItems);
				}
			}

		},

		// Update this.items same as this.tempItems and save this.items into database
		saveListEdit: function(callback) {

			this.updateItems();

			//
			// TODO: Save the updated this.items to database
			//
			if (callback) {
				callback.call(this, this.items);
			}

		},

		// Update one element of this.items accroding to the changes from the form inputs
		// and save this.items into database
		saveDetailEdit: function(itemIndex, callback) {

			var item = this.items[itemIndex];

			// Turn an array-like jQuery object into an array
			var arrayInputs = $.makeArray(this.$detailEditArticle.find('input'));
			var inputsLength = arrayInputs.length;

			// Update the properties of the selected item
			// with input values of the form in #detailEditArticle
			for (var i = 0; i < inputsLength; i++) {
				var $input = $(arrayInputs[i]);
				var prop = $input.attr('name');
				item[prop] = $input.val();
			}

			// Turn an array-like jQuery object into an array
			var arrayTextareas = $.makeArray(this.$detailEditArticle.find('textarea'));
			var textareasLength = arrayTextareas.length;

			// Update the properties of the selected item
			// with textarea values of the form in #detailEditArticle
			for (var i = 0; i < textareasLength; i++) {
				var $textarea = $(arrayTextareas[i]);
				var prop = $textarea.attr('name');
				item[prop] = $textarea.val();
			}

			//
			// TODO: Save the updated item to database
			//
			if (callback) {
				callback.call(this, this.items);
			}

		},

		// Make this.$ul sortable
		// callback is invoked whenever there is any changes on the order of this.$ul
		_enableListSortable: function(callback) {

			var self = this;

			this.$listUl.sortable({
				disabled: false,
				update: function() {
					// Update this.tempItems according to the changes on this.$listUl
					self.updateTempItems();
					if (callback) {
						callback.call(self)
					}
				}
			});
			// Disable selection of text content in this.$ul
			this.$listUl.disableSelection();
			console.log('SortableList is enabled');

		},

		// Make this.$ul unsortable
		_disableListSortable: function() {

			this.$listUl.sortable({
				disabled: true,
			});

			// Enable selection of text content in this$.ul
			this.$listUl.enableSelection();
			console.log('SortableList is disabled');

		},

		_hideList: function(duration) {

			duration = duration || this.defaultDuration;
			this.$listSection.hide(duration);
			console.log('_hideList() is called');

		},

		_hideDetail: function(duration) {

			duration = duration || this.defaultDuration;
			this.$detailArticle.hide(duration);
			console.log('_hideDetail() is called');

		},

		_hideDetailEdit: function(duration) {

			duration = duration || this.defaultDuration;
			this.$detailEditArticle.hide(duration);
			console.log('_hideDetailEdit() is called');

		},

		// Reset HTML list contents and display the list section
		showList: function(opts) {

			opts = opts || {};
			var duration = opts.duration || this.defaultDuration;
			this._hideDetail();
			this._hideDetailEdit();
			this.resetListSection();
			this.$listSection.show(duration);

		},

		// Reset HTML detail contents and display the detail article
		showDetail: function(opts) {

			var itemIndex = opts.itemIndex;
			var duration = opts.duration || this.defaultDuration;

			this._hideList();
			this._hideDetailEdit();

			// Set data(this.listDataId) on this.$detailSection
			this.$detailSection.data(this.listDataId, itemIndex)
			console.log('this.$detailSection.data-' + this.listDataId + '= ' + this.$detailSection.data(this.listDataId));

			this.resetDetailArticle(itemIndex);

			// Show this.$detailSection and this.$detailArticle
			this.$detailSection.show(duration);
			this.$detailArticle.show(duration);
		},

		// Display the edit form for the previously selected favorite detail
		showDetailEdit: function(opts) {

			var itemIndex = opts.itemIndex || this.$detailSection.data(this.listDataId);
			var duration = opts.duration || this.defaultDuration;

			this._hideList();
			this._hideDetail();

			this.resetDetailEditArticle(itemIndex);

			// Show this.$detailSection and this.$detailEditArticle
			this.$detailSection.show(duration);
			this.$detailEditArticle.show(duration);
		},

		// // Find arrayMatchedLis which return true from callback and then
		// // invoke action with the passing parameter arrayMatchedLis[i]
		// findLis: function(callback, action) {
		//
		// 	var self = this;
		//
		// 	// Turn an array-like jQuery object into an array
		// 	var arrayLis = $.makeArray(this.$listUl.find('.' + this.listLiClass));
		// 	var lisLength = arrayLis.length;
		// 	var arrayMatchedLis = [];
		// 	var isMatched;
		//
		// 	for (var i = 0; i < lisLength; i++) {
		// 		isMatched = callback(arrayLis[i], i, arrayLis);
		// 		if (isMatched) {
		// 			// When callback return true, push arrayLis[i] to arrayMatchedLis
		// 			arrayMatchedLis.push(arrayLis[i]);
		// 		}
		// 	}
		//
		// 	// When action function is given
		// 	if (action) {
		// 		var matchedLisLength = arrayMatchedLis.length;
		// 		for (var i = 0; i < matchedLisLength; i++) {
		// 			action.call(self, arrayMatchedLis[i], i, arrayMatchedLis);
		// 		}
		// 	}
		//
		// },
		//
		// // Find matchedLis which returns true from callback and then
		// // remove the li and the corresponding item from this.items
		// removeLis: function(callback) {
		//
		// 	var self = this;
		//
		// 	this.findLis(callback, function(matchedLi) {
		// 		var $matchedLi = $(matchedLi);
		// 		// Get itemId from the data-id attribute of li
		// 		var itemId = $matchedLi.data(self.listDataId);
		//
		// 		// Remove the corresponding item from the this.items
		// 		self.items.splice(itemId, 1);
		// 		// Remove the matchedLi
		// 		$matchedLi.remove();
		//
		// 	});
		//
		// },
		//
		//
		// findLiById: function(itemIndex, action) {
		//
		// 	var self = this;
		//
		// 	this.findLis(function(li) {
		// 		// typeof id is number
		// 		var id = $(li).data(self.listDataId);
		// 		return id === itemIndex;
		// 	}, function(matchedLi) {
		// 		action.call(self, matchedLi);
		// 	});
		//
		// },
		//
		// removeLiById: function(itemIndex) {
		// 	var self = this;
		//
		// 	this.findLiById(itemIndex, function(matchedLi) {
		// 		// Remove the selected li
		// 		$(matchedLi).remove();
		// 		// Remove the corresponding item from this.items
		// 		self.items.splice(itemIndex, 1);
		// 	});
		// }

	};

	SortableList.create = function(options) {

		// list section
		this.listSectionId = options.listSectionId;
		this.listHeaderId = options.listHeaderId;
		this.listUlId = options.listUlId;
		this.listLiClass = options.listLiClass;

		this.getListHeaderHtml = options.getListHeaderHtml;
		this.getListLiHtml = options.getListLiHtml;

		// detail section
		this.detailSectionId = options.detailSectionId;
		this.detailHeaderId = options.detailHeaderId;
		this.detailArticleId = options.detailArticleId;
		this.detailEditArticleId = options.detailEditArticleId;

		this.getDetailArticleHtml = options.getDetailArticleHtml;
		this.getDetailEditArticleHtml = options.getDetailEditArticleHtml;

		// data attribute of each li
		this.listDataId = options.listDataId;

	};

	SortableList.create.prototype = SortableList.prototype;


	// factory function for SortableList
	// SortableList.create = function(options) {
	// 	var sortableList = new SortableList(options);
	// 	sortableList.init();
	// 	return sortableList;
	// }

	window.SortableList = SortableList;

}(window, $));
