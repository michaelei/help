// JavaScript Document
var fnParentToPage = function(url){
	if(window.parent == null)
		return;
	if(window.parent.fnIframeToPage == null)
		return;
	window.parent.fnIframeToPage(url);
};