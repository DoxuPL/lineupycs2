import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Wklej dane ze swojego projektu Supabase. Instrukcja jest w README.md.
const SUPABASE_URL = 'https://nnrlobdbmeufaorlfnvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucmxvYmRibWV1ZmFvcmxmbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzAzMjcsImV4cCI6MjEwMjcwNjMyN30.nVauM5wXwexVNhiUor_PIpLiMyy3eJK4D672jkWM9ok';
const configured = !SUPABASE_URL.startsWith('TWOJ_') && !SUPABASE_ANON_KEY.startsWith('TWOJ_');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const maps = [
  { name: 'Cache', color: '#3c5d50' }, { name: 'Inferno', color: '#804139' }, { name: 'Mirage', color: '#87633e' },
  { name: 'Nuke', color: '#37576d' }, { name: 'Dust II', color: '#856748' }, { name: 'Ancient', color: '#415539' }, { name: 'Anubis', color: '#3b6970' }
];
let selectedMap = null, selectedType = 'all', lineups = [];
const $ = (selector) => document.querySelector(selector);
const modal = $('#lineup-modal');

function renderMaps() {
  $('#map-grid').innerHTML = maps.map((map, i) => `<button class="map-card" data-map="${map.name}" style="--map-color:${map.color}"><span>0${i + 1}</span><h3>${map.name}</h3></button>`).join('');
  document.querySelectorAll('.map-card').forEach(button => button.onclick = () => selectMap(button.dataset.map));
  $('#map-select').innerHTML = maps.map(map => `<option>${map.name}</option>`).join('');
}
function selectMap(map) { selectedMap = map; $('#lineups-label').textContent = map.toUpperCase(); $('#lineups-title').textContent = `Lineupy — ${map}`; $('#clear-filter').hidden = false; renderLineups(); document.querySelector('#lineupy').scrollIntoView({ behavior: 'smooth' }); }
function renderLineups() {
  const visible = lineups.filter(x => (!selectedMap || x.map === selectedMap) && (selectedType === 'all' || x.type === selectedType));
  const grid = $('#lineup-grid'); grid.innerHTML = '';
  const template = $('#lineup-template');
  visible.forEach(lineup => { const node = template.content.cloneNode(true); node.querySelector('img').src = lineup.image_url; node.querySelector('img').alt = lineup.title; node.querySelector('.grenade').append(lineup.type); node.querySelector('.map-name').textContent = lineup.map; node.querySelector('h3').textContent = lineup.title; node.querySelector('p').textContent = lineup.description || 'Bez opisu'; grid.append(node); });
  $('#empty-state').hidden = visible.length > 0;
}
async function loadLineups() {
  if (!supabase) { renderLineups(); return; }
  const { data, error } = await supabase.from('lineups').select('*').order('created_at', { ascending: false });
  if (error) console.error(error); else { lineups = data; renderLineups(); }
}
function openModal() { $('#form-note').textContent = configured ? 'Zdjęcie zostanie przesłane do Supabase.' : 'Najpierw uzupełnij dane Supabase w pliku app.js.'; $('#form-note').classList.toggle('error', !configured); modal.showModal(); }
$('#open-modal').onclick = openModal; $('#empty-add').onclick = openModal; $('#close-modal').onclick = () => modal.close();
$('#lineup-form').image.onchange = e => $('#file-name').textContent = e.target.files[0]?.name || 'Wybierz plik JPG, PNG lub WEBP';
$('#clear-filter').onclick = () => { selectedMap = null; $('#lineups-label').textContent = 'WSZYSTKIE MAPY'; $('#lineups-title').textContent = 'Najnowsze lineupy'; $('#clear-filter').hidden = true; renderLineups(); };
document.querySelectorAll('.filter').forEach(button => button.onclick = () => { selectedType = button.dataset.type; document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); renderLineups(); });
$('#lineup-form').onsubmit = async (event) => {
  event.preventDefault(); if (!supabase) return;
  const form = new FormData(event.currentTarget), image = form.get('image'), submit = event.currentTarget.querySelector('[type=submit]');
  submit.disabled = true; submit.textContent = 'Zapisywanie...';
  const path = `${crypto.randomUUID()}.${image.name.split('.').pop()}`;
  const { error: uploadError } = await supabase.storage.from('lineup-images').upload(path, image);
  if (uploadError) return finish(uploadError.message);
  const { data: url } = supabase.storage.from('lineup-images').getPublicUrl(path);
  const { error } = await supabase.from('lineups').insert({ title: form.get('title'), map: form.get('map'), type: form.get('type'), description: form.get('description'), image_url: url.publicUrl });
  if (error) return finish(error.message);
  modal.close(); event.currentTarget.reset(); $('#file-name').textContent = 'Wybierz plik JPG, PNG lub WEBP'; await loadLineups(); finish();
  function finish(message) { submit.disabled = false; submit.textContent = 'Zapisz lineup'; if (message) { $('#form-note').textContent = message; $('#form-note').classList.add('error'); } }
};
renderMaps(); loadLineups();
