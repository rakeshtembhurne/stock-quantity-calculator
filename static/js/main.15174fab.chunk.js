(this["webpackJsonpstock-quantity-calculator"]=this["webpackJsonpstock-quantity-calculator"]||[]).push([[0],{24:function(e,a,t){e.exports=t(38)},29:function(e,a,t){},30:function(e,a,t){},38:function(e,a,t){"use strict";t.r(a);var r=t(0),n=t.n(r),o=t(21),l=t.n(o),c=t(14),s=(t(29),t(11)),i=t(15),u=t(10),m=t(5),p=(t(30),t(31),t(40)),d=t(41),y=t(23),g=t(42),b=t(43);var E=function(){var e=Object(m.d)(),a=n.a.useState(0),t=Object(u.a)(a,2),r=t[0],o=t[1],l=n.a.useState([]),c=Object(u.a)(l,2),E=c[0],h=c[1],f=new URLSearchParams(e.search),v=function(e){var a=n.a.useState(e),t=Object(u.a)(a,2),r=t[0],o=t[1];return[r,function(e){var a="radio"===e.target.type?e.target.name:e.target.id;o(Object(i.a)(Object(i.a)({},r),{},Object(s.a)({},a,e.target.value)))}]}({capital:f.get("c")||2e5,entryPrice:f.get("e")||0,slPerTrade:f.get("slpt")||2,stopLoss:f.get("sl")||0,tradingSymbol:f.get("n")||""}),C=Object(u.a)(v,2),S=C[0],L=C[1];function P(e){if(e&&e.preventDefault(),S.capital&&S.entryPrice&&S.slPerTrade&&S.stopLoss){var a=S.capital*S.slPerTrade/100,t=Math.abs(S.entryPrice-S.stopLoss),r=Math.round(a/t);console.log({maxLoss:a,stopLoss:t,quantity:r}),o(r)}}return n.a.useEffect((function(){if(S.tradingSymbol){var e=[{variety:"co",tradingsymbol:S.tradingSymbol,exchange:"NSE",transaction_type:"BUY",order_type:"LIMIT",product:"MIS",price:parseFloat(S.entryPrice),quantity:r,stoploss:Math.abs(S.entryPrice-S.stopLoss),trigger_price:parseFloat(S.stopLoss),readonly:!0}];h(e)}}),[S.tradingSymbol,S.entryPrice,S.stopLoss,r]),n.a.createElement(p.a,{className:"App"},n.a.createElement(d.a,{className:"quantity-container"},n.a.createElement(y.a,null,r)),n.a.createElement(g.a,{onSubmit:P},n.a.createElement(g.a.Row,null,n.a.createElement(g.a.Group,{as:y.a},n.a.createElement(g.a.Label,null,"Capital"),n.a.createElement(g.a.Control,{placeholder:"Capital",size:"lg",autoFocus:!0,autoComplete:"off",type:"number",id:"capital",value:S.capital,onChange:L,required:!0})),n.a.createElement(g.a.Group,{as:y.a},n.a.createElement(g.a.Label,null,"Stop Loss % per Trade"),n.a.createElement(g.a.Control,{placeholder:"SL % per trade",size:"lg",autoFocus:!0,autoComplete:"off",type:"number",id:"slPerTrade",value:S.slPerTrade,onChange:L,required:!0}))),n.a.createElement(g.a.Row,null,n.a.createElement(g.a.Group,{as:y.a},n.a.createElement(g.a.Label,null,"Entry Price"),n.a.createElement(g.a.Control,{placeholder:"Entry Price",size:"lg",autoFocus:!0,autoComplete:"off",type:"number",id:"entryPrice",value:S.entryPrice,onChange:L,required:!0})),n.a.createElement(g.a.Group,{as:y.a},n.a.createElement(g.a.Label,null,"Stop Loss"),n.a.createElement(g.a.Control,{placeholder:"Capital",size:"lg",autoFocus:!0,autoComplete:"off",type:"number",id:"stopLoss",value:S.stopLoss,onChange:L,required:!0}))),n.a.createElement(g.a.Row,null,n.a.createElement(g.a.Group,{as:y.a},n.a.createElement(g.a.Label,null,"Trading Symbol"),n.a.createElement(g.a.Control,{placeholder:"STOCKNAME",size:"lg",autoFocus:!0,autoComplete:"off",type:"text",id:"tradingSymbol",value:S.tradingSymbol,onChange:L,required:!0}))),n.a.createElement(b.a,{size:"lg",variant:"primary",type:"submit"},"Calculate Quantity")),n.a.createElement("br",null),n.a.createElement("form",{method:"post",id:"basket-form",action:"https://kite.zerodha.com/connect/basket",onSubmit:function(e){P()}},n.a.createElement("input",{type:"hidden",name:"api_key",value:"59y2dm60w17qw3y4"}),n.a.createElement(g.a.Control,{type:"hidden",id:"basket",name:"data",value:JSON.stringify(E),required:!0}),n.a.createElement(b.a,{size:"lg",variant:"secondary",type:"submit"},"Buy Intraday")))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(n.a.createElement(n.a.StrictMode,null,n.a.createElement(c.a,null,n.a.createElement(E,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[24,1,2]]]);
//# sourceMappingURL=main.15174fab.chunk.js.map