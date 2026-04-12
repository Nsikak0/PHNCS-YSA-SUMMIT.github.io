/* Gallery lightbox functionality */

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const navToggle = document.getElementById('nav-toggle');
    const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const homeSection = document.querySelector('#home');

    // Keep section anchor alignment accurate for the current fixed header height.
    function updateHeaderOffset() {
        if (!header) {
            return;
        }

        const headerHeight = Math.ceil(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--header-offset', `${headerHeight + 16}px`);
    }

    updateHeaderOffset();
    window.addEventListener('resize', updateHeaderOffset);
    window.addEventListener('load', updateHeaderOffset);

    function scrollToHome(behavior = 'smooth') {
        if (!homeSection || !header) {
            return;
        }

        updateHeaderOffset();
        const top = homeSection.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 12);
        window.scrollTo({ top, behavior });
    }

    sectionLinks.forEach((link) => {
        link.addEventListener('click', function (event) {
            const targetId = link.getAttribute('href');
            if (!targetId) {
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (!targetSection || !header) {
                return;
            }

            event.preventDefault();
            updateHeaderOffset();

            const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 12);
            window.scrollTo({ top: targetTop, behavior: 'smooth' });

            if (navToggle) {
                navToggle.checked = false;
            }

            history.replaceState(null, '', targetId);
        });
    });

    // Create modal HTML structure
    const modalHTML = `
        <div id="lightbox-modal" class="lightbox-modal">
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-image" src="" alt="Full view">
            <div class="lightbox-nav">
                <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
                <button class="lightbox-next" aria-label="Next image">&#10095;</button>
            </div>
            <div class="lightbox-counter"><span class="lightbox-current">1</span> / <span class="lightbox-total">1</span></div>
        </div>
    `;

    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get gallery images
    const galleryImages = document.querySelectorAll('.gallery-img');
    const modal = document.getElementById('lightbox-modal');
    const modalImage = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const currentSpan = document.querySelector('.lightbox-current');
    const totalSpan = document.querySelector('.lightbox-total');

    let currentIndex = 0;
    let lightboxHistoryActive = false;
    // Track touch positions so horizontal swipes can change images on mobile.
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 50;

    // Set total images count
    totalSpan.textContent = galleryImages.length;

    // Function to open lightbox
    function openLightbox(index) {
        const isClosed = modal.style.display !== 'flex';
        currentIndex = index;
        const imageSrc = galleryImages[index].src;
        const imageAlt = galleryImages[index].alt;

        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        currentSpan.textContent = index + 1;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        if (isClosed) {
            history.pushState({ lightbox: true }, '', location.href);
            lightboxHistoryActive = true;
        }
    }

    // Function to close lightbox
    function closeLightbox() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Prefer browser back so the mobile return button closes viewer naturally.
    function requestCloseLightbox() {
        if (lightboxHistoryActive) {
            history.back();
            return;
        }

        closeLightbox();
        scrollToHome('smooth');
    }

    // Function to show next image
    function nextImage() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Function to show previous image
    function prevImage() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }

    // Add click event to all gallery images
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function () {
            openLightbox(index);
        });
        img.style.cursor = 'pointer'; // Change cursor to pointer
    });

    // Close button click
    closeBtn.addEventListener('click', requestCloseLightbox);

    // Next/Previous button clicks
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);

    // Close when clicking outside the image
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            requestCloseLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (event) {
        if (modal.style.display === 'flex') {
            if (event.key === 'ArrowRight') {
                nextImage();
            } else if (event.key === 'ArrowLeft') {
                prevImage();
            } else if (event.key === 'Escape') {
                requestCloseLightbox();
            }
        }
    });

    // Mobile/browser return button: exit photo viewer and go back to the main page.
    window.addEventListener('popstate', function () {
        if (modal.style.display === 'flex') {
            lightboxHistoryActive = false;
            closeLightbox();
            scrollToHome('smooth');
        }
    });

    // Save the starting touch point when the user begins a swipe.
    modal.addEventListener('touchstart', function (event) {
        if (event.target.closest('.lightbox-prev, .lightbox-next, .lightbox-close')) {
            return;
        }

        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    // Change images only for clear horizontal swipes, not vertical scrolling.
    modal.addEventListener('touchend', function (event) {
        if (event.target.closest('.lightbox-prev, .lightbox-next, .lightbox-close')) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) < minSwipeDistance || Math.abs(deltaX) <= Math.abs(deltaY)) {
            return;
        }

        if (deltaX < 0) {
            nextImage();
        } else {
            prevImage();
        }
    }, { passive: true });
});
