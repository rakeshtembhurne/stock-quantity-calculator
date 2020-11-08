import React from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Row, Col, Button, Container, Badge } from 'react-bootstrap';

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

  const location = useLocation();
  const [quantity, setQuantity] = React.useState(0);
  const [maximumLoss, setMaximumLoss] = React.useState(0);
  const [targetPrice, setTargetPrice] = React.useState(0);
  const [coBasket, setCoBasket] = React.useState([]);
  const [boBasket, setBoBasket] = React.useState([]);
  const [moBasket, setMoBasket] = React.useState([]);
  const [buyOrSell, setBuyOrSell] = React.useState('BUY');

  const searchParams = new URLSearchParams(location.search);
  const [fields, handleFieldChange] = useFormFields({
    capital: searchParams.get("c") || localStorage.getItem("capital") || 200000,
    entryPrice: searchParams.get("e") || localStorage.getItem("entryPrice") || 0,
    targetPrice: searchParams.get("t") || localStorage.getItem("targetPrice") || 0,
    slPerTrade: searchParams.get("slpt") || localStorage.getItem("slPerTrade") || 2,
    stopLoss: searchParams.get("sl") || localStorage.getItem("stopLoss") || 0,
    tradingSymbol: searchParams.get("n") || localStorage.getItem("tradingSymbol") || "",
  });

  function calculateQuantity(e) {
    if (e) {
      e.preventDefault();
    }

    if (fields.capital && fields.entryPrice && fields.slPerTrade && fields.stopLoss) {
      const maxLoss = ((fields.capital * fields.slPerTrade) / 100);
      const stopLoss = Math.abs((fields.entryPrice - fields.stopLoss));
      const target = fields.targetPrice ? Math.abs((fields.targetPrice - fields.entryPrice)) : 0;
      const quantity =  Math.round(maxLoss / stopLoss);
      console.log({maxLoss, stopLoss, quantity});
      setQuantity(quantity);
      setMaximumLoss(maxLoss);
      setTargetPrice(target);
    }
  }

  function onBuyIntraday(e) {
    calculateQuantity();
    // TODO: save data to local storage
    localStorage.setItem('capital', fields.capital);
    localStorage.setItem('entryPrice', fields.entryPrice);
    localStorage.setItem('targetPrice', fields.targetPrice);
    localStorage.setItem('slPerTrade', fields.slPerTrade);
    localStorage.setItem('stopLoss', fields.stopLoss);
    localStorage.setItem('tradingSymbol', fields.tradingSymbol);
  }

  function getTrailingSl(ltp) {
    if (ltp < 100) {
      return 1;
    } else if (ltp < 200) {
      return 1.5;
    } else if (ltp < 400) {
      return 2;
    } else if (ltp < 600) {
      return 2.5;
    } else if (ltp < 800) {
      return 3;
    } else if (ltp < 1000) {
      return 4;
    } else {
      return 5;
    }
  }

  React.useEffect(() => {
    const bos = (fields.stopLoss < fields.entryPrice) ? 'BUY' : 'SELL';
    const sob = bos === 'BUY' ? 'SELL' : 'BUY';

    setBuyOrSell(bos);
    calculateQuantity();

    if (fields.tradingSymbol) {
      const stoploss = Math.abs((fields.entryPrice - fields.stopLoss));
      const squareoff = Number(stoploss * 1.5).toFixed(1);

      const co = [{
        variety: 'co',
        tradingsymbol: fields.tradingSymbol,
        exchange: 'NSE',
        transaction_type: bos,
        order_type: 'LIMIT',
        product: 'MIS',
        price: parseFloat(fields.entryPrice),
        quantity: quantity,
        stoploss: stoploss,
        trigger_price: parseFloat(fields.stopLoss),
        readonly: true,
      }];
      setCoBasket(co);

      const bo = [{
        tradingsymbol: fields.tradingSymbol,
        exchange: 'NSE',
        transaction_type: bos,
        order_type: 'LIMIT',
        product: 'MIS',
        price: parseFloat(fields.entryPrice),
        quantity: quantity,
        variety: 'bo',
        stoploss: stoploss,
        squareoff: parseFloat(squareoff),
        trailing_stoploss: getTrailingSl(fields.entryPrice),
        trigger_price: parseFloat(fields.stopLoss),
        readonly: true,
      }];
      setBoBasket(bo);

      const mo = [
        {
          exchange: 'NSE',
          tradingsymbol: fields.tradingSymbol,
          quantity: quantity,
          transaction_type: bos,
          product: 'MIS',
          order_type: "LIMIT",
          price: parseFloat(fields.entryPrice),
        },
        {
          tradingsymbol: fields.tradingSymbol,
          exchange: 'NSE',
          transaction_type: sob,
          order_type: 'SL-M',
          product: 'MIS',
          price: parseFloat(fields.stopLoss),
          quantity: quantity,
          trigger_price: parseFloat(fields.stopLoss),
        },
      ];
      if (fields.targetPrice > 0) {
        mo.push({
          exchange: 'NSE',
          tradingsymbol: fields.tradingSymbol,
          quantity: quantity,
          transaction_type: sob,
          product: 'MIS',
          order_type: "LIMIT",
          price: parseFloat(fields.targetPrice),
          trigger_price: parseFloat(fields.targetPrice),
        });
      }
      setMoBasket(mo);

      console.log({co, bo, mo});
    }
  }, [fields.tradingSymbol, fields.entryPrice, fields.stopLoss, quantity, fields.capital, fields.slPerTrade, fields.targetPrice]);

  return (
    <Container className="App">
      <Row className="quantity-container">
        <Col>{quantity}</Col>
      </Row>
      <Row className="risk-container">
        <Col className="text-center"><Badge variant="danger">{maximumLoss}</Badge></Col>
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
        </Form.Row>

        <Form.Row>

        <Form.Group as={Col}>
            <Form.Label>Target</Form.Label>
            <Form.Control
              placeholder="Target Price"
              size="lg"
              autoFocus
              autoComplete="off"
              type="number"
              id="targetPrice"
              value={fields.targetPrice}
              onChange={handleFieldChange}
              required
            />
          </Form.Group>

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
        id="coBasket-form"
        action="https://kite.zerodha.com/connect/basket"
        onSubmit={onBuyIntraday}
        className="mr-3 mb-3 d-inline"
      >
        <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
        <Form.Control
          type="hidden"
          id="coBasket"
          name="data"
          value={JSON.stringify(coBasket)}
          required
        />
        <Button size="lg" variant={buyOrSell === 'BUY' ? 'success' : 'danger'} type="submit">
          {buyOrSell} Intraday CO
        </Button>
      </form>

      <form
        method="post"
        id="boBasket-form"
        action="https://kite.zerodha.com/connect/basket"
        onSubmit={onBuyIntraday}
        className="mr-3 mb-3 d-inline"
      >
        <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
        <Form.Control
          type="hidden"
          id="boBasket"
          name="data"
          value={JSON.stringify(boBasket)}
          required
        />
        <Button size="lg" variant={buyOrSell === 'BUY' ? 'success' : 'danger'} type="submit">
          {buyOrSell} Intraday Bracket Order
        </Button>
      </form>

      <form
        method="post"
        id="moBasket-form"
        action="https://kite.zerodha.com/connect/basket"
        onSubmit={onBuyIntraday}
        className="mr-3 mb-3 d-inline"
      >
        <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
        <Form.Control
          type="hidden"
          id="moBasket"
          name="data"
          value={JSON.stringify(moBasket)}
          required
        />
        <Button size="lg" variant={buyOrSell === 'BUY' ? 'success' : 'danger'} type="submit">
          {buyOrSell} Market Order
        </Button>
      </form>
    </Container>
  );
}

export default App;
