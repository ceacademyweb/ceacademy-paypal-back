import axios from 'axios';
import Usersubs from '../models/User.model';
import {
  PAYPAL_API,
  HOST,
  PAYPAL_API_CLIENT,
  PAYPAL_API_SECRET,
} from '../config';

export const createOrder = async (req, res) => {
  console.log('client: ' + PAYPAL_API_CLIENT);
  const telegram = req.body.telegram;
  try {
    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '200',
          },
        },
      ],
      application_context: {
        brand_name: 'CEACADEMY',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${HOST}/capture-order/${telegram}`,
        cancel_url: `${HOST}/cancel-payment`,
      },
    };

    // format the body
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    // Generate an access token
    const {
      data: { access_token },
    } = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
        },
      }
    );

    console.log(access_token);

    // make a request
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      order,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log(response.data);

    return res.json(response.data);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json('Something goes wrong');
  }
};

export const captureOrder = async (req, res) => {
  const { token } = req.query;
  const telegram = req.params.telegram;
  console.log(telegram);
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
      {},
      {
        auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
        },
      }
    );

    console.log(response.data);
    const data = response.data;
    Usersubs.find({ telegram: telegram }, (err, result) => {
      console.log('error: ' + err);
      console.log(result.length);
      if (result.length === 0) {
        const user = new Usersubs({
          name: data.payer.name.given_name,
          surname: data.payer.name.surname,
          email: data.payer.email_address,
          subscribed: true,
          payId: data.id,
          telegram: telegram,
        });
        user.save((err, resp) => {
          if (err) {
            console.log(err);
          } else {
            console.log(user);
          }
        });
        // console.log('user: '+user)
      } else {
        console.log('result: ' + result);
      }
    });
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server error' });
  }
};

export const cancelPayment = (req, res) => {
  res.redirect('/');
};
