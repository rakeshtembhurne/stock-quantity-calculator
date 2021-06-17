import React from 'react';
import { useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Container, Badge } from 'react-bootstrap';
import Select from 'react-select'
import stocks from './stocks.json';
import zerodhaIds from './zerodhaIds.json';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const logR = d => {
    console.log(JSON.stringify(d, null, 2));
    return d;
}

export function useFormFields(initialState) {
    const [fields, setValues] = React.useState(initialState);

    function setFormField(event) {
        let idOrName;
        let theValue;
        if (Object.prototype.hasOwnProperty.call(event, 'target')) {
            idOrName = event.target.type === "radio" ? event.target.name : event.target.id;
            theValue = event.target.value;
        } else {
            idOrName = "tradingSymbol";
            theValue = event.value;
        }
        setValues({
            ...fields,
            [idOrName]: theValue,
        });
    }

    return [fields, setFormField];
}

function Cash() {

    const location = useLocation();
    const [quantity, setQuantity] = React.useState(0);
    const [maximumLoss, setMaximumLoss] = React.useState(0);
    const [maximumProfit, setMaximumProfit] = React.useState(0);
    const [coBasket, setCoBasket] = React.useState([]);
    const [boBasket, setBoBasket] = React.useState([]);
    const [moBasket, setMoBasket] = React.useState([]);
    const [loBasket, setLoBasket] = React.useState([]);
    const [buyOrSell, setBuyOrSell] = React.useState('BUY');

    const searchParams = new URLSearchParams(location.search);

    const [entryPrice, setEntryPrice] = React.useState(searchParams.get("e") || localStorage.getItem("entryPrice") || 0);
    const [targetPrice, setTargetPrice] = React.useState(searchParams.get("t") || localStorage.getItem("targetPrice") || 0);
    const [slPrice, setSlPrice] = React.useState(searchParams.get("s") || localStorage.getItem("slPrice") || 0);
    const [stopLoss, setStopLoss] = React.useState(searchParams.get("sl") || localStorage.getItem("stopLoss") || 0);

    const [tradingSymbol, setTradingSymbol] = React.useState(searchParams.get("n") || localStorage.getItem("tradingSymbol") || "");
    const [risk, setRisk] = React.useState(searchParams.get("r") || localStorage.getItem("risk") || 500);
    const [riskPC, setRiskPerCent] = React.useState(searchParams.get("rpc") || localStorage.getItem("riskPC") || 0.5);
    const [targetPC, setTargetPC] = React.useState(searchParams.get("tpc") || localStorage.getItem("targetPC") || 1);

    
    function calculateQuantity(e) {
        if (e) {
            e.preventDefault();
        }

        if (entryPrice) {
            const slPrice = Number(entryPrice * (1 - riskPC/100)).toFixed(1);
            const targetPrice = Number(entryPrice * (1 + targetPC/100)).toFixed(1);
            const stopLoss = Number(entryPrice - slPrice).toFixed(1);
            const target = Number(targetPrice - entryPrice).toFixed(1);
            const quantity = Number(Math.round(500 / stopLoss)).toFixed(1);

            const maxLoss = Number(stopLoss * quantity).toFixed(1);
            const maxProfit = Number(target * quantity).toFixed(1);
            setMaximumLoss(maxLoss);
            setMaximumProfit(maxProfit);

            setQuantity(quantity);
            setSlPrice(slPrice);
            setTargetPrice(targetPrice);
            setStopLoss(stopLoss);
            console.log({entryPrice, slPrice, targetPrice, quantity, maxLoss, maxProfit});

        }
    }

    function onBuyIntraday(e) {
        calculateQuantity();

        localStorage.setItem('entryPrice', entryPrice);
        localStorage.setItem('slPrice', slPrice);
        localStorage.setItem('targetPrice', targetPrice);
        localStorage.setItem('tradingSymbol', tradingSymbol);
        localStorage.setItem('risk', risk);
        localStorage.setItem('maximumLoss', maximumLoss);
        localStorage.setItem('maximumProfit', maximumProfit);

        
    }

    React.useEffect(() => {
        console.log({tradingSymbol})
        if (tradingSymbol) {
            getLTP();
        }
    }, [tradingSymbol])

    React.useEffect(() => {
        calculateQuantity();
    }, [entryPrice])


    
    function getLTP() {
        const zerodhaId = zerodhaIds[tradingSymbol];
        fetch(`http://localhost:4000/ltp/${zerodhaId}`)
        .then(response => response.text())
        .then(ltp => setEntryPrice(ltp))
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
        const bos = (+slPrice < +entryPrice) ? 'BUY' : 'SELL';
        const sob = bos === 'BUY' ? 'SELL' : 'BUY';

        setBuyOrSell(bos);
        calculateQuantity();

        if (tradingSymbol) {
            const stoploss = Math.abs((entryPrice - stopLoss));
            const squareoff = Number(stoploss * 1.5).toFixed(1);

            const co = [{
                variety: 'co',
                tradingsymbol: tradingSymbol,
                exchange: 'NSE',
                transaction_type: bos,
                order_type: 'LIMIT',
                product: 'MIS',
                price: parseFloat(entryPrice),
                quantity: +quantity,
                stoploss: +stopLoss,
                trigger_price: parseFloat(slPrice),
                readonly: true,
            }];
            setCoBasket(co);

            const bo = [{
                tradingsymbol: tradingSymbol,
                exchange: 'NSE',
                transaction_type: bos,
                order_type: 'LIMIT',
                product: 'MIS',
                price: parseFloat(entryPrice),
                quantity: +quantity,
                variety: 'bo',
                stoploss: +stoploss,
                squareoff: parseFloat(squareoff),
                trailing_stoploss: getTrailingSl(entryPrice),
                trigger_price: parseFloat(stopLoss),
                readonly: true,
            }];
            setBoBasket(bo);

            const lo = [
                {
                    exchange: 'NSE',
                    tradingsymbol: tradingSymbol,
                    quantity: +quantity,
                    transaction_type: bos,
                    product: 'MIS',
                    order_type: "LIMIT",
                    price: parseFloat(entryPrice),
                    // trigger_price: parseFloat(entryPrice),
                },
                {
                    tradingsymbol: tradingSymbol,
                    exchange: 'NSE',
                    transaction_type: sob,
                    order_type: 'SL-M',
                    product: 'MIS',
                    price: parseFloat(stopLoss),
                    quantity: +quantity,
                    trigger_price: parseFloat(stopLoss),
                },
            ];

            const mo = [
                {
                    exchange: 'NSE',
                    tradingsymbol: tradingSymbol,
                    quantity: +quantity,
                    transaction_type: bos,
                    product: 'MIS',
                    order_type: "SL-M",
                    price: parseFloat(entryPrice),
                    trigger_price: parseFloat(entryPrice),
                },
                {
                    tradingsymbol: tradingSymbol,
                    exchange: 'NSE',
                    transaction_type: sob,
                    order_type: 'SL-M',
                    product: 'MIS',
                    price: parseFloat(stopLoss),
                    quantity: +quantity,
                    trigger_price: parseFloat(stopLoss),
                },
            ];
            if (targetPrice > 0) {
                const targetOrder = {
                    exchange: 'NSE',
                    tradingsymbol: tradingSymbol,
                    quantity: +quantity,
                    transaction_type: sob,
                    product: 'MIS',
                    order_type: "LIMIT",
                    price: parseFloat(targetPrice),
                    trigger_price: parseFloat(targetPrice),
                };
                mo.push(targetOrder);
                lo.push(targetOrder);
            }
            setMoBasket(mo);
            setLoBasket(lo);

            console.log({lo, co})
        }
    }, [entryPrice, slPrice, targetPrice, stopLoss]);

    return (
        <Container className="Cash">
            <Row className="quantity-container">
                <Col>Equity</Col>
            </Row>
            <Row className="risk-container">
                <Col className="text-center">
                    <Badge variant="danger" className="m-1 my-3">Risk: <big><strong>{maximumLoss} ({slPrice})</strong></big></Badge>
                    {targetPrice && targetPrice > 0 && (
                        <>
                            <Badge variant="success" className="m-1 my-3">Reward: <big><strong>{Number(maximumProfit).toFixed(2)} ({targetPrice})</strong></big></Badge>
                            <Badge variant="warning" className="m-1 my-3">RRR: <big><strong>{Number(maximumProfit / maximumLoss).toFixed(1)}</strong></big></Badge>
                        </>
                    )}
                    {/* <Badge variant="info" className="m-1 my-3">Quantity: <big><strong>{quantity}</strong></big></Badge> */}
                </Col>
            </Row>

            <Form onSubmit={calculateQuantity}>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Trading Symbol</Form.Label>
                        <Select
                            options={stocks}
                            id="tradingSymbol"
                            // value={tradingSymbol}
                            onChange={o => setTradingSymbol(o.value)}
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
                            value={entryPrice}
                            onChange={e => +e.target.value && setEntryPrice(e.target.value)}
                            step="0.1"
                            required
                        />
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                            placeholder="Quantity"
                            size="lg"
                            autoFocus
                            autoComplete="off"
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Form.Row>
            </Form>
                    <Col>
                        <form
                            method="post"
                            id="moBasket-form"
                            action="https://kite.zerodha.com/connect/basket"
                            onSubmit={onBuyIntraday}
                            className=" mt-4 d-inline"
                        >
                            <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
                            <Form.Control
                                type="hidden"
                                id="moBasket"
                                name="data"
                                value={JSON.stringify(loBasket)}
                                required
                            />
                            <Button className="m-4" size="lg" variant={buyOrSell === 'BUY' ? 'success' : 'danger'} type="submit">
                                Limit
                            </Button>
                        </form>
                    
                        <form
                            method="post"
                            id="coBasket-form"
                            action="https://kite.zerodha.com/connect/basket"
                            onSubmit={onBuyIntraday}
                            className=" mt-4 d-inline"
                        >
                            <input type="hidden" name="api_key" value="59y2dm60w17qw3y4" />
                            <Form.Control
                                type="hidden"
                                id="coBasket"
                                name="data"
                                value={JSON.stringify(coBasket)}
                                required
                            />
                            <Button className="m-4" size="lg" variant={buyOrSell === 'BUY' ? 'success' : 'danger'} type="submit">
                                Cover
                            </Button>
                        </form>
                    </Col>
                
            

        </Container>
    );
}

export default Cash;
