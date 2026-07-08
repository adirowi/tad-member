document.getElementById('download-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nickname = document.getElementById('nickname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const errorAlert = document.getElementById('alert-error');
  const successAlert = document.getElementById('alert-success');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = document.getElementById('btn-spinner');

  // Reset alerts
  errorAlert.style.display = 'none';
  successAlert.style.display = 'none';

  // UI loading state
  submitBtn.disabled = true;
  spinner.style.display = 'inline-block';

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname, phone_number: phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch the document. Please verify your details.');
    }

    // Success state
    successAlert.textContent = 'Redirecting to your download...';
    successAlert.style.display = 'block';

    // Trigger the file download in a new tab
    const anchor = document.createElement('a');
    anchor.href = data.downloadUrl;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

  } catch (error) {
    errorAlert.textContent = error.message;
    errorAlert.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    spinner.style.display = 'none';
  }
});
