(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		window.idleCallbackShim = factory();
	}
}(function(){
	'use strict';
	var scheduleStart, throttleDelay;
	var root = typeof window != 'undefined' ?
		window :
		typeof global != undefined ?
			global :
			this || {};
	var requestAnimationFrame = root.requestAnimationFrame || setTimeout;
	var tasks = [];
	var runAttemptes = 0;
	var isRunning = false;
	var remainingTime = 6;
	var throttle = 66;
	var index = 0;
	var taskStart = 0;
	var tasklength = 0;
	var IdleDeadline = {
		get didTimeout(){
			return false;
		},
		timeRemaining: function(){
			var timeRemaining = remainingTime - (Date.now() - taskStart);
			return timeRemaining < 0 ? 0 : timeRemaining;
		},
	};

	function scheduleAfterRaf() {
		setTimeout(runTasks, 0);
	}

	function scheduleRaf(){
		requestAnimationFrame(scheduleAfterRaf);
	}

	function scheduleLazy(){

		if(isRunning){return;}
		throttleDelay = throttle - (Date.now() - taskStart);

		scheduleStart = Date.now();

		isRunning = true;

		if(throttleDelay > 0){
			setTimeout(scheduleRaf, throttleDelay);
		} else {
			throttleDelay = 0;
			scheduleRaf();
		}
	}

	function runTasks(){
		var task, i, len;
		taskStart = Date.now();
		isRunning = false;

		if(runAttemptes > 9 || taskStart - throttleDelay - 51 < scheduleStart){
			for(i = 0, len = tasks.length; i < len && IdleDeadline.timeRemaining(); i++){
				task = tasks.shift();
				tasklength++;
				if(task){
					task(IdleDeadline);
				}
			}
		}

		if(tasks.length){
			scheduleLazy();
		} else {
			runAttemptes = 0;
		}
	}

	function requestIdleCallback(task){
		index++;
		tasks.push(task);
		scheduleLazy();
		return index;
	}

	function cancelIdleCallback(id){
		var index = id - 1 - tasklength;
		if(tasks[index]){
			tasks[index] = null;
		}
	}

	if(!root.requestIdleCallback || !root.cancelIdleCallback){
		root.requestIdleCallback = requestIdleCallback;
		root.cancelIdleCallback = cancelIdleCallback;
	}

	return {
		request: requestIdleCallback,
		cancel: cancelIdleCallback,
		cfg: function(name, value){
			if(typeof value != number || value < 1){return;}
			if(name == 'throttle'){
				throttle = value;
			} else if(name == 'remainingTime'){
				remainingTime = value;
			}
		},
	};
}));
