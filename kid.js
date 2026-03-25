fetch('/save-avatar', {
  method: 'POST',
  body: JSON.stringify({ avatar: selectedAvatar })
});