const state = {
  publicKey: document.getElementById('publicKey'),
  plaintext: document.getElementById('plaintext'),
  ciphertext: document.getElementById('ciphertext'),
  encryptBtn: document.getElementById('encryptBtn'),
  copyBtn: document.getElementById('copyBtn'),
  clearBtn: document.getElementById('clearBtn'),
  status: document.getElementById('status'),
};

function setStatus(message, kind = 'info') {
  state.status.textContent = message;
  state.status.dataset.kind = kind;
}

function initializeRecipientFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const reference = params.get('reference') ?? hashParams.get('reference');

  if (!reference) return false;

  const publicKey = reference.trim();
  if (!publicKey) return false;

  state.publicKey.value = publicKey;
  setStatus('Recipient public key loaded from the URL reference parameter.', 'success');
  return true;
}

async function encryptSecret() {
  const recipient = state.publicKey.value.trim();
  const plaintext = state.plaintext.value;
  if (!recipient) {
    setStatus('Add a public age recipient first.', 'error');
    return;
  }
  if (!plaintext) {
    setStatus('Paste the secret text you want to encrypt.', 'error');
    return;
  }

  state.encryptBtn.disabled = true;
  state.copyBtn.disabled = true;
  setStatus('Encrypting locally in your browser…');

  try {
    const encrypter = new age.Encrypter();
    encrypter.addRecipient(recipient);
    const encrypted = await encrypter.encrypt(plaintext);
    const armored = age.armor.encode(encrypted);
    state.ciphertext.value = armored;
    state.copyBtn.disabled = false;
    setStatus('Done. Send only the armored ciphertext in chat.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(`Encryption failed: ${error?.message ?? error}`, 'error');
  } finally {
    state.encryptBtn.disabled = false;
  }
}

async function copyCiphertext() {
  if (!state.ciphertext.value.trim()) return;
  await navigator.clipboard.writeText(state.ciphertext.value);
  setStatus('Ciphertext copied to clipboard.', 'success');
}

function clearAll() {
  state.plaintext.value = '';
  state.ciphertext.value = '';
  state.copyBtn.disabled = true;
  setStatus('Cleared plaintext and ciphertext fields.');
}

state.encryptBtn.addEventListener('click', (event) => {
  event.preventDefault();
  void encryptSecret();
});
state.copyBtn.addEventListener('click', (event) => {
  event.preventDefault();
  void copyCiphertext();
});
state.clearBtn.addEventListener('click', (event) => {
  event.preventDefault();
  clearAll();
});

if (!initializeRecipientFromUrl()) {
  setStatus('Ready. Nothing leaves the page until you copy the ciphertext.');
}
