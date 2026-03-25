const images = [
    "img1.png",
    "img2.png",
    "img3.png"
];

let current = 0;

function showSlide() {
    const screen = document.getElementById("screen");
    screen.style.opacity = 0;

    setTimeout(() => {
        screen.src = images[current];
        screen.style.opacity = 1;
    }, 150);
}

function nextSlide() {
    current = (current + 1) % images.length;
    showSlide();
}

function prevSlide() {
    current = (current - 1 + images.length) % images.length;
    showSlide();
}