const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = 70;
require('events').defaultMaxListeners = 70;

//Express configuration
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 3000;


//Main configuration variables
const urlToCheck = `https://www.hermes.com/au/en/category/women/bags-and-small-leather-goods/bags-and-clutches/#|`;
const elementsToSearchFor = ['1'];
const checkingFrequency = 0.2 * 60000; //first number represent the checkingFrequency in minutes
let initial_product_count = 5
//Slack Integration
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(SLACK_WEBHOOK_URL);

// //SendGrid Email Integration
// const SENDGRID_APY_KEY = 'AA.AAAA_AAAAAAAAAAAAA.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(SENDGRID_APY_KEY);
// const emailFrom = 'aaa@aaa.com';
// const emailsToAlert = ['emailOneToSend@theAlert.com', 'emailTwoToSend@theAlert.com'];


const checkingNumberBeforeWorkingOKEmail = 1440 / (checkingFrequency / 60000);   //1 day = 1440 minutes
let requestCounter = 0;

//Main function
const intervalId = setInterval(function () {
    
    (async () => {
        /* Initiate the Puppeteer browser */
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        console.log("fetch page")
        await page.goto(`https://www.hermes.com/au/en/category/women/bags-and-small-leather-goods/bags-and-clutches/#|`, { waitUntil: "networkidle0"})

        await page.waitForSelector('li.product-grid-list-item')
        const elements = await page.$$('li.product-grid-list-item');
        const html = await page.content();
        console.log(elements.length)
        if(elements.length != initial_product_count){
                console.log(elements.length)
                //Slack Alert Notification
                await slack.alert(`🔥🔥🔥  <${urlToCheck}/|Change detected in ${urlToCheck}, product list now contains ${elements.length} products>  🔥🔥🔥 `, function (err) {
                    if (err) {
                        console.log('Slack API error:', err);
                    } else {
                        console.log('Message received in slack!');
                    }
                });
                initial_product_count = elements.length
              
        }
        return browser
  
    })().then(function(value) {value.close()}, function(error) {})

    // request(urlToCheck, function (err, response, body) {
    //     //if the request fail
    //     if (err) {
    //         console.log(`Request Error - ${err}`);
    //     }
    //     else {
    //         //if the target-page content is empty
    //         if (!body) {
    //             console.log(`Request Body Error - ${err}`);
    //         }
    //         //if the request is successful
    //         else {
    //             console.log(body)
    //             //if any elementsToSearchFor exist
    //             if (elementsToSearchFor.some((el) => body.includes(el))) {

                    // // Slack Alert Notification
                    // slack.alert(`🔥🔥🔥  <${urlToCheck}/|Change detected in ${urlToCheck}>  🔥🔥🔥 `, function (err) {
                    //     if (err) {
                    //         console.log('Slack API error:', err);
                    //     } else {
                    //         console.log('Message received in slack!');
                    //     }
                    // });

    //                 // // Email Alert Notification
    //                 // const msg = {
    //                 //     to: emailsToAlert,
    //                 //     from: emailFrom,
    //                 //     subject: `🔥🔥🔥 Change detected in ${urlToCheck} 🔥🔥🔥`,
    //                 //     html: `Change detected in <a href="${urlToCheck}"> ${urlToCheck} </a>  `,
    //                 // };
    //                 // sgMail.send(msg)
    //                 //     .then(()=>{console.log("Alert Email Sent!");})
    //                 //     .catch((emailError)=>{console.log(emailError);});
    //             }

    //         }
    //     }
    // });

    requestCounter++;


    // // "Working OK" email notification logic
    // if (requestCounter > checkingNumberBeforeWorkingOKEmail) {

    //     requestCounter = 0;

    //     const msg = {
    //         to: emailsToAlert,
    //         from: emailFrom,
    //         subject: '👀👀👀 Website Change Monitor is working OK 👀👀👀',
    //         html: `Website Change Monitor is working OK - <b>${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}</b>`,
    //     };
    //     sgMail.send(msg)
    //         .then(()=>{console.log("Working OK Email Sent!");})
    //         .catch((emailError)=>{console.log(emailError);});
    // }

}, checkingFrequency);


//Index page render
app.get('/', function (req, res) {
    res.render('index', null);
});


//Server start
app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}!`)
});
