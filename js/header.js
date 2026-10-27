const headerHTML = `
  <header>
    <nav></nav>
	<input type="search" placeholder="Search..." />
    <div id="auth"></div>
  </header>
`;
document.body.insertAdjacentHTML('afterbegin', headerHTML);

await import('./theme.js');
await import('./breadcrumb.js');
await import('./auth.js');

export function setPageTitle(title) {
  document.title = title ? `${title} - vidhang` : 'vidhang';
}

setPageTitle();