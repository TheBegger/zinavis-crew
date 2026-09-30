'use strict';
const releaseStatus = document.querySelector('#release-status');
const updateStatus = document.querySelector('#update-status');
const updateButton = document.querySelector('#check-updates');
const loading = document.querySelector('#loading');
const progress = document.querySelector('#load-progress');
let platform = 'windows';
let manifest = null;
function safeUrl(value) {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function validateManifest(data) {
  if (data?.schemaVersion !== 1 || data.channel !== 'crew' || !['preparing','published'].includes(data.status) || !data.platforms?.windows || !data.platforms?.macos) throw new Error('Ungültige Release-Informationen.');
  if (data.status === 'published' && (!/^\d+\.\d+\.\d+$/.test(data.version || '') || !safeUrl(data.sourceUrl))) throw new Error('Release-Informationen sind unvollständig.');
  for (const name of ['windows','macos']) {
    const os = data.platforms[name];
    if (typeof os.available !== 'boolean' || !os.downloads || typeof os.downloads !== 'object') throw new Error('Plattform-Informationen fehlen.');
    if (os.available && (data.status !== 'published' || !['player','creator','kit'].every(product => safeUrl(os.downloads[product])))) throw new Error('Download-Adressen fehlen.');
  }
  return data;
}
function render() {
  const os = manifest?.platforms[platform];
  releaseStatus.textContent = os?.available ? `ZINAVIS ${manifest.version} · ${platform === 'windows' ? 'Windows' : 'macOS'} · bereit zum Download.` : platform === 'macos' ? 'Die Mac-Version folgt nach ihrem eigenen Build und Installationstest.' : manifest?.notes || 'Release wird vorbereitet.';
  document.querySelectorAll('[data-product]').forEach(link => {
    const href = os?.available ? safeUrl(os.downloads[link.dataset.product]) : null;
    link.classList.toggle('disabled', !href);
    link.setAttribute('aria-disabled', String(!href));
    if (href) { link.href = href; link.textContent = `${link.dataset.product === 'kit' ? 'Kit' : link.dataset.product === 'creator' ? 'Creator' : 'Player'} herunterladen`; }
    else { link.removeAttribute('href'); link.textContent = 'Release wird vorbereitet'; }
  });
  const notes = document.querySelector('#release-notes');
  const url = safeUrl(manifest?.releaseNotesUrl);
  notes.hidden = !url;
  if (url) notes.href = url; else notes.removeAttribute('href');
  const source = document.querySelector('#source-link');
  const sourceUrl = safeUrl(manifest?.sourceUrl);
  source.hidden = !sourceUrl;
  if (sourceUrl) source.href = sourceUrl; else source.removeAttribute('href');
}
async function checkUpdates() {
  updateButton.disabled = true; loading.hidden = false; progress.removeAttribute('value');
  updateStatus.textContent = 'Release-Informationen werden geladen …';
  try {
    const response = await fetch(`releases.json?t=${Date.now()}`, {cache:'no-store', signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('Die Release-Informationen sind gerade nicht erreichbar.');
    const size = Number(response.headers.get('content-length'));
    let text;
    if (response.body) {
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let received = 0; text = '';
      for (;;) { const {done,value} = await reader.read(); if (done) break; received += value.length; if (received > 65536) { await reader.cancel(); throw new Error('Release-Informationen sind zu groß.'); } text += decoder.decode(value,{stream:true}); if (size > 0) { progress.max = size; progress.value = received; } }
      text += decoder.decode();
    } else text = await response.text();
    manifest = validateManifest(JSON.parse(text)); render();
    updateStatus.textContent = manifest.status === 'published' ? `Stand geprüft: Version ${manifest.version}.` : 'Noch kein freigegebener Release. Hier erscheint der Download nach der Freigabe.';
  } catch (error) {
    // Do not offer a stale download after a failed or malformed update check.
    manifest = null; render();
    updateStatus.textContent = `Updates konnten nicht geprüft werden. Bitte erneut versuchen.${error.name === 'TimeoutError' ? ' Die Anfrage hat zu lange gedauert.' : ''}`;
  } finally { loading.hidden = true; updateButton.disabled = false; }
}
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  platform = button.dataset.platform;
  document.querySelectorAll('[data-platform]').forEach(item => item.setAttribute('aria-pressed',String(item === button))); render();
}));
updateButton.addEventListener('click',checkUpdates);
const dialog = document.querySelector('#feedback-dialog');
document.querySelector('#open-feedback').addEventListener('click',() => dialog.showModal());
document.querySelector('#close-feedback').addEventListener('click',() => dialog.close());
document.querySelector('#feedback-form').addEventListener('submit',event => {
  event.preventDefault();
  const kind = document.querySelector('#feedback-kind').value;
  const title = document.querySelector('#feedback-title-input').value.trim();
  const app = document.querySelector('#feedback-app').value;
  const description = document.querySelector('#feedback-body').value.trim();
  if (!title || !description) return;
  const query = new URLSearchParams({title:`[${app}] ${title}`,body:`Art: ${kind === 'bug' ? 'Fehler' : 'Feature-Wunsch'}\nProgramm: ${app}\nVersion: ${manifest?.version || 'bitte ergänzen'}\nBetriebssystem: ${platform === 'windows' ? 'Windows' : 'macOS'}\n\n${description}\n\nBitte ergänzen: genaue Programmversion, Betriebssystemversion und (bei VST3) DAW.`});
  window.location.assign(`https://github.com/TheBegger/zinavis-crew/issues/new?${query}`);
});
checkUpdates();
