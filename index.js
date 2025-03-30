// Three.js Background Animation
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let mouseZ = 0;
let isMouseDown = false;
let scrollY = 0;

function createHeartShape() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    
    // Create a more detailed heart shape
    shape.moveTo(x, y);
    // Left curve
    shape.bezierCurveTo(
        x - 3, y - 3,  // control point 1
        x - 3, y + 3,  // control point 2
        x, y + 6       // end point
    );
    // Right curve
    shape.bezierCurveTo(
        x + 3, y + 3,  // control point 1
        x + 3, y - 3,  // control point 2
        x, y          // end point
    );
    
    return shape;
}

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('hero-canvas').appendChild(renderer.domElement);

    // Create heart shape
    const heartShape = createHeartShape();
    const geometry = new THREE.ShapeGeometry(heartShape);

    // Create multiple hearts with different colors and sizes
    const heartCount = 150;
    const hearts = new THREE.Group();
    
    const colors = [
        0xef4444, // red
        0xec4899, // pink
        0xdb2777, // rose
        0xbe185d  // deep rose
    ];
    
    for (let i = 0; i < heartCount; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.8
        });

        const heart = new THREE.Mesh(geometry, material);
        heart.position.set(
            THREE.MathUtils.randFloatSpread(600),
            THREE.MathUtils.randFloatSpread(600),
            THREE.MathUtils.randFloatSpread(600)
        );
        
        // Random rotation and scale
        heart.rotation.x = Math.random() * Math.PI;
        heart.rotation.y = Math.random() * Math.PI;
        const scale = 1 + Math.random() * 2;
        heart.scale.set(scale, scale, scale);
        
        // Add custom properties for animation
        heart.userData = {
            originalScale: scale,
            pulseSpeed: 0.5 + Math.random() * 0.5,
            pulseOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.2 + Math.random() * 0.3,
            swaySpeed: 0.02 + Math.random() * 0.03,
            originalColor: material.color.clone(),
            targetColor: material.color.clone(),
            colorTransitionSpeed: 0.05 + Math.random() * 0.05,
            rotationSpeed: 0.001 + Math.random() * 0.002
        };
        
        hearts.add(heart);
    }

    scene.add(hearts);
    particles = hearts;
    camera.position.z = 300;

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('wheel', onMouseWheel);
    window.addEventListener('scroll', onScroll);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown() {
    isMouseDown = true;
}

function onMouseUp() {
    isMouseDown = false;
}

function onMouseWheel(event) {
    mouseZ += event.deltaY * 0.01;
    mouseZ = Math.max(-5, Math.min(5, mouseZ));
}

function onScroll() {
    scrollY = window.scrollY;
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    particles.children.forEach(heart => {
        // Base rotation
        heart.rotation.x += heart.userData.rotationSpeed;
        heart.rotation.y += heart.userData.rotationSpeed;

        // Pulsing effect
        const pulse = Math.sin(time * heart.userData.pulseSpeed + heart.userData.pulseOffset) * 0.2 + 1;
        heart.scale.setScalar(heart.userData.originalScale * pulse);

        // Floating movement
        heart.position.y += heart.userData.floatSpeed;
        
        // Swaying movement
        heart.position.x += Math.sin(time + heart.position.y) * heart.userData.swaySpeed;
        
        // Mouse interaction
        const dx = heart.position.x - mouseX * 200;
        const dy = heart.position.y - mouseY * 200;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            // Repel from mouse
            heart.position.x += dx * 0.02;
            heart.position.y += dy * 0.02;
            
            // Color change on hover
            if (isMouseDown) {
                heart.userData.targetColor.setHex(0xff0000);
            } else {
                heart.userData.targetColor.copy(heart.userData.originalColor);
            }
        }
        
        // Smooth color transition
        heart.material.color.lerp(heart.userData.targetColor, heart.userData.colorTransitionSpeed);
        
        // Z-depth effect with mouse wheel
        heart.position.z += (mouseZ - heart.position.z) * 0.1;
        
        // Reset position when heart goes off screen
        if (heart.position.y > 400) {
            heart.position.y = -400;
            heart.position.x = THREE.MathUtils.randFloatSpread(800);
            heart.position.z = THREE.MathUtils.randFloatSpread(800);
        }
    });

    // Camera movement
    camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const count = parseInt(element.innerText);
    const increment = target / 200;

    if (count < target) {
        element.innerText = Math.ceil(count + increment);
        setTimeout(() => animateCounter(element), 1);
    } else {
        element.innerText = target;
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js
    initThreeJS();
    animate();

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Add window resize listener
    window.addEventListener('resize', onWindowResize);

    // Animate counters when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => animateCounter(counter));
                observer.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.grid-cols-3').forEach(section => {
        observer.observe(section);
    });

    // Form submission handling
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(signupForm);
            const userData = Object.fromEntries(formData.entries());
            
            // Show success message with animation
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full opacity-0 transition-all duration-500';
            successMessage.textContent = 'Profile created successfully! Welcome to New Era.';
            document.body.appendChild(successMessage);
            
            // Trigger animation
            setTimeout(() => {
                successMessage.classList.remove('translate-x-full', 'opacity-0');
            }, 100);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successMessage.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => successMessage.remove(), 500);
            }, 3000);
            
            signupForm.reset();
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effect to all interactive elements
    document.querySelectorAll('button, input, select, textarea').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('transform', 'scale-105');
        });
        element.addEventListener('mouseleave', () => {
            element.classList.remove('transform', 'scale-105');
        });
    });

    // Add scroll-based navbar background
    const navbar = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/90', 'shadow-md');
        } else {
            navbar.classList.remove('bg-white/90', 'shadow-md');
        }
    });
});
