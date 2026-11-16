const buttons = document.querySelectorAll('button[data-path]');
const output = document.querySelector('#output');
async function readBody(response) {
  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  }

  return response.text();
}

async function callApi(method, path) {
  output.className = '';
  output.textContent = `${method} ${path}\nLoading...`;

  try {
    const response = await fetch(path, { method });
    const body = await readBody(response);

    output.className = response.ok ? 'success' : 'failure';
    output.textContent =
      `${method} ${path}\n` +
      `Status: ${response.status} ${response.statusText}\n\n` +
      body;
  } catch (error) {
    // Network error (server stopped, page opened from disk, ...)
    output.className = 'failure';
    output.textContent = `${method} ${path}\nRequest failed: ${error.message}`;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    callApi(button.dataset.method, button.dataset.path);
  });
});