const express = require("express");
const fs = require('fs');
const https = require('https');
const Stripe = require('stripe');
const cors = require("cors");
const stripe = Stripe('sk_test');

const options = {
    key: fs.readFileSync('./certificado/key.pem'),
    cert: fs.readFileSync('./certificado/cert.pem')
  };
const app = express();

app.use(express.json());
app.use(cors());

const port = 3000;
const host = "localhost";

app.post("/payment-sheet", async(req, res, next) => {
    try {
        const data = req.body;
        const origin = req.get('Origin');
        console.log('Request origin:', origin);
        const params = {
            email: data.email,
            name: data.name,
        };
        const customer = await stripe.customers.create(params);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2020-08-27'}
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    } catch(e) {
        next(e);
    }
});

// https.createServer(options, app).listen(port, host, () => {
//   console.log(`Server is running at ${host} : ${port}`);
// });

app.listen(port, host, () => {
    console.log(`Server is running at ${host} ${port}`);
});