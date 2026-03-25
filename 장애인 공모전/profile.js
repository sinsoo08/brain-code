/* ── 모달 열기/닫기 ── */
function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    // 다음 프레임에 클래스 추가 → animation 재생
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('open');
    modal.style.display = 'none';
}

function handleBackdrop(e) {
    if (e.target === document.getElementById('modal')) closeModal();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

/* ── 탭 전환 ── */
function switchTab(tabId, btnEl) {
    // 모든 패널 숨기기
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('tab-' + tabId).classList.add('active');
    btnEl.classList.add('active');
}

/* ── 세그먼트 컨트롤 ── */
function selectSeg(btnEl) {
    const group = btnEl.closest('.seg-control');
    group.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
}