var searchLocation = process.env.searchLocation;//"2000 PROSPECT AVE E CLEVELAND OH 44115";
var vaccineLocation = process.env.vaccineLocation;//"Wolstein Center"
var snsArn = process.env.snsArn;

var beep = require('beepbeep');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

describe('Vaccine Checker', function() {

  before(browser => browser.url('https://gettheshot.coronavirus.ohio.gov/'));

  test('Check Vaccine Avaliability', function (browser) {
    browser
      .waitForElementVisible('body')
      .assert.titleContains('Vaccine')
      .assert.visible('button[data-testid=landing-page-continue]')
      .click('button[data-testid=landing-page-continue]')
      .assert.visible('div[aria-labelledby="q-screening-booking-on-behalf"] input[value=No]')
      .click('div[aria-labelledby="q-screening-booking-on-behalf"] input[value=No]')
      .assert.visible('div[aria-labelledby="q-screening-booking-on-behalf"] input[value=Yes]')
      .click('div[aria-labelledby="q-screening-eligibility-question-1"] input[value=Yes]')
      .assert.visible('input[name=q-screening-initialconsent]')
      .click('input[name=q-screening-initialconsent]')
      .assert.visible('input[name=q-screening-acknowledge-vaccine]')
      .click('input[name=q-screening-acknowledge-vaccine]')
      .assert.visible('button[type=submit]')
      .click('button[type=submit]')
      .assert.visible('input[id=location-search-input]')
      .setValue('input[id=location-search-input]', searchLocation)
      .assert.visible('button[data-testid=location-search-page-continue]')
      .click('button[data-testid=location-search-page-continue]')
      .assert.visible('div[data-testid=location-select-location]')
      .elements('xpath', '//div[contains(@class, "tw-border tw-border-n200 tw-rounded tw-box-border tw-shadow-md")][div/button[contains(@data-testid, "location-select-location-continue")]]', async function(locations) {
        locationsToCheck = [];
        for (var i = 0; i < locations.value.length; i++) {
          var element = locations.value[i];
          await new Promise((resolve) => {
            browser.elementIdElement(element.ELEMENT, 'css selector', 'h2', async function(anchor) {
              if(anchor.value.ELEMENT) {
                await new Promise((resolve) => {
                  browser.elementIdText(anchor.value.ELEMENT, function(text) {
                    if(text.value.includes(vaccineLocation)) {
                      locationsToCheck.push({
                        location: text.value,
                        childIdx: i + 1,
                        appoitmentsAvaliable: false
                      });
                    }
                    resolve();
                  })
                });
              }
              resolve();
            });
          });
        }
        for (idx in locationsToCheck) {
          await new Promise((resolve) => {
            browser.click("div[class='tw-border tw-border-n200 tw-rounded tw-box-border tw-shadow-md']:nth-of-type(" + locationsToCheck[idx].childIdx + ") button[data-testid=location-select-location-continue]", async () => {
              await new Promise((resolve) => {
                browser.pause(500)
                  .element('css selector', 'h3', async function(result) {
                    if(result.status != -1) {
                      browser.assert.containsText({
                        selector: 'h3'
                      }, "appointments available")
                        .back()
                        .waitForElementVisible('body', () => {
                          locationsToCheck[idx].appoitmentsAvaliable = true;
                          resolve();
                        })
                    } else {
                      browser.back()
                        .waitForElementVisible('body', () => {
                          resolve();
                        })
                    }
                })
              })
              resolve();
            })
          });
        }
        console.log("\n\n\n\n");
        var shouldAlert = false;
        var location = 1;
        var message = "HELLO";
        for (idx in locationsToCheck) {
          if(locationsToCheck[idx].appoitmentsAvaliable) {
            if(!shouldAlert) {
              beep(3, 500);
              shouldAlert = true;
              message = "Appoitments are avaliable! \n";
              console.log(message);
            }
            message = message + location + ": " + locationsToCheck[idx].location + "\n";
            console.log(message);
            location++;
          }
        }

        if(!shouldAlert) {
          console.log("No appoitments found...");
        } else {
          var params = {
            Message: message,
            TopicArn: snsArn
          };
          await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise().then(
            function(data) {
              console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
              console.log("MessageID is " + data.MessageId);
            }).catch(
              function(err) {
              console.error(err, err.stack);
            });;
        }
      })
  });

  after(browser => browser.end());
});

//.elements('xpath', '//div[contains(@class, "tw-border tw-border-n200 tw-rounded tw-box-border tw-shadow-md")][div/h2/text()[contains(.,"' + vaccineLocation + '")]]', function(locations) {
//npx nightwatch vaccine_check.js