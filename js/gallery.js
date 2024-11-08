

let currentIndex = 0;

function updateGallery() {
    const galleryImage = document.getElementById('galleryImage');
    const imageLink = document.getElementById('imageLink');
    
    galleryImage.src = images[currentIndex];
    imageLink.href = images[currentIndex]; // Set link to current image
    
    updateDots();
}

function changeImage(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length; // Wrap around
    updateGallery();
}

function currentImage(index) {
    currentIndex = index;
    updateGallery();
}

function createDots() {
    const dotsContainer = document.getElementById('dotsContainer');
    dotsContainer.innerHTML = ''; // Clear any existing dots

    images.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.onclick = () => currentImage(index);
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// Initialize the gallery and dots on page load
document.addEventListener('DOMContentLoaded', () => {
    createDots();
    updateGallery();
});
