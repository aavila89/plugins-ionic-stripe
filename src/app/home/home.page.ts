import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, lastValueFrom } from 'rxjs';
import {
  PaymentSheetEventsEnum,
  Stripe } from '@capacitor-community/stripe';
import { environment } from 'src/environments/environment';

export interface IStripePay {
  name: string;
  email: string;
  amount: number;
  currency: string;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  payload!: IStripePay;
  constructor(
    private http: HttpClient
    ) {}
  ngOnInit() {
    Stripe.initialize({
      publishableKey: environment.stripe.publishableKey,
    });
  }

  async paymentSheet() {
    try {
      this.payload = {
        name: 'Adrian A.',
        currency: 'USD',
        email: 'ionicpluginsexpert@gmail.com',
        amount: 3200.0
      };
      // be able to get event of PaymentSheet
      Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
        console.log('PaymentSheetEventsEnum.Completed');
      });

    const { paymentIntent, ephemeralKey, customer } = await this.requestPaymentSheet(this.payload);
    // prepare PaymentSheet with CreatePaymentSheetOption.
    await Stripe.createPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: 'Ionic plugins expert'
      });

      // present PaymentSheet and get result.
      const {paymentResult} = await Stripe.presentPaymentSheet();
      if (paymentResult === PaymentSheetEventsEnum.Completed) {
        // Happy path
        this.splitAndJoin(paymentIntent);
      }
    } catch(e) {
      console.log(e);
    }
  }

  async requestPaymentSheet(body: IStripePay) {
      const data$ = this.http.post<any>(environment.stripe.api + 'payment-sheet', body, {}).pipe(first());
      return await lastValueFrom(data$); 
  }

  splitAndJoin(paymentIntent: string) {
    const result = paymentIntent.split('_').slice(0, 2).join('_');;
    return result;
  }

}
