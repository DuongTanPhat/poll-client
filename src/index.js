import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
    <Router>
        <App />
    </Router>, 
    document.getElementById('root')
);

registerServiceWorker();



// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './app/App';
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
// // import React from 'react';
// // import ReactDOM from 'react-dom';
// // import './index.css';
// // import App from './App';
// // import * as serviceWorker from './serviceWorker';
// // import { BrowserRouter as Router } from 'react-router-dom';

// // ReactDOM.render(
// //     <Router>
// //         <App />
// //     </Router>, 
// //     document.getElementById('root')
// // );

// // serviceWorker.unregister();