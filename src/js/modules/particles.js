import Prng from 'rkgttr-prng';
const particles = () => {
  const particleNumber = 15;
  const prng = new Prng();
  // number of particles (change it!)

  window.requestAnimFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
  // requesting the keyframes

  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  //context and id of canvas

  let w = window.innerWidth;
  let h = window.innerHeight;
  let h1 = 163;
  let h2 = 192;
  let a1 = Math.PI * prng.gen();
  prng.gen();
  prng.gen();
  let a2 = Math.PI * prng.gen();

  window.addEventListener('resize', e => {
    w = window.innerWidth;
    h = window.innerHeight;
    c.width = w;
    c.height = h;
  });
  //width and height of canvas

  c.width = w;
  c.height = h;

  let particles = [];
  // the particles storage

  for (let i = 0; i < particleNumber; i++) {
    setTimeout(function() {
      particles.push(new createParticle());
    }, i * 15);
    // add a particle (not all at once - setTimeout(); )
  }
  // adding 55 particles

  function createParticle() {
    this.x = Math.random() * c.width;
    this.y = Math.random() * c.height;
    // the x and y

    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 4 - 2;
    // the velocities

    this.size = 20;
    // the size

    this.life = Math.random() * 100;
    // the life

    let g = 'rgba(255, 255, 255,.5)';
    let gg = 'rgba(255, 255, 255,0.25)';
    let ggg = 'rgba(255, 255, 255,0.1)';
    let array = [g, gg, ggg];
    this.color = array[Math.floor(Math.random() * 3)];
    // making 3 mandatory colors (change it and fork - i might use that!)

    this.reset = function() {
      // the reset

      this.x = Math.random() * c.width;
      this.y = Math.random() * c.height;
      this.vx = Math.random() * 2 - 1;
      this.vy = Math.random() * 2 - 1;
      this.size = 20;
      this.life = Math.random() * 33;
    };
  }

  function draw() {
    requestAnimFrame(draw);
    // requesting the keyframes
    a1 += 0.0005;
    a2 += 0.0005;
    h1 = Math.sin(a1) * 255;
    h2 = Math.sin(a2) * 255;
    let grd = ctx.createLinearGradient(0, c.height, 0, 0);
    grd.addColorStop(0, `hsl(${~~h1}, 70%, 69%)`);
    grd.addColorStop(1, `hsl(${~~h2}, 55%, 67%)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, c.width, c.height);
    // the canvas

    for (let t = 0; t < particles.length; t++) {
      var p = particles[t];
      // using the particle we want to use

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.size * 0.25, 0, 2 * Math.PI);
      ctx.fill();
      // making the particle

      p.x += p.vx;
      p.y += p.vy;
      // velocities

      p.life *= 0.97;
      p.size *= 0.9699;
      // making the life and size decrease

      if (p.life < 1) {
        p.reset();
      }
      // reseting the particles when dead
    }
  }

  draw();
};
export { particles as default };
