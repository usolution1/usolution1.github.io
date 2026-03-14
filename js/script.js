document.addEventListener('DOMContentLoaded', () => {

    /* --- Sticky Header & Menu Color Swap --- */
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* --- Mobile Navigation Toggle --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    let isMenuOpen = false;

    menuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        mobileNav.classList.toggle('open', isMenuOpen);
        
        // Transform hamburger icon to X (simplified toggle)
        const spans = menuToggle.querySelectorAll('span');
        if (isMenuOpen) {
            spans[0].style.transform = 'translateY(8px) rotate(45deg)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
            spans.forEach(s => s.style.background = '#0a1930');
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            spans.forEach(s => s.style.background = header.classList.contains('scrolled') ? '#0a1930' : '#fff');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.click();
        });
    });

    /* --- Counter Animation Integration --- */
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // The lower the slower

    const startCounters = (element) => {
        const updateCount = () => {
            const target = +element.getAttribute('data-target');
            const count = +element.innerText;
            const inc = target / speed;

            if (count < target) {
                element.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                // Add '+' for effect
                element.innerText = target + (target > 50 ? '+' : '');
            }
        };
        updateCount();
    }

    const observerOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters(entry.target);
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    /* --- Interactive Tags Filtering (Visual Only for Demo) --- */
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // Subtle fade animation effect on grid to simulate filtering
            const grid = document.querySelector('.insight-grid');
            grid.style.opacity = 0;
            setTimeout(() => {
                grid.style.opacity = 1;
                grid.style.transition = 'opacity 0.5s ease';
            }, 300);
        });
    });

    /* --- Modal Handling --- */
    const modal = document.getElementById('contactModal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.querySelector('.modal-close');

    if (modal) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                // Slight delay to allow display flex to apply before opacity transition
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
