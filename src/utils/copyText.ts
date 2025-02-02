const copyFallback = (text: string): void => {
  // Fallback for older browsers/non-HTTPS
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

export const copyText = async (text: string): Promise<void> => {
  if (!navigator.clipboard) {
    return copyFallback(text);
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    copyFallback(text);
  }
}
