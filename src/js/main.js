import particles from 'particles';
import RadarChart from 'RadarChart';
import Bubbles from 'Bubbles';
import Bar from 'Bar';
import BCel from 'bcel';
import * as Q from 'rkgttr-q';
import * as Helpers from 'Helpers';
import Publisher from 'rkgttr-publisher';
import 'rkgttr-matchespolyfill';

// fake percentage thing
import Prng from 'rkgttr-prng';
function percentage(data, seed) {
  let prng = new Prng(seed);
  data.forEach(d => (d.value = prng.gen()));
  let r = 100 / data.map(d => d.value).reduce((a, b) => a + b);
  data.forEach(d => (d.value *= r));
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

particles();

Publisher.on('show-details', showDetails);

function showDetails(data, brand='', color='#FF5C6A') {
  Q.one('.breadcrumb').appendChild(BCel(`${brand}${data.axis}`));
  Q.one(
    '.details h2'
  ).innerHTML = `${brand}${data.axis} <sub>(${data.value} hits)</sub>`;
  Q.one('.graph').classList.add('hide');
  Q.one('.graphs').innerHTML = '';
  data.profil.forEach(profil => {
    percentage(profil.values, data.value);
    Bar(profil, color);
  });
  Bubbles(data.syntagmes, color);
  delay(300).then(() => {
    Q.one('.graph').classList.remove('hide');
    Q.one('.graph').classList.remove('shown');
    Q.one('.details').classList.add('shown');
  });
}

function hideForm() {
  return new Promise(resolve => {
    Q.one('.request').classList.add('hidden');
    Q.one('.request').classList.remove('hide');
    Q.one('.preloader-container').classList.add('shown');
    Q.one('.preloader').classList.add('loading');
    resolve();
  });
}

function getData(url) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open('GET', `data/${Q.one('#request').value.toLowerCase()}.json`);

    req.onload = () => {
      if (req.status == 200) {
        resolve(JSON.parse(req.response));
      } else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = () => {
      reject(Error('Network Error'));
    };
    req.send();
  });
}

document.addEventListener(
  'click',
  Helpers.delegate('.clickable', e => {
    Q.all('.graph, .details').forEach(el => el.classList.add('hide'));
    Q.one('.breadcrumb').classList.remove('shown');
    Q.one('.logo').classList.remove('clickable');
    delay(300).then(() => {
      Q.all('.graph, .details').forEach(el => {
        el.classList.remove('shown');
        el.classList.remove('hide');
      });
      Q.one('.breadcrumb').innerHTML = '';
      Q.one('.request').classList.remove('hidden');
      Q.one('.request').classList.add('show');
      delay(300).then(() => {
        Q.one('.request').classList.remove('show');
      });
    });
  })
);

document.addEventListener(
  'click',
  Helpers.delegate('.breadcrumb button:not(:last-child)', e => {
    Q.all('.details').forEach(el => el.classList.add('hide'));
    Q.one('.breadcrumb button:last-child').parentNode.removeChild(
      Q.one('.breadcrumb button:last-child')
    );
    delay(300).then(() => {
      Q.all('.details').forEach(el => {
        el.classList.remove('shown');
        el.classList.remove('hide');
      });
      Q.one('.graph').classList.add('shown');
    });
  })
);

function initGraph(response) {
  Q.one('.breadcrumb').appendChild(BCel(Q.one('#request').value));
  Q.one('.breadcrumb').classList.add('shown');
  Q.one('.logo').classList.add('clickable');
  delay(300).then(() => {
    Q.one('.preloader').classList.remove('loading');
    Q.one('.graph').classList.add('shown');
    Q.one('.preloader-container').classList.remove('shown');
    let radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 0.5,
      levels: 5,
      roundStrokes: true,
      opacityArea: response.length > 1 ? .1 : 1,
      legend: response.length > 1 ? Q.one('#request').value.split('+') : [],
    };
    RadarChart('.graph', response, radarChartOptions);
  });
}

Q.one('#request').focus();
Q.all('.request [type=checkbox]').forEach(cb => {
  cb.addEventListener('change', e => {
    let checked = Q.all('.request [type=checkbox]').some(x => x.checked);
    if (!checked) {
      e.target.checked = true;
    }
  });
});
Q.one('.request').addEventListener('submit', e => {
  e.preventDefault();
  e.stopPropagation();
  Q.one('.request').classList.add('hide');
  delay(350)
    .then(hideForm)
    .then(() => delay(2000))
    .then(getData)
    .then(initGraph);
});

let margin = { top: 100, right: 100, bottom: 100, left: 100 },
  width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
  height = Math.min(
    width,
    window.innerHeight - margin.top - margin.bottom - 20
  );
