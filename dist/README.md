# <now-basic-app-layout\>

Simple layout element with common CSS to be used for simpler Red Pill Now applications.

## Setup

First, make sure you have [Node.js](https://nodejs.org/) installed, so we can use the Node package manager (NPM).
Next, install the other key tools: 

* [Bower](http://bower.io/) - dependency management 
* [Gulp](http://gulpjs.com/) - build
* [TypeScript](http://www.typescriptlang.org/) - TypeScript compiler
* [Typings](https://github.com/typings/typings) - type definition manager for TypeScript
* [web-component-tester](https://github.com/Polymer/web-component-tester) - (wct) - testing

You can install them with these commands:

`[sudo] npm install --global gulp bower typescript typings web-component-tester`

Next, install dependencies that are managed by NPM:

`[sudo] npm install`

Install dependencies that are managed by Bower:

`bower install`

Install the TypeScript type definitions:

`typings install`

## Running

To view this element, its tests, and demo, simply point your browser to index.html.

## Building 

This project is built using Gulp; the file `gulpfile.js` contains several build tasks. 
Many IDEs and text editors have Gulp integration, so look for integration in your tool of choice.

You can also run Gulp from the command line; here are some common tasks:

`gulp serve` - Builds the component and runs a local web server (usually on port 5000) that will automatically reload changes you make on disk in the browser.
After you run this command, just open your browser to `http://localhost:5000/`. The page should refresh automatically when you change the source.

`gulp` - Default target; builds the component (minifying it, etc.) and places it in the `dist` folder.

`default` Runs the default target and then runs the server on port 5001. This is the production build with "vulcanized" files. 

You can see the other tasks (such as `clean`) in the `gulpfile.js`.
