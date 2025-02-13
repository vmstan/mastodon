import Rails from '@rails/ujs';

export function start() {
  require.context('../images/', true, /\.(jpg|png|svg)$/);

  try {
    Rails.start();
  } catch {
    // If called twice
  }
}

function animate(ctx, snowflakes, canvas, maxFlakes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Add new snowflake if we haven't reached the maximum
  if (snowflakes.length < maxFlakes && Math.random() < 0.05) {  // 5% chance each frame to add a new flake
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: 0,  // Start from top
      radius: Math.random() * 7 + 3,
      speed: Math.random() * 0.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.4
    });
  }

  snowflakes.forEach(flake => {
    // Draw snowflake shape
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(flake.x, flake.y);
      ctx.lineTo(
        flake.x + Math.cos(Math.PI * 2 * i / 6) * flake.radius,
        flake.y + Math.sin(Math.PI * 2 * i / 6) * flake.radius
      );
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Update position with gentler movement
    flake.x += Math.sin(flake.y / 50) * 0.3;
    flake.y += flake.speed * 0.5;

    if (flake.y > canvas.height) {
      flake.y = 0;
      flake.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(() => animate(ctx, snowflakes, canvas, maxFlakes));
}

function animateConfetti(ctx, confetti, canvas, maxPieces) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Add new confetti if we haven't reached the maximum
  if (confetti.length < maxPieces && Math.random() < 0.05) {
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];  // Brighter colors
    confetti.push({
      x: Math.random() * canvas.width,
      y: 0,
      width: Math.random() * 10 + 8,
      height: Math.random() * 6 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.4,
      opacity: Math.random() * 0.4 + 0.6,
      wobble: Math.random() * 2 * Math.PI
    });
  }

  confetti.forEach(piece => {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);

    // Add 3D-like effect with gradient
    const gradient = ctx.createLinearGradient(-piece.width/2, 0, piece.width/2, 0);
    gradient.addColorStop(0, piece.color);
    gradient.addColorStop(0.5, piece.color);
    gradient.addColorStop(1, shadeColor(piece.color, -20));  // Darker shade

    ctx.fillStyle = gradient;
    ctx.globalAlpha = piece.opacity;

    // Draw rectangular confetti
    ctx.fillRect(-piece.width/2, -piece.height/2, piece.width, piece.height);

    ctx.restore();

    // More dynamic movement
    piece.wobble += 0.05;
    piece.x += Math.sin(piece.wobble) * 1.5;  // Wider side-to-side
    piece.y += piece.speed;
    piece.rotation += piece.rotationSpeed;

    // Reset when out of view
    if (piece.y > canvas.height) {
      piece.y = -20;  // Start slightly above viewport
      piece.x = Math.random() * canvas.width;
      piece.wobble = Math.random() * 2 * Math.PI;
    }
  });

  requestAnimationFrame(() => animateConfetti(ctx, confetti, canvas, maxPieces));
}

// Helper function to darken colors for 3D effect
function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if reduced motion is enabled
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Don't create snow effect if reduced motion is preferred
  }

  const currentDate = new Date();
  const isNewYearsEve = (currentDate.getMonth() === 11 && currentDate.getDate() === 31) || (currentDate.getMonth() === 0 && currentDate.getDate() === 1);
  const isChristmasSeason = currentDate.getMonth() === 11 && currentDate.getDate() >= 22 && currentDate.getDate() <= 31;

  if (isChristmasSeason || isNewYearsEve) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('snow');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '80px';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '9999';
    wrapper.style.maskImage = 'linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 35px)';
    wrapper.style.webkitMaskImage = 'linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 35px)';
    wrapper.style.transition = 'opacity 0.3s ease-in-out';

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    canvas.width = window.innerWidth * 2;
    canvas.height = 160;

    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper);

    const ctx = canvas.getContext('2d');

    if (isNewYearsEve) {
      const confetti = [];
      const maxConfetti = window.innerWidth <= 800 ? 35 : 70;
      animateConfetti(ctx, confetti, canvas, maxConfetti);
    } else {
      const snowflakes = [];
      const maxFlakes = getMaxFlakes();
      animate(ctx, snowflakes, canvas, maxFlakes);
    }

    // Adjust max flakes based on viewport width
    const getMaxFlakes = () => {
      return window.innerWidth <= 800 ? 25 : 50;
    };

    // Update maxFlakes on resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = 160;
      maxFlakes = getMaxFlakes();

      // Remove excess snowflakes if viewport becomes smaller
      if (snowflakes.length > maxFlakes) {
        snowflakes.length = maxFlakes;
      }
    });

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        wrapper.style.opacity = Math.max(0, 1 - (scrollTop - 100) / 200);
      } else {
        wrapper.style.opacity = '1';
      }
    });
  }
});
