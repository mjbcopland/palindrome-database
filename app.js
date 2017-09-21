'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const textParser = bodyParser.text()

// Because we don't need to persist the palindromes,
// we simply use an array instead of bothering with
// an actual database
const palindromes = []

// We define constants as properties of ${app} so that
// they are exported with it, but are immutable

// Max number of palindromes to store
Object.defineProperty(app, 'capacity', {
  value: 10
})

// Max milliseconds to store palindromes for (10 minutes)
Object.defineProperty(app, 'timeout', {
  value: 10 * 60 * 1000
})

// We override push() to also remove
// an element if we're at capacity
palindromes.push = function () {
  if (this.length >= app.capacity) {
    // Need to prevent popping twice
    clearTimeout(this.shift().pid)
  }
  return Array.prototype.push.apply(this, arguments)
}

function isPalindrome(str) {
  // Our palindromes are whitespace, capitalisation,
  // and punctuaction agnostic
  str = str.toLowerCase().replace(/\W/g, '')

  // Reasonably intuitive
  return str == str.split('').reverse().join('')
}

app.post('/palindromes', textParser, function (req, res) {
  if (req.is('text/plain')) {
    if (isPalindrome(req.body)) {
      palindromes.push({
        q: req.body,
        pid: setTimeout(() => palindromes.shift(), app.timeout)
      })
      res.json(true)
    } else {
      res.json(false)
    }
  } else {
    res.sendStatus(400)
  }
})

app.get('/palindromes', function (req, res) {
  res.json(palindromes.map(data => data.q))
})

module.exports = app