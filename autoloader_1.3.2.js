/* 
//	autoloader.js
//	authour: Adam Chow -  adamchow2326@yahoo.com.au
//	created date: 28/07/2011
//	version: 1.3.2
//	jQuery plugins:
//		$.fn.autoLoader({options})
//	jQuery function
//		$.$.autoLoader({options})
//	
//	autoloader will test to see if a object defined in 'test' exists in current environment. If not it will do ajax get script to load each scripts defined in 'loadScript'
//	- When all scripts loaded. It will execute the callback defined in 'complete'
//	- 'depends' option means, this 'complete' callback will only run when 'loadScript' scripts loaded as well as all 'depends' loaded.
//	  This 'depends' feature making autoloader cases no longer require to be write in order. 
//	  Autoloader will automatic track each loaded scripts using autoloader and check if a 'depends' case fullfilled and trigger the case 'complete' callback.
*/
/* autoloadCase data structure example:
	{
		'test': $.fn.tablesorter, // object
		'loadScript': "js/jquery.tablesorter.min.js", // string or array of strings
		'depends': ["$.fn.someplugin", "$.fn.someplugin"],
		'complete': function(){
				// do something after all scripts in 'loadScript' finish loaded.
		}
	}
*/
(function($){
	//var log;
	//(typeof console === "object") ? log = console.log : log = function() {};

	var AutoLoder = function(testCases, callbackFn){
		this.options = {
			eAutoScriptLoaded: "eAutoScriptLoaded"
		};
		if (testCases) {
			this.testCases = testCases;
			if(callbackFn){
				this.callbackFn = callbackFn;
			}
			// set autoloader data object on body. use for tracking
			if(!$("body").data("autoloader")){
				$("body").data("autoloader", {});
			}
			this.autoloaderData = $("body").data("autoloader");
			if (!this.autoloaderData.loadedScripts){
				this.autoloaderData.loadedScripts = [];
			}
			return this.init();
		}
	};

	AutoLoder.prototype = {
		testCasesLength: 0,
		casesloaded: 0,
		testCasesArry: [],
		completeCallbackArry: [],
		dependsCases: [],
		
		/*	
		//	dependsCheck()
		//	check if a test case depends scripts in dependsCases array has been loaded.
		//	If all scripts loaded call executeComplete() and remove this test case from  dependsCases
		*/
		dependsCheck: function() {
			var self = this,
				loadedScriptsData = self.autoloaderData.loadedScripts,
				dependsCasesLength = self.dependsCases.length,
				thisTestCase,
				thisDepends,
				dependsArray = [],
				dependsArrayLength,
				d, i;
			if(self.dependsCases.length > 0) {
				for (d=0; d < dependsCasesLength; d +=1) {
						thisTestCase = self.testCasesArry[self.dependsCases[d]];
						thisDepends = thisTestCase.depends;
					thisTestCase.loadedDependsCount = 0;
					//normalist a case's depends statement as array
					if (typeof thisDepends === "string") {
						dependsArray.push(thisDepends);
						thisDepends = dependsArray;
					}else if ($.isArray(thisDepends)) {
						dependsArray = thisDepends;
					}
					//log(loadedScriptsData);
					dependsArrayLength = dependsArray.length;
					for(i=0; i < dependsArrayLength; i+=1) {
						if ($.inArray(dependsArray[i], loadedScriptsData) >= 0) {
							thisTestCase.loadedDependsCount += 1;
						}
					}
					if(thisTestCase.loadedDependsCount === dependsArray.length) {
						//log("Depends scriptloaded: " + self.dependsCases[d], thisTestCase);
						self.executeComplete(thisTestCase);
						self.dependsCases.splice(d,1); // remove this dependsCases from dependsCases array
					}
				}
			}
		},
		/*
		//	executeComplete()
		//	call a test case's 'complete' callback
		//	If overall callback defined. Push this complete callback into completeCallbackArry and call later
		*/
		executeComplete: function(autoloadCase){
			var self = this,
				completeCallback = autoloadCase.complete,
				completeCallbackLength,
				i;
			
			if (completeCallback){
				// if no overall callbackfn execute a case individual callback
				if(!self.callbackFn){
					completeCallback();
				}
				else {
					// push to callback array collection
					self.completeCallbackArry.push(completeCallback);
				}
			}
			//log("testCasesLength: " + self.testCasesLength);
			//log("casesloaded: " + self.casesloaded);
			// execute callback collection if all test case done
			if (self.testCasesLength === self.casesloaded ) {
				if (self.callbackFn) { // true or a callback function
					// execute each callbacks function in  completeCallbackArry
					completeCallbackLength = self.completeCallbackArry.length;
					for (i=0; i < completeCallbackLength; i+=1) {
						self.completeCallbackArry[i]();
					}
					// execute overall callback function 
					if($.isFunction(self.callbackFn)){
						self.callbackFn();
					}
				}
			}	
		},
		/*
		//	autoload(autoloadCaseOptions)
		//	do ajax load to get a test case's scripts
		//	create multiple ajax calls to load scripts in loadScript array
		//	when all scripts in a case loaded, and if the case has no "depends" defined. call executeComplete()
		*/
		autoload: function(autoloadCase){
			var self = this,
				loadScriptSrcLength = 0,
				loadedCount = 0,
				loadScriptArry = [];
			
			if(!autoloadCase.test){ // check if test statment true
				if ($.isArray(autoloadCase.loadScript)){
					loadScriptSrcLength = autoloadCase.loadScript.length;
				}
				else {
					// loasScript is not array. assume just one script to be load. normalist into internal loadScriptSrcLength array.
					loadScriptArry.push(autoloadCase.loadScript.toString());
					autoloadCase.loadScript = loadScriptArry;
					loadScriptSrcLength = loadScriptArry.length;
				}
				// ajax load scripts from a test case. create multiple ajax calls to load scripts in loadScript array
				$.each(autoloadCase.loadScript, function(){
					var scriptSrc = this,
						currentCaseID = self.casesloaded;
					// check if script has been loaded by checking autoloaderData.loadedScripts.
					// autoloaderData.loadedScripts points to $("body").data("autoloader").loadedScripts array
					if ($.inArray(scriptSrc, self.autoloaderData.loadedScripts) >= 0) {
						return true;
					}
					$.ajax({
						type: "GET",
						url: scriptSrc,
						dataType: "script",
						cache: true,
						success: function() {
							loadedCount+=1;
							// calll executeComplete if all scripts in this case loaded
							if (loadedCount === loadScriptSrcLength){
								self.casesloaded+=1; // increment casesloaded flag
								if(!autoloadCase.depends){
									self.executeComplete(autoloadCase);
								}
								self.runCases(); // run next case - when a case script(s) all loaded
							}
							// trigger to log eventTestScriptLoaded data when a script loaded
							// this event callbacl calls dependsCheck()
							$("body").trigger({
								type: self.options.eAutoScriptLoaded,
								loadedScript: scriptSrc
							});
						},
						error: function (jqXHR, textStatus) {
							//log(textStatus + " loading script: " + jqXHR.responseText);
							// move on to next test case
							self.casesloaded+=1; // increment casesloaded flag
							self.runCases();
						}
					});
				});
			}
			else {
				// run complete callback
				if (typeof autoloadCase.complete === "function") {
					autoloadCase.complete();
				}
			}
		},
		/*
		//	runCases()
		//	check if still cases not run yet. If so, run case
		*/
		runCases: function(){
			var self = this;
			if (self.testCasesLength > self.casesloaded){
				self.autoload(self.testCasesArry[self.casesloaded]);
			}
		},
		/*
		//	setScriptloadedEvent()
		//	bind jQuery data into Body with event "eAutoScriptLoaded". For tracking each loaded script.
		//	event callback function push into array loadedScripts
		//	calls dependsCheck to check if any autocases should be run
		*/
		setScriptloadedEvent: function(){
			var self = this;
			if (!$("body").data("events") || !$("body").data("events")[self.options.eAutoScriptLoaded] ){
				$("body").bind(self.options.eAutoScriptLoaded, function(event){
					var loadedScripts = self.autoloaderData.loadedScripts;
					loadedScripts.push((event.loadedScript).toString());
					//call dependsCheck
					self.dependsCheck();
				});
			}
			return this;
		},
		/*
		//	init()
		//	setup script event
		//	store number of test cases into testCasesArry
		//	store number of depends cases into dependsCases
		//	call runCases() to start or call autoload() if only one test case
		*/
		init: function(){
			var self = this,
				testCaseslength,
				i;
			// setup body data to log loaded scripts
			self.setScriptloadedEvent(); 
			// testCases is Array with cases objects
			if ($.isArray(self.testCases)) { 
				self.testCasesArry = self.testCases;
				self.testCasesLength = self.testCases.length;
				//check and log if depends exists on each cases
				for(i=0; i < self.testCasesLength; i+=1) {
					if(self.testCasesArry[i].depends){
						self.dependsCases.push(i);
					}
				}
				self.runCases();
			}
			// testCases is an object - only one test case
			else if ($.isPlainObject(self.testCases)) {
				// only one case
				self.testCasesArry.push(self.testCases);
				self.testCasesLength = 1;
				if(self.testCasesArry[0].depends){
					self.dependsCases.push(0);
				}
				self.autoload(self.testCasesArry[0]);
			}
			// testCases is not correct
			else{
				throw new Error("testCases is not in correct format.");
			}
		}
	};
	
	$.fn.autoLoader = function(testCases, callbackFn) {
		return this.each(function() {
            (new AutoLoder(testCases, callbackFn));
        });
	};
	
	$.autoLoader = function(testCases, callbackFn){
		return new AutoLoder(testCases, callbackFn);
	};
	
})( jQuery );