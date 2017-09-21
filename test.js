'use strict'

const request = require('supertest')
const decache = require('decache')
const async = require('async')

var app = require('./app')

const palindromes = [
  "",
  "!\"£$%^&*() ",
  "ée",
  "ГГ",
  "123454321",
  "Dammit I'm mad",
  "Stressed desserts",
  "Race car",
  "Don't nod.",
  "I did, did I?",
  "My gym",
  "Red rum, sir, is murder",
  "Step on no pets",
  "Top spot",
  "Was it a cat I saw?",
  "Eva, can I see bees in a cave?",
  "No lemon, no melon",
  "Able was I ere I saw Elba",
  "A man, a plan, a canal - Panama!",
  "Madam, I'm Adam",
  "Never odd or even",
]

const nonPalindromes = [
  "123",
  "I need love, love",
  "ooh, ease my mind",
  "And I need to find time",
  "Someone to call mine;",
  "My mama said",
  "You can't hurry love",
  "No, you'll just have to wait",
  "She said love don't come easy",
  "But it's a game of give and take",
  "You can't hurry love",
  "No, you'll just have to wait",
  "Just trust in a good time",
  "No matter how long it takes",
]

const okTypes = [
  'text/plain',
]

const badTypes = [
  'text/html',
  'multipart/form-data',
  'application/octet-stream',
  'application/json',
  'application/x-form-urlencoded',
]

describe('Palindrome Database', function () {

  // To prevent tests from interfering we
  // re-cache the app before each test
  beforeEach(function () {
    decache('./app')
    app = require('./app')
  })

  describe('POST', function () {

    okTypes.forEach(function (item) {
      it(`Returns 200 'OK' for request type '${item}'`, function (done) {
        request(app)
          .post('/palindromes')
          .type(item)
          .expect(200, done)
      })

      it(`Returns JSON content for request type '${item}'`, function (done) {
        request(app)
          .post('/palindromes')
          .type(item)
          .expect('content-type', /json/, done)
      })
    })

    badTypes.forEach(function (item) {
      it(`Returns 400 'Bad Request' for request type '${item}'`, function (done) {
        request(app)
          .post('/palindromes')
          .type(item)
          .expect(400, done)
      })
    })

    palindromes.forEach(function (item) {
      it(`Validates '${item}'`, function (done) {
        request(app)
          .post('/palindromes')
          .type('text/plain')
          .send(item)
          .expect(JSON.stringify(true), done)
      })
    })

    nonPalindromes.forEach(function (item) {
      it(`Invalidates '${item}'`, function (done) {
        request(app)
          .post('/palindromes')
          .type('text/plain')
          .send(item)
          .expect(JSON.stringify(false), done)
      })
    })
  })

  describe('GET', function () {

    it(`Returns 200 'OK'`, function (done) {
      request(app)
        .get('/palindromes')
        .expect(200, done)
    })

    it('Returns JSON content', function (done) {
      request(app)
        .get('/palindromes')
        .expect('content-type', /json/, done)
    })

    // inits returns an array of prefixes of the input
    // e.g. [1,2,3] -> [[], [1], [1,2], [1,2,3]]
    function inits(array) {
      return Array([]).concat(array.map((e, i, a) => a.slice(0, i + 1)))
    }

    // We use inits to POST an increasing number of palindromes
    // and check that we only GET at most ${app.capacity}
    inits(palindromes).forEach(function (init) {
      // We expect to only recieve the last ${app.capacity} elements
      var target = init.slice(-app.capacity)

      it(`Returns ${target.length}/${init.length} recent palindromes`, function (done) {
        async.series([
            // Sequentially POST palindromes
            function (done) {
              async.eachSeries(
                init,
                function (item, done) {
                  request(app)
                    .post('/palindromes')
                    .type('text/plain')
                    .send(item)
                    .end(done)
                },
                done
              )
            },
            // Check GET returns the target
            function (done) {
              request(app)
                .get('/palindromes')
                .expect(target, done)
            }
          ],
          done
        )
      })
    })

    inits(nonPalindromes).forEach(function (init) {
      it(`Returns 0/${init.length} non-palindromes`, function (done) {
        async.series([
            // POST non-palindromes
            function (done) {
              async.each(
                init,
                function (item, done) {
                  request(app)
                    .post('/palindromes')
                    .type('text/plain')
                    .send(item)
                    .end(done)
                },
                done
              )
            },
            // Check GET returns empty
            function (done) {
              request(app)
                .get('/palindromes')
                .expect([], done)
            }
          ],
          done
        )
      })
    })
  })

  describe('TIMEOUT', function () {

    before(function () {
      // Skip unless told otherwise
      if (process.env.DO_TIMEOUT !== 'true') {
        this.skip()
      }
    })

    it('Palindromes removed after 10 minutes', function (done) {
      this.timeout(this.timeout() && (this.timeout() + app.timeout))
      async.series([
          // Insert palindrome
          function (done) {
            request(app)
              .post('/palindromes')
              .type('text/plain')
              .send('')
              .end(done)
          },
          // Check it's there
          function (done) {
            request(app)
              .get('/palindromes')
              .expect([''], done)
          },
          // Check it's removed after the timeout
          function (done) {
            setTimeout(function () {
              request(app)
                .get('/palindromes')
                .expect([], done)
            }, app.timeout)
          }
        ],
        done
      )
    })
  })
})