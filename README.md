# RSSAggro

This is a simple rss aggregator written with Flask, React and Redux.  
Initially the project was part of an assignment in *TIEA2080 Web server development* course.

View example app at [https://tiea2080-vt7.appspot.com/](https://tiea2080-vt7.appspot.com/).

## Project structure

* rss_api --> Python backend
* app --> JavaScript frontend
* app.yaml --> Configuration of routes for Google App Engine
* requirements.txt --> Python requirements

## Some notes on choice of tools

* No webpack! All frontend bundling is done with Parcel (https://parceljs.org/) that requires zero configuration! 
* CSS is made mainly with Tailwind CSS (https://tailwindcss.com/) -- no pre-made frameworks!
* The frontend is made with React for the UI and Redux for app state + AJAX.
    * Technically it's not really AJAX, since I use the newer (and much better) Fetch API.

## Running the code locally

If you want to run the development server locally, you will need:

* Google Cloud SDK (I used the newest one with `gcloud` command, but the older one might work as well)
* Python 2.7 + virtualenv (install via `pip`)
* Node.JS 8.9.3 (might also work with other versions as well)
* NPM 5.6.0 (or newer)

Steps to set up:

#### Python part:

1. Open the console in this directory
2. Run `virtualenv env` to set up Python's virtualenv in `env` folder
3. Run `./env/Scripts/activate.bat` to activate virtual environment
4. Run `pip install -r requirements.txt -t lib` to install needed Python requirements into `lib` folder
5. Run `dev_appserver.py app.yaml` to launch the development server

The server should pop up on ports 8080 and 8000.

#### JavaScript part:

1. Open the console in `app` directory
2. Run `npm install` to install all dependencies
3. Run `npm run watch` to launch the development environment in watch mode

Now you can go to `localhost:8080`. If everything worked fine, you should see the app there.
Editing the application source will update the server and the output.

If you want to build the final minified application, run `npm run build`.