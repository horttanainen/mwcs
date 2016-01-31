# MWCS
Monthly Wage Calculation System

# Heroku
https://mwcs.herokuapp.com/sol.html

# Installation
Run npm install command in the project root directory.

# Tests
Tests require npm install command to be run first in the project root directory.
Tests can be found in: public/tests_mocha/ 
Tests are run by opening the testRunner.html in browser.

# Structure

sol.js gets called first from the sol.html.
sol.js initializes sol.shell.js which acts as container for sol.file.js and sol.list.js.
sol.shell.js initializes sol.file.js and sol.list.js
sol.list.js and sol.file.js are designed as plugins which could be changed at any point with different solutions.

sol.model.js, sol.csv_handler.js and sol.salary_calculator.js act as tools and dont need to be initialized.
