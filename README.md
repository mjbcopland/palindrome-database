# Palindrome Database

### A service which stores palindromes.

A palindrome is a word or phrase string that reads the same backwards as forwards, independent of spaces and punctuation. An example could be *"Dammit I'm Mad"*.

The service has a simple REST interface that presents two endpoints:

* #### POST /palindromes
  An endpoint that accepts a string parameter, that will return true if the string is palindrome (and false otherwise)

* #### GET /palindromes
  An endpoint that returns a list of the last 10 palindromes the system has received in the last 10 minutes


## Install
    git clone https://github.com/mjbcopland/palindrome-database.git
    cd palindrome-database
    npm install

## Test
    npm test

The TIMEOUT test takes 10 minutes to run and is not enabled by default. To run this test, set environment variable `DO_TIMEOUT` to `'true'` before running the test, i.e.

    DO_TIMEOUT=true npm test

## Run
    npm start

By default the service uses port 3000. Use the PORT environment variable to specify a port, e.g.

    PORT=80 npm start

[Postman](https://www.getpostman.com/) is useful for manually testing with a live instance.