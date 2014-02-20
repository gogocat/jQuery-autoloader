autoloader.js
=============

This is a javaScript loader plugin for jQuery.
It works very similar to yepnopejs.

The plugin do a test if an object exists in the test case. If not exists, it work will load the script. If supplied a "complete" callback, it work execute it after script(s) in the test case loaded.

The plugin works for multiple cases and multiple scripts to be load in each case.

The plugin also offer a overall callback or option (true/false) to execute all 'complete' statements and the overall callback when everything loaded.

If bind to document.ready() will run after DOM is ready, which gives similar effect as putting scripts to the footer of the web page to speed up page content loading time.



Usage
-----

Test if jQuery UI exists. If not, load it.

auotloader can be call using jquery plugin syntax:

```javascript
$(document).autoloader({options})
```
or as jQuery method

```javascript
$.autoLoader({options})
```
Example:

```javascript
$(function() {
   $.autoLoader(
	{
	  test: $.ui,
	  loadScript: "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js",
	  complete: function(){
	     console.log($.ui);
	  }
	}
   );
});
```

Test cases with "depends". Note that cases no longer require to be in order.
See case 2 will run after case 3, because case 2 depends on script from case 3.

```javascript
	$.autoLoader([
	{
		test: window.first,
		loadScript: "js/first.js",
		complete: function(){
			$("body").append("[case 1]<br />" + first.message + "<br /><br />");
		}
	},
	{
		test: window.second,
		loadScript: "js/second.js",
		depends: ["js/first.js", "js/second.js", "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js"],
		complete: function(){
			$("body").append("[case 2 with loaded property form case 1 and depends of 3 scripts] " + first.message + " " + second.message + "<br /><br />");
		}
	},
	{
		test: $.ui,
		loadScript: "https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js",
		complete: function(){
			$("body").append("[case 3] jQuery UI loaded. and depends first.js second.js<br /><br />");
		}
	}
	]);
```