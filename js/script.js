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

            const subject = `[프로젝트 문의] ${company} - ${name}`;
            
            // 폼스프리(Formspree) 백그라운드 전송(AJAX) 방식으로 완벽 교체! (아웃룩 팝업 제거)
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = '전송 중...';
            submitBtn.disabled = true;

            fetch("https://formspree.io/f/xgonbjao", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "_subject": subject,      // Formspree 공식 제목 필드
                    "_replyto": email,        // 방문자 이메일 주소 (메일에서 바로 '답장' 누르면 고객에게 가게 함)
                    "회사명": company,
                    "성함": name,
                    "연락처": `${phone1}-${phone2}-${phone3}`,
                    "유솔루션을_알게_된_경로": pathInfo,
                    "마케팅_정보_수신_동의": marketing,
                    "문의내용": message
                })
            })
            .then(response => {
                if (response.ok) {
                    alert("문의가 정상적으로 접수되었습니다!\n검토 후 입력해주신 연락처로 빠르게 회신드리겠습니다.");
                    
                    const modal = document.getElementById('contactModal');
                    if (modal) {
                        modal.classList.remove('active');
                        setTimeout(() => { modal.style.display = 'none'; }, 300);
                        document.body.style.overflow = '';
                    }
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert("오류가 발생했습니다: " + data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert("전송 중 문제가 발생했습니다. 잠시 후 시도해주세요.");
                        }
                    });
                }
            })
            .catch(error => {
                alert("네트워크 통신에 실패했습니다. 다시 한 번 시도해주세요.");
                console.error("Formspree Error:", error);
            })
            .finally(() => {
                // 버튼 상태 원래대로 복구
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }
});
