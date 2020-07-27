import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Row, Col, Button, Container } from 'react-bootstrap';

export function useFormFields(initialState) {
  const [fields, setValues] = React.useState(initialState);

  function setFormField(event) {
    const idOrName =
      event.target.type === "radio" ? event.target.name : event.target.id;

    setValues({
      ...fields,
      [idOrName]: event.target.value,
    });
  }

  return [fields, setFormField];
}

function App() {

  const [quantity, setQuantity] = React.useState(0);
  const [basket, setBasket] = React.useState([]);

  const [fields, handleFieldChange] = useFormFields({
    capital: 200000,
    entryPrice: 0,
    slPerTrade: 2,
    stopLoss: 0,
    tradingSymbol: '',
  });

  function calculateQuantity(e) {
    if (e) {
      e.preventDefault();
    }

    if (fields.capital && fields.entryPrice && fields.slPerTrade && fields.stopLoss) {
      const maxLoss = ((fields.capital * fields.slPerTrade) / 100);
      const stopLoss = Math.abs((fields.entryPrice - fields.stopLoss));
      const quantity =  Math.round(maxLoss / stopLoss);
      console.log({maxLoss, stopLoss, quantity});
      setQuantity(quantity);
    }
  }

  function onBuyIntraday(e) {
    calculateQuantity();
  }

  React.useEffect(() => {
    if (fields.tradingSymbol) {
      const b = [{
        variety: 'co',
        tradingsymbol: fields.tradingSymbol,
        exchange: 'NSE',
        transaction_type: 'BUY',
        order_type: 'LIMIT',
        product: 'MIS',
        price: parseFloat(fields.entryPrice),
        quantity: quantity,
        stoploss: Math.abs((fields.entryPrice - fields.stopLoss)),
        trigger_price: parseFloat(fields.stopLoss),
        readonly: true,
      }];
      setBasket(b);
    }
  }, [fields.tradingSymbol, fields.entryPrice, fields.stopLoss, quantity]);

  return (
    <Container className="App">
      <Row className="quantity-container">
        <Col>{quantity}</Col>
      </Row>
      <Form onSubmit={calculateQuantity}>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Capital</Form.Label>
            <Form.Control
              placeholder="Capital"
              size="lg"
              autoFocus
              autoComplete="off"
              type="number"
              id="capital"
              value={fields.capital}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label>Stop Loss % per Trade</Form.Label>
            <Form.Control
              placeholder="SL % per trade"
              size="lg"
              autoFocus
              autoComplete="off"
              type="number"
              id="slPerTrade"
              value={fields.slPerTrade}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Entry Price</Form.Label>
            <Form.Control
              placeholder="Entry Price"
              size="lg"
              autoFocus
              autoComplete="off"
              type="number"
              id="entryPrice"
              value={fields.entryPrice}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label>Stop Loss</Form.Label>
            <Form.Control
              placeholder="Capital"
              size="lg"
              autoFocus
              autoComplete="off"
              type="number"
              id="stopLoss"
              value={fields.stopLoss}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>Trading Symbol</Form.Label>
            <Form.Control
              placeholder="STOCKNAME"
              size="lg"
              autoFocus
              autoComplete="off"
              type="text"
              id="tradingSymbol"
              value={fields.tradingSymbol}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>
        </Form.Row>

        <Button size="lg" variant="primary" type="submit">
          Calculate Quantity
        </Button>
      </Form>

      <br />
      <form
        method="post"
        id="basket-form"
        action="https://kite.zerodha.com/connect/basket"
        onSubmit={onBuyIntraday}
      >
        <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
        <Form.Control
          type="hidden"
          id="basket"
          name="data"
          value={JSON.stringify(basket)}
          required
        />
        <Button size="lg" variant="secondary" type="submit">
          Buy Intraday
        </Button>
      </form>
    </Container>
  );
}

export default App;
