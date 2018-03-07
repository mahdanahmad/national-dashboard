## Overview

This project is a redesign of [PLJ's National Dashboard](http://plj.bappenas.go.id/PLJ/social-dashboard/) aimed for KPK. Given of reports from KPK and Ombudsman, we separate those repots into several categories and visualize them for easier reading.

## Installation

This project use [NodeJS](https://nodejs.org/en/download/package-manager/) + Express + MySQL for BackEnd and D3.js for FrontEnd. All BackEnd dependencies already listed at package.json, what you have to is install it with this command: `npm install`. On the other hand, all FrontEnd dependencies use [cdnjs platform](https://cdnjs.com) so you don't have to worry about installing anything. Simple, eh? And for CSS pre-process we use [SASS](https://sass-lang.com/install), don't forget to install that one too.

note: if you have ocd about version, while developing this, we use NodeJS v8.9.2 and MySQL v5.7.20

## Config

Don't forget to create `.env` file and add these required parameters
```
DB_HOST (default: localhost, or your MySQL database url)
DB_PORT (default: 3306, port of your MySQL database)
DB_DATABASE (your prefered database name)
DB_USERNAME (your MySQL credential)
DB_PASSWORD (your MySQL credential)

PORT (optional, port for running the application, if not filled the application will run at 3010)
```

There are several script in `./scripts/` folder for initialize this project, please run these scripts in order (from project's root so you can use the `.env` file)
1. `migrate.js`, will create all related tables.
2. `init.js`, will initialize static tables like provinces or cities.
3. `initkpk.js`, will gave value for KPK related tables like categories or kpk_data.
4. `cachekpk.js`, will create cache kpk data for better performance.

To run this application, we already create shortcut: `npm start` for running nodemon (it's already included in package.json) to your prefered port. If you need daemonized the application you can use whatever Process Manager you like but we prefer [pm2](https://github.com/Unitech/pm2) and already create shortcut under `npm run serve`. And to run sass, you can use our `npm run sass` shortcut.

## Source code

BackEnd code mainly focused on `./app`, it's already separated into controllers, models, routes, and helpers. And we think the folder name explained itself.

FrontEnd code separated into
* `views` folder for HTML files.
* `stylesheets` folder for SCSS and processed CSS files.
* `js` folder for JS files which already foldered into their function respectively.
