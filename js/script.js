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
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    let isMenuOpen = false;

    function toggleMenu(forceClose = false) {
        if (forceClose) {
            isMenuOpen = false;
        } else {
            isMenuOpen = !isMenuOpen;
        }
        
        mobileNav.classList.toggle('open', isMenuOpen);
        menuToggle.classList.toggle('open', isMenuOpen);
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.toggle('open', isMenuOpen);
        }
        
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = '';
        }
    }

    menuToggle.addEventListener('click', () => toggleMenu());

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', () => toggleMenu(true));
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu(true);
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

    /* --- Form Submission Handling (Fix Encoding) --- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fd = new FormData(contactForm);
            const company = fd.get('회사명') || '';
            const name = fd.get('성함') || '';
            const phone1 = fd.get('연락처1') || '';
            const phone2 = fd.get('연락처2') || '';
            const phone3 = fd.get('연락처3') || '';
            const email = fd.get('이메일') || '';
            const message = fd.get('문의내용') || '';
            const path = fd.get('알게된경로') || '선택안함';
            const pathOther = fd.get('기타입력') || '';
            const marketing = fd.get('마케팅동의') ? '동의' : '미동의';
            
            let pathInfo = path;
            if (path === '기타' && pathOther) {
                pathInfo += ` (${pathOther})`;
            }

            // 방문자 화면에 아웃룩 창이 뜨지 않도록 FormSubmit 백그라운드 전송(AJAX) 방식 적용
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = '전송 중...';
            submitBtn.disabled = true;

            const payload = {
                _subject: `[유솔루션 홈페이지 문의] ${company} - ${name}`,
                _replyto: email,      // 사용자 이메일로 바로 회신 가능
                _captcha: "false",    // 홈페이지 방문자(불특정 다수)에게 봇 방지 인증(캡챠)이 뜨지 않게 차단
                회사명: company,
                성함: name,
                연락처: `${phone1}-${phone2}-${phone3}`,
                답변받을이메일: email,
                알게된경로: pathInfo,
                마케팅수신동의: marketing,
                문의내용: message
            };

            const subject = `[프로젝트 문의] ${company} - ${name}`;
            const body = `회사명: ${company}
성함: ${name}
연락처: ${phone1}-${phone2}-${phone3}
이메일: ${email}
유솔루션을 알게 된 경로: ${pathInfo}
마케팅 정보 수신 동의: ${marketing}

[문의내용]
${message}`;

            // 네이버 등 특정 국내 포털 메일 스팸 전면 차단 이슈로, 모든 환경에서 안정적으로 전송을 보장하는 아웃룩/메일앱(한글 인코딩 처리) 방식으로 원상 복구합니다.
            const mailtoLink = `mailto:syk434@naver.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;

            const modal = document.getElementById('contactModal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => { modal.style.display = 'none'; }, 300);
                document.body.style.overflow = '';
            }
            contactForm.reset();
            
            // 버튼 상태 복구
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
    }
});
