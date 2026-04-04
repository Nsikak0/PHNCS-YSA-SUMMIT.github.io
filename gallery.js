/* Gallery lightbox functionality */

document.addEventListener('DOMContentLoaded', function () {
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

    // Set total images count
    totalSpan.textContent = galleryImages.length;

    // Function to open lightbox
    function openLightbox(index) {
        currentIndex = index;
        const imageSrc = galleryImages[index].src;
        const imageAlt = galleryImages[index].alt;

        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        currentSpan.textContent = index + 1;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Function to close lightbox
    function closeLightbox() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
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
    closeBtn.addEventListener('click', closeLightbox);

    // Next/Previous button clicks
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);

    // Close when clicking outside the image
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeLightbox();
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
                closeLightbox();
            }
        }
    });
});
