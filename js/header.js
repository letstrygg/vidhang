const headerHTML = `
  <header>
    <nav></nav>
    <div id="auth"></div>
  </header>
`;
document.body.insertAdjacentHTML('afterbegin', headerHTML);

import './theme.js';
import './breadcrumb.js';
import './auth.js';