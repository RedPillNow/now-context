# <now-context\>

This element provides a means to manage the context of an application. It also offers storage of all
requests. If a request is made for an item it already has, it will update that item in the context and
trigger a PubSub event.

This element is not meant to be used as or replace a cache. Modern browsers now offer a very good caching system.

## Using this element

Place this element in the shell of your application. This will provide a global variable named `NowContext`. You can use data binding to share the context (though not recommended). Instead use the PubSub system to listen for and trigger events.

*Example*
```html
<dom-module id="custom-app">
	<template>
	<now-context></now-context>
		....
	</template>
	<script>
CustomApp extends Polymer.Element {
	static get is() {return 'custom-app'}
	static get properties() {
		return {
			someData: Object
		};
	}
	connectedCallback() {
		// Give now-context time to be initialized
		setTimeout(() => {
			NowContext.listenEvt('nowContextGetReqDone', this.onGetReqDone, this);
		}, 1000);
	}

	getData() {
		let detailObj = {
			ajax: {
				url: 'https://somehost.com/api/path',
				idKey: 'id'
			}
		};
		NowContext.triggerEvt('nowcontextget', detailObj);
	}

	onGetReqDone(data) {
		// Do something with the data
		this.triggerSomeRandomeEvt();
	}

	triggerSomeRandomEvt() {
		NowContext.triggerEvt('someRandomEvent', this.someData);
	}
}
	</script>
</dom-module>
```

## Events Listened For

There are several PubSub events that now-context listens for in order to perform requests. The current events are:
* `nowcontextget` - Perform a GET request, triggers nowContextGetReqDone PubSub Event
* `nowcontextput` - Perform a PUT request, triggers nowContextPutReqDone PubSub Event
* `nowcontextpost` - Perform a POST request, triggers nowContextPostReqDone PubSub Event
* `nowcontextdelete` - Perform a DELETE request, triggers nowContextDeleteReqDone PubSub Event
* `nowcontextpatch` - Perform a PATCH request, triggers nowContextPatchReqDone PubSub Event

All of the above events should be sent a detail object formatted like:

```js
let detailObj {
	context: {
		element: this, // The element that fired this event (future use)
		model: someData // The model for this element (future use)
	},
	ajax: { // If any special iron-ajax properties should be set, include them here
		idKey: 'id', // The key for the ID. If using the Red Pill Now Graph API, it would be '@id'
		url: 'http://somehost.com/api/path?id=foo', // URL for the request
		payload: {some: obj} // If performing a PUT, POST or PATCH include the payload
	}
}
```

Once the context is updated with a new item, or an existing item is updated a new PubSub event will be triggered:
* Context Item is updated - nowContextItemUpdated
* Context Item is added - nowContextItemAdded

## PubSub System

There are 3 methods to work with the PubSub system:

* `NowContext.listenEvt(eventName, callback, context)` - This is how you subscribe to an event
* `NowContext.triggerEvt(eventName, data)` - This is how you trigger an event
* `NowContext.unListenEvt(eventName, callback)` - This is how you un-subscribe from an event

When an event is triggered, it will run the callback function for all subscribed listeners. While we attempt to prevent duplicate listeners, if a context is not provided to `listenEvt` it is possible to end up with duplicate listeners. While this will not cause a memory leak it will cause your callback to be called twice. Also the running of callbacks does not guarantee a particular order.

## Setup for Development

First, make sure you have [Nodejs](https://nodejs.org/) installed, so we can use the Node package manager (NPM)
Next, install the other key tools:

* [Bower](http://bower.io/) - dependency management
* [Gulp](http://gulpjs.com/) - build
* [TypeScript](http://www.typescriptlang.org/) - TypeScript compiler
* [web-component-tester](https://github.com/Polymer/web-component-tester) - (wct) - testing

You can install them with these commands:

`[sudo] npm install --global gulp bower typescript web-component-tester`

Next, install dependencies that are managed by NPM:

`[sudo] npm install`

Install dependencies that are managed by Bower:

`bower install`

## Running Element in dev environment

To view this element, its tests, and demo, simply point your browser to index.html after executing `gulp serve`

## Building

This project is built using Gulp; the file `gulpfilejs` contains several build tasks
Many IDEs and text editors have Gulp integration, so look for integration in your tool of choice

You can also run Gulp from the command line; here are some common tasks:

`gulp serve` - Builds the component and runs a local web server (usually on port 5000) that will automatically reload changes you make on disk in the browser
After you run this command, just open your browser to `http://localhost:5000/` The page should refresh automatically when you change the source

`gulp` - Default target; builds the component for distribution

`test` - Run the tests

NOTE: Make sure you check in js, map, and dts files generated by the build. These will be used by projects that use your component

You can see the other tasks (such as `clean`) in the `gulpfilejs`

## Customizing

To customize the project, just replace 'now-context' with the name of your element (this includes file names as well as text inside of html and ts files)
You will want to rename the TypeScript class as well

NOTE: Make sure you update bower.json so that the name of the component is correct! Otherwise when someone installs it, it'll be installed as now-context.

## Testing

Be sure to update the test suite in the `test` folder with tests for your component!
with tests for your component!
