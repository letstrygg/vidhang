const headerHTML = `
  <header>
    <nav></nav>
    <div id="auth"></div>
  </header>
`;
document.body.insertAdjacentHTML('afterbegin', headerHTML);

await import './theme.js';
await import './breadcrumb.js';
await import './auth.js';