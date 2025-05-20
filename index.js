// Three.js Background Animation
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let mouseZ = 0;
let isMouseDown = false;
let scrollY = 0;

// 3D Heart Animation
let heart;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

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
    // Floating Hearts Animation
    const floatingHearts = document.getElementById('floatingHearts');
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // Add random variations
        const variations = ['small', 'large', 'red', 'pink', 'rose', 'purple', 'orange', 'gold', 'rainbow'];
        const randomVariation = variations[Math.floor(Math.random() * variations.length)];
        heart.classList.add(randomVariation);
        
        // Random position and timing
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 10 + 8) + 's';
        heart.style.animationDelay = (Math.random() * 2) + 's';
        heart.style.opacity = Math.random() * 0.5 + 0.3;
        
        // Random rotation and scale
        const scale = Math.random() * 0.5 + 0.5;
        const rotation = Math.random() * 360;
        heart.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        
        // Add interactive features
        heart.addEventListener('mouseover', () => {
            heart.style.transform = `scale(1.5) rotate(${rotation}deg)`;
            heart.style.filter = 'brightness(1.2)';
        });
        
        heart.addEventListener('mouseout', () => {
            heart.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            heart.style.filter = '';
        });
        
        heart.addEventListener('click', () => {
            heart.classList.add('clicked');
            // Create mini hearts explosion
            for(let i = 0; i < 5; i++) {
                createMiniHeart(heart);
            }
            // Remove the clicked heart after animation
            setTimeout(() => heart.remove(), 500);
        });
        
        floatingHearts.appendChild(heart);
        
        // Remove heart after animation completes
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }
    
    function createMiniHeart(parentHeart) {
        const miniHeart = document.createElement('div');
        miniHeart.className = 'heart small';
        
        // Get parent heart's position
        const rect = parentHeart.getBoundingClientRect();
        miniHeart.style.left = rect.left + 'px';
        miniHeart.style.top = rect.top + 'px';
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Add explosion animation
        miniHeart.style.animation = `explode 0.5s ease-out forwards`;
        miniHeart.style.transform = `translate(${x}px, ${y}px)`;
        
        // Random color
        const colors = ['red', 'pink', 'rose', 'purple', 'orange', 'gold'];
        miniHeart.classList.add(colors[Math.floor(Math.random() * colors.length)]);
        
        floatingHearts.appendChild(miniHeart);
        
        // Remove mini heart after animation
        setTimeout(() => miniHeart.remove(), 500);
    }
    
    // Create hearts periodically
    setInterval(createHeart, 200);
    
    // Create initial batch of hearts
    for(let i = 0; i < 15; i++) {
        setTimeout(createHeart, i * 200);
    }

    // Add mouse trail effect
    let lastHeartTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastHeartTime > 50) { // Reduced from 100ms to 50ms for more frequent hearts
            const heart = document.createElement('div');
            heart.className = 'heart small';
            heart.style.left = e.clientX + 'px';
            heart.style.top = e.clientY + 'px';
            heart.style.animation = 'float-up 1.5s ease-out forwards'; // Reduced from 2s to 1.5s for faster animation
            heart.style.opacity = '0.4'; // Reduced opacity for a more subtle trail
            
            // Add random variations for more dynamic trail
            const scale = 0.3 + Math.random() * 0.4; // Smaller scale range for trail hearts
            const rotation = Math.random() * 360;
            heart.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            // Random color for trail hearts
            const colors = ['red', 'pink', 'rose', 'purple', 'orange', 'gold'];
            heart.classList.add(colors[Math.floor(Math.random() * colors.length)]);
            
            floatingHearts.appendChild(heart);
            setTimeout(() => heart.remove(), 1500); // Match the animation duration
            lastHeartTime = now;
        }
    });

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

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
            navbar.classList.add('bg-white/40', 'shadow-xl');
            navbar.classList.remove('bg-white/30', 'shadow-lg');
        } else {
            navbar.classList.remove('bg-white/40', 'shadow-xl');
            navbar.classList.add('bg-white/30', 'shadow-lg');
        }
    });

    // Add active state to navigation links
    const navLinks = document.querySelectorAll('#main-nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    function setActiveLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('text-red-600');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('text-red-600');
                        // Add active state animation
                        const icon = link.querySelector('i');
                        const text = link.querySelector('span');
                        icon.style.transform = 'scale(1.1)';
                        text.style.transform = 'translateX(3px)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', setActiveLink);
    window.addEventListener('load', setActiveLink);

    // Add hover effect to navigation links
    navLinks.forEach(link => {
        // Add ripple effect on click
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            ripple.classList.add('active');
            setTimeout(() => ripple.remove(), 600);
        });

        // Add hover animation
        link.addEventListener('mouseenter', () => {
            const icon = link.querySelector('i');
            const text = link.querySelector('span');
            
            // Add subtle bounce effect
            icon.style.transform = 'scale(1.2)';
            text.style.transform = 'translateX(5px)';
            
            // Add glow effect
            link.style.textShadow = '0 0 8px rgba(239, 68, 68, 0.3)';
        });

        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('i');
            const text = link.querySelector('span');
            
            // Reset transforms
            icon.style.transform = '';
            text.style.transform = '';
            
            // Remove glow effect
            link.style.textShadow = '';
        });
    });

    // FAQ Interaction
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.cursor-pointer');
        const answer = item.querySelector('.mt-4');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.maxHeight;
            
            // Close all other answers
            document.querySelectorAll('.mt-4').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.style.maxHeight = null;
                }
            });
            
            // Toggle current answer
            answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
        });
    });

    // Newsletter Subscription
    const newsletterForm = document.querySelector('.mt-16 form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full opacity-0 transition-all duration-500';
            successMessage.textContent = 'Thank you for subscribing to our newsletter!';
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
            
            newsletterForm.reset();
        });
    }

    // Article Link Hover Effect
    document.querySelectorAll('.text-gray-600.hover\\:text-red-600').forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.classList.add('transform', 'translate-x-1');
        });
        link.addEventListener('mouseleave', () => {
            link.classList.remove('transform', 'translate-x-1');
        });
    });

    // Article Modal Functionality
    const modal = document.getElementById('articleModal');
    const readMoreBtn = document.getElementById('readMoreBtn');
    const closeModalBtn = document.getElementById('closeModal');

    if (modal && readMoreBtn && closeModalBtn) {
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });

        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    // Menu Toggle Functionality
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('main-nav');
    const closeNav = document.getElementById('closeNav');
    const mainContent = document.querySelector('.ml-64');

    function toggleNav() {
        mainNav.classList.toggle('-translate-x-full');
        if (mainContent) {
            mainContent.classList.toggle('ml-64');
        }
        // Toggle menu icon
        const menuIcon = menuToggle.querySelector('i');
        if (mainNav.classList.contains('-translate-x-full')) {
            menuIcon.classList.replace('fa-times', 'fa-bars');
        } else {
            menuIcon.classList.replace('fa-bars', 'fa-times');
        }
    }

    menuToggle.addEventListener('click', toggleNav);
    closeNav.addEventListener('click', toggleNav);

    // Close navigation when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && !mainNav.classList.contains('-translate-x-full')) {
            toggleNav();
        }
    });

    // Close navigation when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mainNav.classList.contains('-translate-x-full')) {
            toggleNav();
        }
    });
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const html = document.documentElement;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    html.classList.add('dark');
    darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

darkModeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    
    // Toggle icon
    const icon = darkModeToggle.querySelector('i');
    if (isDark) {
        icon.classList.replace('fa-moon', 'fa-sun');
        icon.classList.add('text-yellow-300');
        icon.classList.remove('text-gray-800');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        icon.classList.remove('text-yellow-300');
        icon.classList.add('text-gray-800');
    }

    // Force a reflow to ensure styles are applied
    void html.offsetWidth;
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.remove('opacity-0', 'invisible', 'translate-y-4');
        backToTopButton.classList.add('opacity-100', 'visible', 'translate-y-0');
    } else {
        backToTopButton.classList.add('opacity-0', 'invisible', 'translate-y-4');
        backToTopButton.classList.remove('opacity-100', 'visible', 'translate-y-0');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

function initHeart() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('hero-canvas').appendChild(renderer.domElement);

    // Create heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    });

    const material = new THREE.MeshPhongMaterial({
        color: 0xff3366,
        specular: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });

    heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.5, 0.5, 0.5);
    scene.add(heart);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xff3366,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateHeart() {
    requestAnimationFrame(animateHeart);
    
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    heart.rotation.y += 0.01;
    heart.rotation.x += 0.01;
    heart.position.x += (targetX - heart.position.x) * 0.05;
    heart.position.y += (targetY - heart.position.y) * 0.05;

    renderer.render(scene, camera);
}

// Initialize heart animation
initHeart();
animateHeart();
