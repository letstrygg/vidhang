export function setPageTitle(title) {
  document.title = title ? `${title} - vidhang` : 'vidhang';
}

function initPageTitle() {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    setPageTitle();
    return;
  }

  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    setPageTitle();
    return;
  }

  let lastSegment = segments[segments.length - 1];

  if (lastSegment.includes('.')) {
    lastSegment = lastSegment.substring(0, lastSegment.lastIndexOf('.'));
  }

  const formattedTitle = lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  setPageTitle(formattedTitle);
}

// Auto-run on module load
initPageTitle();