/**
 *	sortable-list.js 
 *
 *  sortable-list.js depends on jquery and jquery.ui
 **/

(function(window, $) {
	var SortableList = (function() {
		function SortableList(options) {

			// this.items stores the reference of array of objects such as favorites
			this.items = options.items || [];

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

			// default transition speed
			this.defaultSpeed = options.defaultSpeed;

			// event listeners
			this.events = options.events;

			// customized methods
			this.methods = options.methods;		

		}

		SortableList.prototype = {

			// After document is ready, init() is invoked 
			// to create jQuery objects and add event listeners
			init: function() {
				
				// Create jQuery objects by using HTML ids in options
				this.$listSection = $('#' + this.listSectionId);
				this.$listHeader = $('#' + this.listHeaderId);
				this.$listUl = $('#' + this.listUlId);

				this.$detailSection = $('#' + this.detailSectionId);
				this.$detailHeader = $('#' + this.detailHeaderId);
				this.$detailArticle = $('#' + this.detailArticleId);
				this.$detailEditArticle = $('#' + this.detailEditArticleId);

				// this.resetListSection() generates $lis by using the given options.items
				this.resetListSection();
				this._addEventListeners();	

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
				console.log('empty this.$listUl with id="' + this.ulId + '"');

				// Create an array of HTML li strings iterating through this.items
				var arrayHtmlLis = this.items.map(function(item, index, items) {
	
					var opts = {
						item: item,
						itemIndex: index,
						items: items
					};
					return self.getListLiHtml(opts);
				});

				// Create HTML lis and append them into this.$listUl
				this.$listUl.append(arrayHtmlLis.join(''));

			},

			// Create HTML elements and append them to this.$detailArticle 
			resetDetailArticle: function(itemIndex, speed) {
				
				var self = this;
				speed = speed || this.defaultSpeed;

				// Remove all existing child nodes of this.$detailArticle
				this.$detailArticle.empty();

				var opts = {
					item: this.items[itemIndex],
					itemIndex: itemIndex
				};

				var strDetailHtml = this.getDetailArticleHtml(opts);

				this.$detailArticle.append($(strDetailHtml));
				
				// Show this.$detailSection and this.$detailArticle
				this.$detailSection.show(speed);
				this.$detailArticle.show(speed);

			},

			// Recreate HTML elements for this.$detailEditArticle
			resetDetailEditArticle: function(itemIndex, speed) {

				var self = this;
				speed = speed || this.defaultSpeed;

				// Remove all existing child nodes of this.$detailEditArticle
				this.$detailEditArticle.empty();

				var opts = {
					item: this.items[itemIndex],
					itemIndex: itemIndex
				};

				var strDetailEditHtml = this.getDetailEditArticleHtml(opts);

				this.$detailEditArticle.append($(strDetailEditHtml));

				// Show this.$detailSection and this.$detailEditArticle
				this.$detailSection.show(speed);
				this.$detailEditArticle.show(speed);

			},

			// Find arrayMatchedLis which returns true from callback and then
			// invoke action with the passing parameter arrayMatchedLis[i]
			findLis: function(callback, action) {

				var self = this;

				// Turn an array-like jQuery object into an array
				var arrayLis = $.makeArray(this.$listUl.find('.' + this.listLiClass));

				var length = arrayLis.length;
				var arrayMatchedLis = [];
				var isMatched;

				for (var i = 0; i < length; i++) {
					isMatched = callback(arrayLis[i], i, arrayLis);
					if (isMatched) {
						// When callback return true, push arrayLis[i] to arrayMatchedLis
						arrayMatchedLis.push(arrayLis[i]);
					}	
				}
				// When action function is given 
				if (action) {
					var length = arrayMatchedLis.length;
					for (var i = 0; i < length; i++) {
						action.call(self, arrayMatchedLis[i], i, arrayMatchedLis);
					}
				}

			},
			
			// Find matchedLis which returns true from callback and then
			// remove the li and the corresponding item from this.items 
			removeLis: function(callback) {
				
				var self = this;

				this.findLis(callback, function(matchedLi) {
					var $matchedLi = $(matchedLi);
					// Get itemId from the data-id attribute of li
					var itemId = $matchedLi.data(self.listDataId);
					// Remove the corresponding item from the this.items
					self.items.splice(itemId, 1);
					// Remove the matchedLi
					$matchedLi.remove();
				})
			
			},
	

			findLiById: function(itemIndex, action) {
			
				var self = this;

				this.findLis(function(li) {
					// typeof id is number
					var id = $(li).data(self.listDataId);
					return id === itemIndex;
				}, function(matchedLi) {
					action.call(self, matchedLi);					
				});
			
			},

			removeLiById: function(itemIndex) {
				var self = this;
			
				this.findLiById(itemIndex, function(matchedLi) {
					// Remove the selected li 
					$(matchedLi).remove();
					// Remove the corresponding item from this.items
					self.items.splice(itemIndex, 1);
				});
			},

			// Iterate this.$listUl and update and save this.items
			saveListEdit: function() {

				var self = this;

				// Turn an array-like jQuery object into an array
				var lis = $.makeArray(this.$listUl.find('.' + this.listLiClass));
				// newItems will store the references of the rearranged items
				var newItems = [];
				var items = this.items;
				var length = lis.length;

				for (var i = 0; i < length; i++) {
					// itemIndex stores the this.listDataId data attribute of each rearranged li
					var itemIndex = $(lis[i]).data(this.listDataId);
					// Push the reference of each rearranged item
					newItems.push(items[i]);
				}
				// Make this.items same as newItems
				for (var i = 0; i < length; i++) {
					items[i] = newItems[i];
				}
				// Splice the removed items from this.items
				items.splice(length);

				// 
				// TODO: Save the updated this.items to database
				// 

			},

			saveDetailEdit: function(itemIndex) {

				var item = this.items[itemIndex];

				// Turn an array-like jQuery object into an array
				var arrayInputs = $.makeArray(this.$detailEditArticle.find('input'));
				var length = arrayInputs.length;

				// Update the properties of the selected item 
				// with input values of the form in #detailEditArticle
				for (var i = 0; i < length; i++) {
					var $input = $(arrayInputs[i]);
					var prop = $input.attr('name');
					item[prop] = $input.val();
				}

				var arrayTextareas = $.makeArray(this.$detailEditArticle.find('textarea'));
				length = arrayTextareas.length;

				// Update the properties of the selected item 
				// with textarea values of the form in #detailEditArticle
				for (var i = 0; i < length; i++) {
					var $textarea = $(arrayTextareas[i]);
					var prop = $textarea.attr('name');
					item[prop] = $textarea.val();
				}

				// 
				// TODO: Save the updated item to database
				// 
			},

			// Make this.$ul sortable
			// callback is invoked whenever there is any changes on the order of this.$ul 
			_enableListSortable: function(callback) {

				var self = this;
				
				this.$listUl.sortable({
					disabled: false,
					// update: function(callback) {
					// }
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

			// Add eventListeners
			_addEventListeners: function() {

				var events = this.events;
				for (var eventName in events) {

					console.log(eventName + 'is added');				
					
					this.events[eventName].call(this);
				}

				console.log('eventListeners are added');
			
			},

			_hideList: function() {

				this.$listSection.hide();
				console.log('_hideList() is called');
			
			},

			_hideDetail: function() {
			
				this.$detailArticle.hide();
				console.log('_hideDetail() is called');
			
			},
			
			_hideDetailEdit: function() {
			
				this.$detailEditArticle.hide();
				console.log('_hideDetailEdit() is called');
			
			},

			showList: function() {
			
				this._hideDetail();
				this._hideDetailEdit();
				this.resetListSection();
				this.$listSection.show();
			
			},

			// Display the detail of the selected item 
			showDetail: function(itemIndex) {

				this._hideList();
				this._hideDetailEdit();
				// Set data(this.listDataId) on this.$detailSection
				this.$detailSection.data(this.listDataId, itemIndex);

				console.log('this.$detailSection.data-' + this.listDataId + '= ' + this.$detailSection.data(this.listDataId));
				
				this.resetDetailArticle(itemIndex);

			},

			// Display the edit form for the previously chosen favorite detail
			showDetailEdit: function(itemIndex) {

				var self = this;
				
				this._hideList();
				this._hideDetail();	
				// this.$detailEditArticle.empty();

				// var opts = {
				// 	item: this.items[itemIndex],
				// 	itemIndex: itemIndex
				// };
				// this.$detailEditArticle.append($(this.getDetailEditArticleHtml(opts)));
				this.resetDetailEditArticle(itemIndex);
				this.$detailEditArticle.show();
			}

		};
		return SortableList;
	}());

	// factory function for SortableList
	SortableList.create = function(options) {
		var sortableList = new SortableList(options);
		sortableList.init();
		return sortableList;
	}

	window.SortableList = SortableList;
}(window, $));
